#!/usr/bin/env python3
"""Prepare a product identity in the mirror's temporary checkout."""

import re
import subprocess
import sys
from pathlib import Path


def prepare(directory: Path, product: str) -> None:
    if product not in ('compilatio', 'letimio'):
        raise ValueError(f'Unsupported product: {product}')
    if product == 'compilatio':
        return

    tracked = subprocess.check_output(
        ['git', '-C', str(directory), 'ls-files', '-z'],
    ).decode().split('\0')
    for filename in tracked:
        path = directory / filename
        if path.suffix not in ('.php', '.json', '.xml', '.neon'):
            continue
        if filename == 'config/product.php':
            continue
        original = path.read_text()
        content = original.replace(
            'APP\\plugins\\generic\\compilatio',
            'APP\\plugins\\generic\\letimio',
        ).replace(
            'APP\\\\plugins\\\\generic\\\\compilatio',
            'APP\\\\plugins\\\\generic\\\\letimio',
        )
        content = re.sub(r'\bCompilatioPlugin\b', 'LetimioPlugin', content)
        if path.suffix == '.php':
            content = content.replace('plugins/compilatio/', 'plugins/letimio/')
        if filename == 'version.xml':
            content = content.replace(
                '<application>compilatio</application>',
                '<application>letimio</application>',
            )
        if content != original:
            path.write_text(content)

    (directory / 'CompilatioPlugin.php').rename(directory / 'LetimioPlugin.php')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: prepare-product.py CHECKOUT compilatio|letimio')
    prepare(Path(sys.argv[1]).resolve(), sys.argv[2])
