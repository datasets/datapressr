# DataPressr Preview v0.1 — video demo script

**Format:** approximately 2 minutes 15 seconds, spoken at about 130 words per minute with pauses. **Audience:** someone who works with data and wants to see what the desktop app does. **Purpose:** show the conversation-to-file-to-preview workflow, then send viewers to the tutorial. A narrated 1:59 first cut has been rendered locally using the [Hyperframes project](hyperframes/README.md); this document remains the production storyboard.

## Recommended cut

Make the first version from the existing screenshots and voiceover. Use a slow pan or a small zoom to direct attention; reserve cuts for changing tasks. A live recording can follow the same sequence and include the actual edit-to-refresh moment. An installation screencast is better as a separate, longer tutorial: terminal setup would take time away from the main workflow here.

The [written tutorial](../../site/docs/bb-preview.md) already covers installation, opening the panel, choosing real example files, using skills and troubleshooting. It is on the v0.1 implementation branch; do not describe its website URL as live until that branch is merged and the site has synced.

## Storyboard and exact narration

Times are editing targets, not a measured voice recording. The voiceover-only text is also available in [bb-preview-v01-voiceover.txt](bb-preview-v01-voiceover.txt).

### 1. The result first — 0:00–0:15

**Visual:** [Keeling story in BB](../benchmarks/images/bb-v01-clean-install.png). Start with the conversation and preview together; slowly move toward the chart. Title: **DataPressr Preview · v0.1**. Subheading: **Data, documentation and charts beside your AI conversation**.

**Voiceover:**

> When you work with an AI on a dataset, you need to see what changed. DataPressr Preview puts your data, documentation and charts beside the conversation, inside BB. Here’s the workflow.

**Live action:** open the existing Keeling story before recording. Start on the useful result, with no loading screen.

### 2. Pick a file — 0:15–0:33

**Visual:** [Artifact picker](../benchmarks/images/bb-v01-picker.png), followed by [story/document preview](../benchmarks/images/bb-v01-story.png). Highlight the search field and selected relative path. Caption: **Right panel → + → DataPressr Preview**.

**Voiceover:**

> Open DataPressr Preview from the conversation’s right panel. Search the workspace, choose a dataset resource, or enter a relative file path. The panel follows this conversation’s actual worktree, so you can see which file you’re looking at.

**Live action:** open the panel, search `co2-ppm`, and choose its README. For a still-only cut, the existing picker image shows a story selection; keep the narration general as written. A dedicated README screenshot is optional, not present in this asset list.

### 3. Inspect the data — 0:33–0:50

**Visual:** [CO₂ table](../benchmarks/images/bb-v01-csv-co2.png). Move from the selected filename to the column headings and values. Caption: **CSV preview · values and column names**.

**Voiceover:**

> Switch to a CSV to inspect the column names and values. Large tables use a clearly labeled sample, keeping the preview manageable. The viewer is read-only: changes happen through the agent and the files in your project.

**Live action:** open `datasets/climate-and-environment/co2-ppm/data/co2-annual-global.csv`. This file has 47 rows and is not itself truncated. If you show the sample limit, use the [Brent table screenshot](../benchmarks/images/bb-v01-csv-wide.png), which explicitly shows the 200-row cap.

### 4. Use a skill — 0:50–1:10

**Visual:** [Codex validation and edited README](../benchmarks/images/bb-v01-codex-edit.png). First frame the left-hand validator output, then widen to show the document. Caption: **Canonical validate skill · disposable dataset copy**.

**Voiceover:**

> The existing DataPressr skills are available in BB. Here, Codex has run the validate skill on a disposable dataset copy. The result is visible in the conversation: no errors and no warnings. The same workflow was also tested with Claude Code.

**Live action:** use prompt A below. Keep the actual result; if it differs, explain or correct the fixture instead of replacing its output in the edit. Validation checks the package conventions, not the scientific truth of the source data.

