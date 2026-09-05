# Beads Setup and Workflow for datapressr

This repository uses Beads with an embedded Dolt database for personal cross-machine issue tracking and synchronization through the GitHub remote.

## Setup Summary

- **Backend:** Dolt (embedded mode, no server required)
- **Issue Prefix:** `datapressr` (issues named `datapressr-<hash>`)
- **Sync Mechanism:** Dolt remotes via GitHub SSH (`git+ssh://git@github.com/datasets/datapressr.git`)
- **Export:** Auto-enabled; JSONL is for inspection/viewers, not the primary sync
- **Hooks:** Git configured to use `.beads/hooks` with failure-tolerant custom wrappers

## Normal Workflow

### Start of Session

```bash
git pull
bd dolt pull
bd status
```

### Working with Issues

```bash
bd ready                                    # Prepare for work
bd create "Short issue title"               # Create new issue
bd list                                     # See all issues
bd update datapressr-abc123 --claim         # Claim an issue
bd update datapressr-abc123 "Progress"      # Update issue body
bd close datapressr-abc123 --reason "Done"  # Close when done
```

### End of Session

```bash
bd dolt push         # Explicit push to ensure sync before shutdown
git add -A
git commit -m "Describe the work"
git push
```

The explicit `bd dolt push` at session end is recommended even though `pre-push` hook starts a background push — it makes handoff and shutdown deterministic.

## Automatic Hook Behavior

Hooks are installed in `.beads/hooks` with failure-tolerant custom wrappers:

- **post-merge:** After `git pull`, automatically runs `bd dolt pull` (non-blocking, won't fail the merge if network unavailable)
- **post-checkout:** On branch switch or clone update, automatically runs `bd dolt pull` (non-blocking)
- **pre-push:** Before `git push`, starts `bd dolt push` in the background with output logged to `.beads/dolt-push.log`

## Fresh Clone or New Machine

```bash
git clone git@github.com:datasets/datapressr.git
cd datapressr
bd doctor
bd dolt remote list
bd dolt pull
bd status
```

If Beads reports the database is not initialized (verify `.beads/config.yaml` and `.beads/metadata.json` exist):

```bash
bd bootstrap
bd dolt pull
```

Do not run `bd init` over an existing clone unless genuinely missing its Beads setup.

## Verifying Sync Health

```bash
bd context
bd dolt remote list
bd dolt status
git status --short --branch
```

## Troubleshooting Sync Failures

First inspect without making changes:

```bash
bd context
bd dolt remote list
bd dolt status
git status --short --branch
```

Then retry normal sync:

```bash
git pull
bd dolt pull
bd dolt push
```

If both machines changed Beads concurrently, let Dolt report the conflict and resolve through the Beads/Dolt workflow. **Do not delete `.beads/`, remove the remote, or reinitialize with force as a first response.**

If offline, continue working locally. Failed hook pulls/pushes should not block Git operations; synchronize with `bd dolt pull` and `bd dolt push` when connectivity returns.

If the background `pre-push` sync is taking time, verify progress with:

```bash
bd dolt push
tail .beads/dolt-push.log
```

## Important Notes

- `.beads/` is committed to the repository and shared across machines (not stealth mode)
- `.beads/dolt-push.log` and `.beads/*.sock` are machine-local and `.gitignore`d
- JSONL export (`datapressr.jsonl`) is auto-generated for inspection but is not the sync mechanism — Dolt remotes are
- Preserve AGENTS.md: Beads init was run with `--skip-agents`
- Beads version: 1.1.2

## Resources

- `bd quickstart` — interactive guide
- `bd help` — full command reference
- `bd config --help` — configuration options
- `/Users/rgrp/src/me/agent-skills/beads-sync-playbook.md` — upstream playbook reference
