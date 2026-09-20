# Start here

Read `AGENTS.md` and [the handoff protocol](docs/next-session-brief.md), then execute ready work from Beads. Beads owns the task list, priorities, dependencies, acceptance criteria and completion evidence; this file is a reusable session prompt.

1. Inspect `git status --short --branch`, preserve existing changes, run `bd dolt pull`, then `bd ready`.
2. Select the highest-priority ready task that you can execute (P1 before P2 before P3). Read its full details with `bd show <id>` and check prerequisite evidence. Skip umbrella epics, human-only tasks, deferred work and tasks already owned by another worker. Do not ask the user which task to pick when the queue provides a clear choice.
3. Claim it with `bd update <id> --claim`. Read the named skills and files, implement its scoped deliverable, and run its acceptance checks. Respect review gates; completion of a prerequisite must be supported by evidence.
4. Record changed paths, decisions, verification results and commit IDs where applicable in the Bead. Close it only when its acceptance criteria pass. If blocked, record the exact blocker and move to another independent ready task; ask the user only when their input is necessary.
5. Refresh `bd ready` and continue with the next eligible task. Stop when no eligible work remains or the user asks you to stop. At handoff, run `bd dolt push`, confirm success, and report completed work, outstanding blockers and repository commit status.

Work sequentially by default. If parallel execution is explicitly requested, use the handoff protocol's file-ownership and integration rules. Do not recreate a backlog in this file or copy live task statuses into Markdown.

Current planning defaults: story #3 uses oil-prices; an independent AI reviewer signs off its outline; the author's final voice pass remains human. These defaults do not require another confirmation before starting eligible work. External publishing, issue messages and destructive migrations need their own authorized scope.