### 5. Ask for a change — 1:10–1:30

**Visual:** keep [the Codex edit screenshot](../benchmarks/images/bb-v01-codex-edit.png), then optionally cut to [the Claude Code result](../benchmarks/images/bb-v01-claude-edit.png). Point to the requested sentence on the left and its rendered paragraph on the right. Caption: **Agent edits file → preview refreshes**.

**Voiceover:**

> Now ask for a small documentation change. The agent edits the README, and the open preview refreshes automatically. In this test, the requested sentence appears beside the conversation. You can check the result while you continue discussing the work.

**Live action:** select the disposable README before sending prompt B. Record through the real refresh, with the development watcher stopped. Trim model waiting time if needed, with an obvious cut. The existing still records the outcome; it does not demonstrate elapsed time. Avoid a simulated typing or refresh animation presented as live footage.

### 6. Read a story with its charts — 1:30–1:50

**Visual:** [Keeling story](../benchmarks/images/bb-v01-story.png), then [seasonal chart](../benchmarks/images/bb-v01-story-seasonal.png). Caption: **Markdown + local SVG charts**.

**Voiceover:**

> The preview also renders Markdown stories with their local chart images. This is the existing Keeling Curve story, with its annual trend and seasonal cycle. You can read the explanation and inspect the charts in the same workspace as the agent.

**Live action:** open `site/stories/keeling-curve.md` and scroll to the seasonal chart. Do not change this source story for the demo.

### 7. A rebuilt chart updates too — 1:50–2:05

**Visual:** [Provider-rebuilt chart](../benchmarks/images/bb-v01-provider-chart.png). Frame the agent’s build result and blue bar together. Caption throughout: **Illustrative test chart · not CO₂ data**. Secondary caption: **Chart rebuilt; Markdown unchanged**.

**Voiceover:**

> Chart updates work too. In this simple test fixture, the agent changes an input and rebuilds the SVG. The embedded chart updates even though the surrounding Markdown has not changed.

**Live action:** use the separate fixture and prompt C below. Show its green 40/100 bar before the change and blue 80/100 bar after it. The current screenshot pack contains only the final blue-bar state; capture the initial state if you want a before-and-after pair. Do not imply that the bar belongs to the Keeling dataset.

### 8. Close with the next step — 2:05–2:15

**Visual:** return to the real Keeling story, then an end card. Text: **Try DataPressr Preview v0.1** / **Local source install · BB** / **Tutorial linked below**.

**Voiceover:**

> That’s DataPressr Preview v0.1: work through the conversation, inspect the files, and see the results together. Follow the linked tutorial to install it in your local BB setup.

