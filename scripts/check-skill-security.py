#!/usr/bin/env python3
"""Release-only community scan; never install packages or change Hermes policy."""
import importlib.util
import argparse
from dataclasses import asdict
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import sys


def load_guard(source):
    """Load only the guard from an operator-selected, trusted Hermes checkout."""
    spec = importlib.util.spec_from_file_location("release_skills_guard", source / "tools/skills_guard.py")
    if spec is None or spec.loader is None:
        raise ValueError("Cannot load the selected Hermes scanner")
    guard = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = guard
    spec.loader.exec_module(guard)
    return guard


def scan_package(guard, package):
    files = [p for p in package.rglob("*") if p.is_file()]
    extensions = guard.SCANNABLE_EXTENSIONS
    try:
        # Include .mjs/.cjs and extensionless text without renaming shipped files.
        # This changes only this invocation, never the installed scanner source.
        guard.SCANNABLE_EXTENSIONS = extensions | {p.suffix.lower() for p in files}
        for file in files:
            file.read_text(encoding="utf-8-sig")  # No silently skipped binary/undecodable content.
        return guard.scan_skill(package, source="community")
    finally:
        guard.SCANNABLE_EXTENSIONS = extensions


def scan_endpoint(source, endpoint):
    guard = load_guard(source)
    skills = json.loads((endpoint / "index.json").read_text(encoding="utf-8"))["skills"]
    if not isinstance(skills, list) or not skills:
        raise ValueError("Expected a nonempty package inventory")
    names = [s["name"] for s in skills]
    if any(not isinstance(n, str) or not re.fullmatch(r"[a-z][a-z0-9_-]*", n) for n in names) or len(set(names)) != len(names):
        raise ValueError("Invalid or duplicate package inventory names")
    if endpoint.is_symlink() or any(p.is_symlink() for p in endpoint.rglob("*")):
        raise ValueError("Symlink in package inventory")
    if {p.name for p in endpoint.iterdir()} != set(names) | {"index.json"}:
        raise ValueError("Endpoint inventory differs from index")
    results = []
    for entry in skills:
        package = endpoint / entry["name"]
        files = entry["files"]
        if not isinstance(files, list) or not all(isinstance(f, str) and re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9_.-]*(?:/[A-Za-z0-9_][A-Za-z0-9_.-]*)*", f) for f in files):
            raise ValueError("Invalid package inventory paths")
        if "SKILL.md" not in files or len(set(files)) != len(files) or set(files) != {p.relative_to(package).as_posix() for p in package.rglob("*") if p.is_file()}:
            raise ValueError(f"Package inventory mismatch: {entry['name']}")
        result = scan_package(guard, package)
        allowed, reason = guard.should_allow_install(result, force=False)
        results.append({"name": entry["name"], "files_scanned": len(files),
                        "verdict": result.verdict, "allowed": allowed is True,
                        "reason": reason, "findings": [asdict(f) for f in result.findings]})
    return {"scanner_version": guard.SCANNER_VERSION,
            "scanner_sha256": sha256((source / "tools/skills_guard.py").read_bytes()).hexdigest(),
            "coverage": "all UTF-8 package files, including .mjs/.cjs; no ignore exclusions",
            "packages": results,
            "ok": all(r["verdict"] == "safe" and r["allowed"] for r in results)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hermes-source", default=os.environ.get("HERMES_SOURCE"),
                        help="Trusted Hermes source checkout (or HERMES_SOURCE); no automatic download")
    parser.add_argument("--endpoint", type=Path, default=Path(__file__).resolve().parents[1] / "dist/.well-known/skills")
    args = parser.parse_args()
    try:
        if not args.hermes_source:
            raise ValueError("Set HERMES_SOURCE or --hermes-source to a trusted Hermes checkout")
        report = scan_endpoint(Path(args.hermes_source), args.endpoint)
    except Exception as error:
        report = {"ok": False, "error": str(error)}
    print(json.dumps(report, indent=2))
    sys.exit(0 if report["ok"] else 1)
