# DataPressr demo feedback and take history

Working record of the owner’s feedback, the resulting decisions and the local video takes. Updated 2026-10-01. [SHARING.md](../../desktop-app/SHARING.md) has playable local links, technical checks and rebuild notes. MP4s are deliberately ignored by Git; source and notes are versioned.

## Current direction

Make the app understandable with sound off. Use short story cards between large views of the real product. Show actions and their consequences: opening the panel, choosing data, asking for a useful change, seeing it in the file, then exploring a story. Keep the video under a minute. Voice is dropped for now.

DataPressr is skills and tools for wrangling data and making data-driven stories in the AI age. The app is one part of that suite: an integrated place to work with an agent and view the outputs. BB is the current prototype host. The owner approved the suite-to-app introduction; the new silent format compresses that into opening cards rather than reading the whole spoken introduction on screen. See [brand.md](../brand.md).

## Takes and what we learned

| Take | What it tried | Owner feedback or decision | Consequence |
|---|---|---|---|
| v1 — 1:58.708 | Narrated eight-scene tour using acceptance screenshots, setup, CSV, validation, document edits, stories and a test chart. | “Too long and a bit boring.” Requested a demo-writing sub-agent, friendly authentic PostHog-like tone, mild humor, and a check of screenshots/free stock. | Cut the feature inventory. Center the request-and-visible-result moment. A dedicated writer proposed a 118-word script. |
| Short-script draft — not rendered as its own take | “Your AI says ‘done.’ You’d quite like to see what it did.” Five-scene structure. | Requested a new render but with vision first, then introduction of the BB prototype. | Led to v2. Preserve the distinction between this draft and an actual exported video. |
| v2 — 0:49.750 | Six scenes opening on a broad data-to-story vision. | Narration was flat and lacked pacing. Opening described what anyone wants to do with data, rather than what DataPressr is. Clarification: DataPressr is skills and an app; this demo is about the app. “Like Claude Design, but for data-driven insight” is a useful analogy. | Created the brand reference. Proposed a short audience → suite → app opening, followed by demonstration. Researched better voice options. |
| v3 — 0:50.292 | Approved suite/app opening, 117 words, slower Kokoro delivery and longer scene pauses. Same basic screenshot layout. | Opening approved. Asked to automate better voice generation rather than require manual work. Considered dropping voice and interleaving story cards with app imagery. Then: imagery is “very boring”; actual clicking/results or a BB setup view would help. Explicit decision: drop narration for now and try that direction. | Change the visual format, capture fresh product states and a useful edit, make the story work silently. |
| v4 — 0:46.000 | Silent film with 18 visual beats, purple story cards and large app views. Fresh real panel opening, search/dropdown/CSV sequence, README edit request/result, and story navigation/scroll states. | New experiment; awaiting owner reaction. | Assess whether the visual sequence carries the story and whether the result is readable at normal playback size. |

## Feedback to carry forward

- Preserve a concrete product identity. A generic ambition for better data work should not consume the opening.
- The app demo belongs within the wider skills-and-tools suite. Mention BB briefly as the prototype’s home.
- Give the viewer something to follow. A meaningful request and an understandable result are stronger than validation logs, acceptance-test labels or an arbitrary test chart.
- Vary the visuals. Avoid repeating a large slogan on the left and a tall screenshot on the right throughout the film.
- Use short cards to explain the next action, then let the actual app fill the screen. Avoid turning the entire old narration into dense text slides.
- The voice is currently off. If revisited, automate generation and assembly through an API; the owner wants minimal manual effort. A higher-quality voice still needs performance direction and deliberate pacing.
- Stock footage was researched, but is not a priority for this demo. Real app interactions contribute more to the story.
- Keep previous takes intact, keep MP4s local and uncommitted, and record what each version tried.

## v4 capture and editorial record

Captured a new dedicated BB conversation, `thr_mgbc27z9xg`, in the `bb-v01` checkout, with the sidebar hidden to remove unrelated thread clutter. The agent read a disposable CO₂ README, then received this real request:

> Add a short “What does ppm mean?” section to preview-demo-v4/README.md. Explain it in plain English. Keep the rest unchanged.

Codex added the section, and the selected preview displayed the changed file. The capture pack includes the initial README, the composed request, the submitted request and the actual resulting section. [Before](assets/v4/README-before.md) and [after](assets/v4/README-after.md) copies record the fixture contents. The original dataset files were not changed by this demonstration.

The [capture manifest](assets/v4/captures.json) records timestamps for 13 source screenshots. They document actual computer-controlled actions: open DataPressr Preview, type a search, open the artifact menu, select the CSV, open the README, submit the request, open the story and scroll. No screenshot text or app behavior was invented or painted over.

The available computer-control interface supplied screenshots, not a continuous screen-recording stream. v4 therefore edits real action/result states into a sequence with hard cuts, close-ups and brief holds. It is not uninterrupted live footage and does not prove refresh speed. The agent’s wait is shortened and labeled. This still leaves an opportunity for a later continuous recording to add smoother cursor movement and scrolling.

The BB setup beat shows opening the already installed preview panel. It is not an installation tutorial. The source captures and the new silent composition are reproducible from the repository; generated media and raw capture copies are ignored. The disposable `preview-demo-v4/` folder is ignored and left in place so the captured thread can still display it.
