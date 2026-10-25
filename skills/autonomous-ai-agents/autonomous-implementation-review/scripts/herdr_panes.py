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
from pathlib import Path
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
    parser.add_argument("--orchestrator", required=True, help="literal current pane ID, not inferred from focus")
    parser.add_argument("--selection", type=Path, help="operator selection evidence JSON; validate only, never control a pane")
    parser.add_argument("--inspection", type=Path, help="fresh --inspect output from herdr_lifecycle_watch.mjs for the selected pane")
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

    outside = [text(pane.get("pane_id")) for pane in panes if pane.get("workspace_id") != args.workspace]
    if outside:
        return die(f"response includes panes outside workspace {args.workspace}: {', '.join(outside)}")

    ids = [pane.get("pane_id") for pane in panes]
    if any(not isinstance(value, str) or not value or value != value.strip() for value in ids):
        return die("expected literal nonempty pane IDs")
    if len(set(ids)) != len(ids):
        return die("duplicate pane IDs")
    if args.orchestrator not in ids:
        return die("orchestrator pane is absent; require its actual identity")
    eligible = [pane for pane in panes if pane["pane_id"] != args.orchestrator
                and pane.get("agent") == "hermes"]
    if args.selection:
        try:
            selection = json.loads(args.selection.read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            return die(f"invalid selection evidence: {error}")
        if not isinstance(selection, dict) or not (
            selection.get("source") == "launch" or
            (selection.get("source") == "clarify" and selection.get("outcome") == "submitted"
             and selection.get("status") == "answered")
        ):
            return die("explicit answered selection or operator launch pane required; no implicit consent")
        selected = selection.get("pane_id")
        if selected not in [pane["pane_id"] for pane in eligible]:
            return die("selected pane is not an eligible executor")
        if not args.inspection:
            return die("fresh pane-output inspection required; metadata is not availability proof")
        try:
            inspection = json.loads(args.inspection.read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            return die(f"invalid inspection evidence: {error}")
        target = next(pane for pane in eligible if pane["pane_id"] == selected)
        if not isinstance(inspection, dict) or not (
            inspection.get("pane") == selected and inspection.get("workspace") == args.workspace
            and inspection.get("terminal") and inspection.get("terminal") == target.get("terminal_id")
            and inspection.get("source") == "pane-output" and inspection.get("status") == "idle"
        ):
            return die("selected pane lacks matching visible idle inspection")
        print(json.dumps({"ok": True, "workspace": args.workspace, "pane_id": selected}))
        return 0

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
            if pane in eligible:
                candidates.append((pane_id, text(pane.get("label")), agent, text(pane.get("agent_status")) or "unknown"))

    if candidates:
        print("\nHermes candidates — availability unverified; select explicitly, then inspect:")
        for pane_id, label, agent, status in candidates:
            suffix = f" ({label})" if label else ""
            print(f"  {pane_id}{suffix}: {agent}, reported {status} (not availability proof)")
        print("Use the pane ID as the Herdr control target; labels are display metadata, not reliable agent targets.")
    else:
        print("\nNo non-orchestrator Hermes candidates in this workspace.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
