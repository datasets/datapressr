---
description: Push current dataset directory to DataHub
---

Push the current dataset to DataHub.

1. Check `datapackage.json` exists in the current directory. If not, stop and tell the user.

2. Check that `resources` is defined and non-empty. If not, warn:
   "datapackage.json has no resources — the dataset page won't render correctly. Add a resources array before pushing."
   Ask if they want to continue anyway.

3. Check that `DATAHUB_API_URL`, `DATAHUB_API_TOKEN`, and `DATAHUB_PUBLICATION` are set. If any are missing, tell the user which ones and stop.

4. Run:
   ```sh
   dh push .
   ```

5. Report the result and the URL where the dataset can be viewed.
