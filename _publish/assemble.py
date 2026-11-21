"""Restore the versioned assets and assemble the standalone static website."""
from pathlib import Path
import base64
import hashlib
import io
import json
import shutil
import tarfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / '_publish/manifest.json').read_text())
encoded = ''.join((ROOT / part).read_text(encoding='ascii') for part in manifest['parts'])
packed = base64.b64decode(encoded, validate=True)
if len(packed) != manifest['bytes']:
    raise ValueError('Asset archive size does not match the manifest')
if hashlib.sha256(packed).hexdigest() != manifest['sha256']:
    raise ValueError('Asset archive checksum does not match the manifest')

target = ROOT / '_site'
if target.exists():
    shutil.rmtree(target)
shutil.copytree(ROOT / 'site', target)
with tarfile.open(fileobj=io.BytesIO(packed), mode='r:gz') as archive:
    for entry in archive.getmembers():
        name = Path(entry.name)
        if name.is_absolute() or '..' in name.parts or not entry.isfile():
            raise ValueError(f'Unsupported archive entry: {entry.name}')
        if name.parts[0] not in {'assets', 'photos', 'vendor'}:
            raise ValueError(f'Unexpected archive directory: {entry.name}')
    for entry in archive.getmembers():
        destination = target / entry.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        with archive.extractfile(entry) as source, destination.open('wb') as output:
            shutil.copyfileobj(source, output)

required = ['index.html', 'config.js', 'assets/la-vie-en-rose.mp3', 'vendor/three.module.js']
for name in required:
    if not (target / name).is_file():
        raise FileNotFoundError(name)
photos = list((target / 'photos').rglob('*.jpg'))
if len(photos) != 17:
    raise ValueError(f'Expected 17 travel photos; found {len(photos)}')
print(f'Assembled static website with {len(photos)} photos; archive verified by SHA-256.')