**Link for the video description:** use the [guide on the implementation branch](https://github.com/datasets/datapressr/blob/feat/bb-v01/site/docs/bb-preview.md) until the release is merged. Afterward, link to the published tutorial or its `main` GitHub page. Do not show an unverified website URL on the end card.

## Still-image production recipe

1. Use a 1920 × 1080 canvas. The existing screenshots are taller than 16:9; fit them first, then create deliberate detail crops. Never stretch them to fill the canvas.
2. Reframe around the conversation and preview. Remove unrelated sidebar thread names from the frame, and avoid lingering on machine-specific paths. Keep the selected relative filename when it helps explain the action.
3. Use the eight scenes above, typically with two framings per scene: whole workflow, then the relevant detail. Keep zoom modest so table text remains readable. Use hard cuts between tasks and short dissolves between framings of the same screenshot.
4. Record the supplied voiceover as one track, or one clip per scene. Place pauses at scene boundaries; adjust the picture durations to the actual reading. Add captions from the final spoken take.
5. Keep captions and callouts outside the parts of the interface being discussed. Use the proposed overlays sparingly; the voiceover carries the explanation.
6. Export an MP4 with H.264 video and AAC audio, and an SRT caption file. Watch the entire export at normal size and confirm text is legible, narration matches the image, and no cut implies an interaction that was not captured.

No additional screenshot capture is needed for this first still-only cut. A README opening shot and a chart-before shot would improve a longer walkthrough, but are optional extras.

## Live recording setup

Use the [tutorial](../../site/docs/bb-preview.md) to install the plugin first. Record in a disposable DataPressr worktree with a dedicated conversation and an already configured provider. Keep installation out of the short demo. Stop `bb plugin dev` before recording refresh behavior.

For a repeatable dataset and chart fixture, run this from the root of that disposable worktree. It deliberately refuses to overwrite an existing demo directory:

```sh
demo_dir=preview-demo
if [ -e "$demo_dir" ]; then
  echo 'preview-demo already exists; choose a fresh disposable worktree.'
  exit 1
fi
mkdir -p "$demo_dir/dataset/scripts"
cp -R datasets/climate-and-environment/co2-ppm/data "$demo_dir/dataset/"
cp datasets/climate-and-environment/co2-ppm/datapackage.json "$demo_dir/dataset/"
cp datasets/climate-and-environment/co2-ppm/AGENTS.md "$demo_dir/dataset/"
cp scripts/validate-datapackage.mjs "$demo_dir/dataset/scripts/"
printf '# CO₂ demo copy\n\nA disposable dataset copy for the DataPressr Preview walkthrough.\n' > "$demo_dir/dataset/README.md"
cp -R desktop-app/tests/fixtures/chart "$demo_dir/chart"
node "$demo_dir/chart/build.mjs"
```

Open `preview-demo/dataset/README.md` in DataPressr Preview. The eight skills should be present in a new conversation after plugin installation. Use one provider for the main take; the optional Claude screenshot demonstrates that the second provider was also exercised, without suggesting simultaneous edits.

### Prompt A — validate

```text
Use the DataPressr validate skill on preview-demo/dataset. Read the project and dataset AGENTS instructions and follow the skill, including running the local validator. Show its output. This is a disposable demo: do not edit files, publish, commit or manage Beads.
```

### Prompt B — bounded documentation edit

```text
Append this paragraph exactly once to preview-demo/dataset/README.md:

Codex validation completed successfully in BB.

Preserve the existing content. Only edit this README. Do not publish, commit or manage Beads.
```

Use “Claude Code” in the sentence if recording with Claude Code. Keep the same README selected throughout. The recorded acceptance images used the equivalent `preview-fixtures/provider-dataset/` directory; the new recording uses `preview-demo/dataset/` to avoid overwriting them.

### Prompt C — rebuild the illustrative chart

First select `preview-demo/chart/story.md` and capture its initial green bar.

```text
In preview-demo/chart/input.json, set label to "After rebuild", value to 80, and color to "#2563eb". Run node preview-demo/chart/build.mjs to regenerate chart.svg. Do not change story.md, build.mjs or any other files. This is an illustrative demo fixture, not a change to the CO₂ dataset. Do not publish, commit, manage Beads or start a story workflow.
```

Keep the story selected until the updated bar appears. If replaying the take, use a fresh fixture or explicitly reset only its input to the checked-in values and rerun its builder before recording.

## Claims to keep precise

- v0.1 is a local BB plugin with a source installation, not a separately packaged standalone desktop executable.
- The viewer is read-only. The agent changes project files; opening the viewer does not initiate model work.
- Markdown, CSV, static HTML and local image files are supported. Arbitrary JavaScript charts and remote execution hosts are outside v0.1.
- Small acceptance edits appeared in about one second. A still-image video cannot prove refresh speed, so use “refreshes automatically” unless showing a measured live take.
- Canonical skills retain their existing review and publishing gates. This demo validates and edits disposable fixtures; it does not publish anything.

See the [acceptance evidence](../benchmarks/bb-preview-v01.md) for the actual provider runs, versions, refresh measurements and screenshots behind this script.
