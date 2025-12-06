import pathlib
import subprocess
from typing import Tuple

from langchain_core.tools import tool

PROJECT_ROOT = pathlib.Path.cwd() / "generated_project"


def safe_path_for_project(path: str = ".") -> pathlib.Path:
    """
    Ensure 'path' is within PROJECT_ROOT to avoid writing outside the project.
    """
    p = (PROJECT_ROOT / path).resolve()
    root = PROJECT_ROOT.resolve()
    if root not in p.parents and root != p.parent and root != p:
        raise ValueError("Attempt to write outside project root")
    return p


def _write_file_impl(path: str, content: str) -> str:
    p = safe_path_for_project(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return f"Wrote file {p.relative_to(PROJECT_ROOT)}"


def _read_file_impl(path: str) -> str:
    p = safe_path_for_project(path)
    if not p.exists():
        return f"ERROR: {p} does not exist"
    if not p.is_file():
        return f"ERROR: {p} is not a file"
    return p.read_text(encoding="utf-8")


def _list_files_impl(path: str = ".") -> str:
    p = safe_path_for_project(path)
    if not p.exists():
        return f"ERROR: {p} does not exist"
    if not p.is_dir():
        return f"ERROR: {p} is not a directory"
    files = [str(f.relative_to(PROJECT_ROOT)) for f in p.glob("**/*") if f.is_file()]
    return "\n".join(files) if files else "No files found."


@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file at 'path' (relative to the project root)."""
    return _write_file_impl(path, content)


@tool
def read_file(path: str) -> str:
    """Read a file from 'path' (relative to the project root)."""
    return _read_file_impl(path)


@tool
def get_current_directory() -> str:
    """Return the project root directory."""
    return str(PROJECT_ROOT)


@tool
def list_files(path: str = ".") -> str:
    """List files under the given path (relative to the project root), one per line."""
    return _list_files_impl(path)


@tool
def run_cmd(cmd: str, cwd: str = None, timeout: int = 30) -> Tuple[int, str, str]:
    """
    Runs a shell command in the specified directory (relative to project root)
    and returns (returncode, stdout, stderr).
    """
    cwd_dir = safe_path_for_project(cwd) if cwd else PROJECT_ROOT
    res = subprocess.run(
        cmd,
        shell=True,
        cwd=str(cwd_dir),
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return res.returncode, res.stdout, res.stderr


def init_project_root() -> str:
    """
    Ensure the project root folder exists and return its path as a string.
    """
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    return str(PROJECT_ROOT)


def list_files_in_project(path: str = ".") -> str:
    """
    Plain Python helper to list files. Used by the Streamlit UI.
    """
    return _list_files_impl(path)


def read_file_in_project(path: str) -> str:
    """
    Plain Python helper to read a file. Used by the Streamlit UI.
    """
    return _read_file_impl(path)
