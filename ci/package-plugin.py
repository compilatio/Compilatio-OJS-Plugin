#!/usr/bin/env python3
"""Package a mirrored OJS plugin using its tracked runtime files."""

import hashlib
import re
import subprocess
import sys
import tarfile
import xml.etree.ElementTree as ET
from pathlib import Path, PurePosixPath


def package(directory: Path, output: Path) -> Path:
    version = ET.parse(directory / 'version.xml').getroot()
    product = version.findtext('application')
    release = version.findtext('release')
    plugin_class = version.findtext('class')
    if product not in ('compilatio', 'letimio'):
        raise ValueError(f'Unsupported plugin identity: {product}')
    if not release or not re.fullmatch(r'\d+\.\d+\.\d+\.\d+', release):
        raise ValueError(f'Invalid plugin release: {release}')
    expected_class = 'CompilatioPlugin' if product == 'compilatio' else 'LetimioPlugin'
    if plugin_class != expected_class or version.findtext('type') != 'plugins.generic':
        raise ValueError('The plugin class or type does not match the product identity.')

    required = {
        'version.xml', 'README.md', 'LICENSE', 'config/product.php',
        f'{plugin_class}.php', 'templates/settings.tpl',
        'view/build/PlagiarismPanel.runtime.js', 'view/build/style.css',
    }
    tracked = subprocess.check_output(
        ['git', '-C', str(directory), 'ls-files', '-z'],
    ).decode().split('\0')
    selected = []
    for filename in tracked:
        path = PurePosixPath(filename)
        if filename in required or (
            path.suffix == '.php'
            and path.parts[0] in ('api', 'migration')
            and not filename.startswith('api/test/')
        ) or (
            path.parts[0:1] == ('locale',) and path.suffix == '.po'
        ) or (
            path.parts[0:1] == ('templates',) and path.suffix == '.tpl'
        ) or (
            filename.startswith('view/build/')
            and path.suffix in ('.js', '.css', '.svg', '.png', '.jpg', '.webp', '.woff', '.woff2')
        ):
            source = directory / filename
            if source.is_symlink() or not source.is_file() or source.stat().st_size == 0:
                raise ValueError(f'Invalid or empty package input: {filename}')
            selected.append(filename)
    missing = required.difference(selected)
    if missing:
        raise ValueError(f'Missing tracked package inputs: {", ".join(sorted(missing))}')

    output.mkdir(parents=True, exist_ok=True)
    archive = output / f'{product}-{release}.tar.gz'
    with tarfile.open(archive, 'w:gz') as package_file:
        for filename in sorted(selected):
            package_file.add(directory / filename, arcname=f'{product}/{filename}', recursive=False)
    data = archive.read_bytes()
    for algorithm in ('md5', 'sha256'):
        digest = hashlib.new(algorithm, data).hexdigest()
        Path(f'{archive}.{algorithm}').write_text(f'{digest}  {archive.name}\n')
    return archive


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: package-plugin.py CHECKOUT OUTPUT_DIRECTORY')
    print(package(Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()))
