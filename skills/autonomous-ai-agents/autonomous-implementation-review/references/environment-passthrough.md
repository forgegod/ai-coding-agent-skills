# Hermes environment passthrough for Herdr executors

Load this only when a selected executor must run `terminal` or `execute_code`
with Herdr context. It configures child-process visibility; it does not create
variables missing from the Hermes process or grant a new Herdr pane lifecycle.

## Boundary

Hermes deliberately sanitizes child environments. A local `terminal` command
may inherit ordinary `HERDR_*` values, but `execute_code` and remote backends
need an explicit allowlist. The allowlist contains exact names only: there is
no wildcard for `HERDR_*`.

Do not pass through `HERMES_HOME`, provider credentials, gateway tokens, or the
entire inherited environment. `HERMES_HOME` selects profile state and must be
bound when the executor process starts, not forwarded to a child command.

## Configure the executor profile

1. Identify the smallest set of values the role actually needs. The standard
   Herdr transport needs `HERDR_ENV` and `HERDR_WORKSPACE_ID`; add
   `HERDR_PANE_ID`, `HERDR_TAB_ID`, `HERDR_SOCKET_PATH`, or `HERDR_BIN_PATH`
   only when the invoked tool reads that exact value. Completion: every name has
   a named consumer and no credential is included.
2. In the selected executor's Hermes profile, use `terminal` to run:

   ```text
   hermes config set terminal.env_passthrough '["HERDR_ENV", "HERDR_WORKSPACE_ID"]'
   hermes config get terminal.env_passthrough
   ```

   Extend the JSON list only with the approved exact names from step 1.
   Completion: the read-back lists precisely the approved names for that
   profile.
3. Restart the executor session or gateway after the configuration change, then
   start a fresh role session. Completion: the running process has reloaded its
   profile configuration; do not assume an existing session's cached allowlist
   changed in place.
4. Use `terminal` to run a boolean-only probe before task delivery. For example:

   ```text
   python3 -c 'import os; names=("HERDR_ENV", "HERDR_WORKSPACE_ID"); print({name: bool(os.getenv(name)) for name in names})'
   ```

   If the role uses `execute_code`, run the equivalent boolean-only probe there
   as well. Completion: each required name is `True` in every tool surface the
   role will use; never print its value into a transcript.

## Failure handling

- If `terminal` cannot see a required name after a fresh executor start, Hermes
  cannot recover it. Stop and require Herdr's guarded per-agent launch path to
  export that named value into the executor process. Do not synthesize it with
  shell interpolation or copy it from another pane/profile.
- If `terminal` sees it but `execute_code` does not, verify the selected
  executor profile's `terminal.env_passthrough` read-back, then restart the
  affected session. Do not weaken Hermes's global secret filtering.
- Configure each live executor profile independently. A value declared for one
  profile must not become a reason to reuse another profile's `HERMES_HOME` or
  credentials.
