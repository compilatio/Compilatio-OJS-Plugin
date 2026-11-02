"""Regression tests for the installation archives."""

import hashlib
import importlib.util
import subprocess
import tarfile
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('package_plugin', Path(__file__).parents[1] / 'package-plugin.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PackagePluginTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.output = self.root / 'dist'
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)

    def write_product(self, product):
        plugin_class = 'CompilatioPlugin' if product == 'compilatio' else 'LetimioPlugin'
        files = {
            'version.xml': f'<version><application>{product}</application><release>1.0.0.6</release>'
                           f'<class>{plugin_class}</class><type>plugins.generic</type></version>',
            f'{plugin_class}.php': '<?php',
            'config/product.php': f"<?php return ['id' => '{product}'];",
            'README.md': 'Installation instructions',
            'LICENSE': 'License text',
            'api/Client/Client.php': '<?php',
            'migration/Schema.php': '<?php',
            'locale/fr/locale.po': 'msgid "test"',
            'templates/settings.tpl': '<div></div>',
            'view/build/PlagiarismPanel.runtime.js': 'window.plugin = {};',
            'view/build/style.css': 'body {}',
            'api/test/ExampleTest.php': '<?php',
            'vendor/autoload.php': '<?php',
            'node_modules/example.js': 'development dependency',
            '.env': 'SECRET=not-for-publication',
            '.github/workflows/package.yml': 'workflow',
            'ci/test.py': 'development tool',
        }
        for name, content in files.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        subprocess.run(['git', '-C', str(self.root), 'add', '.'], check=True)

    def test_both_products_have_correct_root_and_no_development_files(self):
        for product in ('compilatio', 'letimio'):
            with self.subTest(product=product):
                self.write_product(product)
                archive = MODULE.package(self.root, self.output)
                self.assertEqual(archive.name, f'{product}-1.0.0.6.tar.gz')
                with tarfile.open(archive) as contents:
                    names = set(contents.getnames())
                self.assertIn(f'{product}/config/product.php', names)
                self.assertIn(f'{product}/view/build/PlagiarismPanel.runtime.js', names)
                self.assertIn(f'{product}/LICENSE', names)
                for name in names:
                    self.assertTrue(name.startswith(f'{product}/'))
                    self.assertNotIn('/api/test/', name)
                    self.assertNotIn('/vendor/', name)
                    self.assertNotIn('/node_modules/', name)
                    self.assertNotIn('/.env', name)
                    self.assertNotIn('/ci/', name)
                    self.assertNotIn('/.github/', name)
                for algorithm in ('md5', 'sha256'):
                    expected = hashlib.new(algorithm, archive.read_bytes()).hexdigest()
                    self.assertEqual(
                        Path(f'{archive}.{algorithm}').read_text(),
                        f'{expected}  {archive.name}\n',
                    )

    def test_missing_compiled_asset_fails(self):
        self.write_product('compilatio')
        (self.root / 'view/build/style.css').unlink()
        with self.assertRaisesRegex(ValueError, 'Invalid or empty package input'):
            MODULE.package(self.root, self.output)

    def test_missing_license_fails(self):
        self.write_product('compilatio')
        subprocess.run(['git', '-C', str(self.root), 'rm', '--cached', 'LICENSE'], check=True, capture_output=True)
        with self.assertRaisesRegex(ValueError, 'Missing tracked package inputs: LICENSE'):
            MODULE.package(self.root, self.output)

    def test_unknown_product_fails(self):
        self.write_product('unknown')
        with self.assertRaisesRegex(ValueError, 'Unsupported plugin identity'):
            MODULE.package(self.root, self.output)
