"""Create an allowlisted static output for Vercel without rewriting frontend source."""
from pathlib import Path
import shutil

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = PROJECT_ROOT / "public"

ROOT_EXTENSIONS = {".html"}
DIRECTORY_EXTENSIONS = {
    "account": {".html"},
    "account/assets": {".png"},
    "admin": {".html"},
    "assets": {".png"},
    "css": {".css"},
    "js": {".js"},
    "legal": {".html"},
    "store": {".html"},
    "upload": {".png", ".pdf"},
}


def _copy_file(source, destination):
    if source.is_symlink():
        raise RuntimeError(f"Static build refuses symbolic links: {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def build_static(project_root=PROJECT_ROOT, output_dir=DEFAULT_OUTPUT):
    project_root = Path(project_root).resolve()
    output_dir = Path(output_dir).resolve()
    if output_dir == project_root or project_root not in output_dir.parents:
        raise RuntimeError("Static output must be a child of the project root.")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)

    copied = []
    for source in sorted(project_root.iterdir()):
        if source.is_file() and source.suffix.lower() in ROOT_EXTENSIONS:
            destination = output_dir / source.name
            _copy_file(source, destination)
            copied.append(destination.relative_to(output_dir).as_posix())

    for relative_directory, extensions in DIRECTORY_EXTENSIONS.items():
        source_directory = project_root / relative_directory
        if not source_directory.is_dir():
            raise RuntimeError(f"Required static directory is missing: {relative_directory}")
        for source in sorted(source_directory.iterdir()):
            if source.is_file() and source.suffix.lower() in extensions:
                destination = output_dir / relative_directory / source.name
                _copy_file(source, destination)
                copied.append(destination.relative_to(output_dir).as_posix())

    if "index.html" not in copied or "404.html" not in copied:
        raise RuntimeError("Static output is missing required root pages.")
    return copied


if __name__ == "__main__":
    files = build_static()
    print(f"Prepared {len(files)} static files for Vercel.")
