---
name: push
description: Use this skill to publish the current dataset directory to DataHub with the `dh` CLI. Checks datapackage.json and required DATAHUB_* env vars first; skips cleanly if credentials aren't configured (committing to git is enough on its own). Invoked as `/push` in Claude Code, or by name; operates on the dataset in the current directory.
---

# Push: publish the current dataset to DataHub

1. Check `datapackage.json` exists in the current directory. If not, stop and tell the user.

2. Check that `resources` is defined and non-empty. If not, warn:
   "datapackage.json has no resources — the dataset page won't render correctly.
   Add a resources array before pushing."
   Ask if they want to continue anyway.

3. Check that `DATAHUB_API_URL`, `DATAHUB_API_TOKEN`, and `DATAHUB_PUBLICATION`
   are set. If any are missing, tell the user which ones and stop — committing and
   pushing to git is sufficient on its own; missing credentials is not an error.

4. Run:
   ```sh
   dh push .
   ```

5. Report the result and the URL where the dataset can be viewed.
