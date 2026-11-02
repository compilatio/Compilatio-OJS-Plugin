"""Regression tests for the generated product identities (no OJS required)."""
import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('prepare_product', Path(__file__).parents[1] / 'prepare-product.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PrepareProductTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.files = {
            'CompilatioPlugin.php': r'''<?php
/**
 * Copyright (c) 2026 Compilatio
 * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.
 */
namespace APP\plugins\generic\compilatio;
class CompilatioPlugin {}
$table = 'compilatio_documents';
$index = 'compilatio_documents_status';
$route = 'plugins/compilatio/documents';
$url = 'https://app.compilatio.net/api/';
$key = 'plugins.generic.compilatio.documents.sent';
''',
            'view/entry.ts': "window.pkpCompilatioDocuments; window.mountCompilatioDocumentApp; new Event('compilatio:document-app-ready');",
            'view/component.vue': "<div class='compilatio-document-app' :id='`compilatio-error-${id}`' />",
            'templates/settings.tpl': '{$compilatioSettingsApiUrl} compilatioSettingsPanelRoot window.mountCompilatioSettingsApp',
            'locale/fr/locale.po': 'msgid "plugins.generic.compilatio.documents.sent"',
            'vite.config.js': "name: 'CompilatioPlagiarismPanelRuntime'",
            'view/logo.vue': "import Logo from './compilatio_logo.vue'; const isCompilatio = product.id === 'compilatio';",
            'config/product.php': "<?php return ['id' => 'letimio', 'name' => 'Letimio'];",
            'version.xml': '<application>compilatio</application>',
            'view/build/old.js': 'window.pkpCompilatioDocuments',
        }
        for filename, content in self.files.items():
            path = self.root / filename
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)
        subprocess.run(['git', '-C', str(self.root), 'add', '.'], check=True)

    def test_compilatio_is_unchanged(self):
        MODULE.prepare(self.root, 'compilatio')
        for filename, content in self.files.items():
            self.assertEqual(content, (self.root / filename).read_text())

    def test_letimio_is_isolated_without_changing_service_or_logos(self):
        MODULE.prepare(self.root, 'letimio')
        self.assertFalse((self.root / 'CompilatioPlugin.php').exists())
        php = (self.root / 'LetimioPlugin.php').read_text()
        self.assertIn(' * Copyright (c) 2026 Letimio\n', php)
        self.assertNotIn(' * Copyright (c) 2026 Compilatio\n', php)
        self.assertIn(
            ' * Distributed under the GNU GPL v3 or later. For full terms see the file LICENSE.',
            php,
        )
        for value in ('generic\\letimio', 'class LetimioPlugin', 'letimio_documents',
                      'letimio_documents_status', 'plugins/letimio/documents',
                      'plugins.generic.letimio.documents.sent', 'https://app.compilatio.net/api/'):
            self.assertIn(value, php)
        for filename, expected in {
            'view/entry.ts': ('pkpLetimioDocuments', 'mountLetimioDocumentApp', 'letimio:document-app-ready'),
            'view/component.vue': ('letimio-document-app', 'letimio-error-'),
            'templates/settings.tpl': ('letimioSettingsApiUrl', 'letimioSettingsPanelRoot', 'mountLetimioSettingsApp'),
            'locale/fr/locale.po': ('plugins.generic.letimio.documents.sent',),
            'vite.config.js': ('LetimioPlagiarismPanelRuntime',),
            'version.xml': ('<application>letimio</application>',),
        }.items():
            for value in expected:
                self.assertIn(value, (self.root / filename).read_text())
        for filename in ('view/logo.vue', 'config/product.php', 'view/build/old.js'):
            self.assertEqual(self.files[filename], (self.root / filename).read_text())

    def test_unknown_product_is_rejected(self):
        with self.assertRaises(ValueError):
            MODULE.prepare(self.root, 'unknown')


if __name__ == '__main__':
    unittest.main()
