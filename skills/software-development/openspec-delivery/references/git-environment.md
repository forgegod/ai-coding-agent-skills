# Git child environment contract

`change-guard.mjs` and `change-workspace.mjs` use the same package-local
`scripts/git-environment.mjs` constructor for every Git subprocess. It reads
inherited names first, then only present allowlisted values. It does not copy the
whole environment, read unrelated values, or silently ignore a forbidden override.

## Refused names

Presence of any of these names fails before Git launches, even with an empty value;
the value is not read to decide presence:

- `GIT_DIR`, `GIT_WORK_TREE`, `GIT_COMMON_DIR`, `GIT_INDEX_FILE`.
- `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_NAMESPACE`.
- `GIT_GRAFT_FILE`, `GIT_SHALLOW_FILE`, `GIT_REPLACE_REF_BASE`.
- `GIT_CONFIG_COUNT`, `GIT_CONFIG_PARAMETERS`.

## Forwarded values

Only present values from this explicit allowlist reach Git:

| Platforms | Names |
| --- | --- |
| All | `PATH`, `HOME`, `XDG_CONFIG_HOME`, `TMPDIR`, `TMP`, `TEMP` |
| Windows only | `SystemRoot`, `WINDIR`, `ComSpec`, `PATHEXT`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA` |
| All: trusted Git configuration selectors | `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`, `GIT_CONFIG_NOSYSTEM` |

Absent selectors stay absent, retaining Git's normal configuration discovery.
Present selectors retain their exact values, including deliberate empty values;
Git interprets them. The helpers neither disable all global/system configuration
nor drop fixture selectors and accidentally restore host configuration. Test with
synthetic config files and isolated home/config directories, never host credentials.

On Windows, name matching is case-insensitive and duplicate aliases for an
allowlisted name are refused before any value read; the child receives canonical
names from the table. Linux and macOS matching is case-sensitive. Other inherited
values, including credentials, `NODE_OPTIONS`, loader injection variables and Git
execution/trace overrides, are neither read nor forwarded by the constructor.
This concerns the Git child, not how the parent Node process was launched.

Windows otherwise injects `HOMEDRIVE`, `HOMEPATH`, `LOGONSERVER`, `SYSTEMDRIVE`,
`USERDOMAIN` and `USERNAME` into a spawned process even when Node is given a narrow
environment. The constructor sets those names to fixed empty values on Windows so
their inherited values do not reach Git. They are platform-neutralization controls,
not forwarded runtime inputs.

## Fixed controls and trust boundary

Regardless of inherited values, children receive `GIT_NO_REPLACE_OBJECTS=1`,
`GIT_OPTIONAL_LOCKS=0` and `LC_ALL=C`. Git arguments retain `--no-optional-locks`
and `-c core.fsmonitor=false`. Replacement-ref/graft, topology, identity, ancestry,
cleanliness and workspace-path checks remain in force; a refusal never authorizes
repair or discarding work. Workspace paths still reject all C0 code units (below
32) and DEL (127), along with non-absolute/non-normalized paths, symlink aliases
and workspace overlap.

This is not a sandbox. Executable search paths, home/config locations, selected
configuration files and repository configuration remain trusted inputs. Git may
interpret configuration that invokes other programs; the allowlist does not claim
to prohibit all subprocess execution. Previewed worktree mutations remain
separately authorized orchestrator actions, not operations executed by these
read-only helpers; inspect trusted hooks before executing a preview.

## Verification limits

Run the repository's focused fixtures through the host terminal:

```sh
node --test tests/git-environment.test.mjs tests/openspec-workspace.test.mjs tests/openspec-integration.test.mjs
```

Synthetic getters check value-read boundaries and case simulations check matching.
Instrumented child processes record their actual inherited environment, then run
real Git with the helper's unchanged arguments and that environment. On macOS, the
Node observer's `process.env` can contain `__CF_USER_TEXT_ENCODING` after
CoreFoundation startup even when the helper omitted it. The comparison removes only
that observer self-injection. It is not an allowlisted forward and the constructor
must not add it. Workspace fixtures resolve `os.tmpdir()` with `realpath` before
calling the helper, because `/var` and `/tmp` are symlink aliases on macOS and a
non-canonical parent is refused. Real fixtures
exercise isolated global/system selection, absent/empty selectors, default home
configuration, dirty-work preservation and integrity controls. Exhaustive UTF-16
code-unit comparisons establish equivalence of the numeric path predicate, not
filesystem portability.

Git for Windows emits worktree porcelain paths with `/` separators. The workspace
helper normalizes only that Git-returned path before its canonical-path checks; it
does not relax normalized/canonical requirements for user-supplied workspace paths.

Record native Linux, macOS and Windows commands/results separately. WSL runs Linux
Node/Git, not native Windows; case simulation and package validation do not prove
native platform behavior. The fixture uses a native `.cmd` fsmonitor command on
Windows and a shell command on POSIX hosts. Symlink tests require Windows symlink
privilege; missing privilege leaves native Windows coverage incomplete rather than
turning those tests into skips. Missing native platform evidence blocks hardening
completion. Require complete-package safe community verdicts from the unchanged
trusted scanner with negative controls, plus independent exact-candidate review;
a passing prototype or this fixture suite alone is not acceptance.
