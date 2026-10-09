# Installing the `dh` CLI

`dh` is the DataHub command-line tool used to publish datasets. It is a Go binary released from the private repo [datopian/datahub-next](https://github.com/datopian/datahub-next/tree/staging/cli), so you need GitHub access to that repo (via `gh auth login`).

## Install (macOS / Linux)

```sh
# pick your platform: dh_darwin_arm64, dh_darwin_amd64, dh_linux_amd64, dh_linux_arm64
gh release list -R datopian/datahub-next          # check the latest tag (v0.1.0 as of 2026-10-09)
gh release download v0.1.0 -R datopian/datahub-next -p 'dh_darwin_arm64.tar.gz' -D /tmp/dh
tar -xzf /tmp/dh/dh_darwin_arm64.tar.gz -C /tmp/dh
mkdir -p ~/.local/bin && install -m 755 /tmp/dh/dh ~/.local/bin/dh
xattr -d com.apple.quarantine ~/.local/bin/dh 2>/dev/null   # macOS only
dh --version
```

`~/.local/bin` must be on your `PATH` (add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` if not).

## Machine without `gh`

The install steps above work on any machine with `gh` logged in (including `rgrp@headless.local`; note `gh` is only on the PATH in a login shell there). Otherwise, download on a machine that has `gh`, then copy the binary across:

```sh
scp ~/.local/bin/dh user@host:.local/bin/dh
ssh user@host 'chmod 755 ~/.local/bin/dh; xattr -d com.apple.quarantine ~/.local/bin/dh 2>/dev/null; dh --version'
```

## Log in

```sh
dh login
```

A one-off device-code sign-in: it prints a URL and code, you open the URL in any browser (it can be on another machine), sign in to datahub.io with GitHub and click Authorize. The CLI then saves a long-lived token locally. This works fine over SSH on a headless machine.

`DATAHUB_API_TOKEN` is only needed for CI or env-only use. There is no token UI: run `dh login` once, then copy the `token` value from the credentials file it writes into `DATAHUB_API_TOKEN`, with `DATAHUB_API_URL=https://datahub.io`. Treat it as highly privileged; `dh logout` revokes it.

Then see the publishing rules in [AGENTS.md](../AGENTS.md) (always pass `--publication`, never publish to `core`) and the `push` skill.

## Where it's installed

- Rufus's Mac: `~/.local/bin/dh` (v0.1.0, installed 2026-10-09)
- `rgrp@headless.local`: `~/.local/bin/dh` (v0.1.0, installed 2026-10-09)
