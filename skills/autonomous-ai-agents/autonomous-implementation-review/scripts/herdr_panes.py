#!/usr/bin/env python3
"""Summarize JSON emitted by `herdr pane list --workspace <id>`.

The script is deliberately read-only. It groups panes by tab and prints only
pane metadata useful for selecting a coding-agent session; it never controls a
pane or sends input.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import OrderedDict
from typing import Any


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def die(message: str, code: int = 2) -> int:
    print(f"herdr-pane-summary: {message}", file=sys.stderr)
    return code


def pane_summary(pane: dict[str, Any]) -> tuple[str, str, str, str]:
    pane_id = text(pane.get("pane_id")) or "<missing pane id>"
    label = text(pane.get("label"))
    agent = text(pane.get("agent"))
    status = text(pane.get("agent_status")) or "unknown"
    cwd = text(pane.get("foreground_cwd")) or text(pane.get("cwd")) or "<unknown cwd>"

    display = f"{pane_id}"
    if label:
        display += f" [{label}]"
    if agent:
        display += f" — coding agent {agent} ({status})"
    else:
        display += " — no recognized coding agent"
    return pane_id, display, agent, cwd


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True, help="workspace passed to `herdr pane list --workspace`")
    args = parser.parse_args()

    raw = sys.stdin.read()
    if not raw.strip():
        return die("expected JSON on standard input")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        return die(f"invalid JSON: {error.msg}")
    if not isinstance(payload, dict):
        return die("top-level response is not an object")
    if isinstance(payload.get("error"), dict):
        error = payload["error"]
        return die(f"herdr returned {text(error.get('code')) or 'an error'}: {text(error.get('message'))}", 1)

    result = payload.get("result")
    if not isinstance(result, dict) or not isinstance(result.get("panes"), list):
        return die("response has no result.panes array")
    panes = result["panes"]
    if not all(isinstance(pane, dict) for pane in panes):
        return die("result.panes contains a non-object entry")

    outside = [text(pane.get("pane_id")) for pane in panes if text(pane.get("workspace_id")) not in ("", args.workspace)]
    if outside:
        return die(f"response includes panes outside workspace {args.workspace}: {', '.join(outside)}")

    tabs: OrderedDict[str, list[dict[str, Any]]] = OrderedDict()
    for pane in panes:
        tab_id = text(pane.get("tab_id")) or "<missing tab id>"
        tabs.setdefault(tab_id, []).append(pane)

    print(f"Herdr workspace {args.workspace}: {len(panes)} pane(s) across {len(tabs)} tab(s)")
    candidates: list[tuple[str, str, str, str]] = []
    for tab_id, tab_panes in tabs.items():
        print(f"\n{tab_id}")
        for pane in tab_panes:
            pane_id, display, agent, cwd = pane_summary(pane)
            print(f"  {display}")
            print(f"    cwd: {cwd}")
            if agent:
                candidates.append((pane_id, text(pane.get("label")), agent, text(pane.get("agent_status")) or "unknown"))

    if candidates:
        print("\nCoding-session candidates — select one explicitly before control:")
        for pane_id, label, agent, status in candidates:
            suffix = f" ({label})" if label else ""
            print(f"  {pane_id}{suffix}: {agent}, {status}")
        print("Use the pane ID as the Herdr control target; labels are display metadata, not reliable agent targets.")
    else:
        print("\nNo recognized coding-agent sessions are available in this workspace.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
