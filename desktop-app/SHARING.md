# DataPressr demo videos

Local video exports for comparing and sharing the DataPressr prototype. Both MP4s live in this app’s `demos/` directory and are excluded from Git by `.gitignore`. This file and the production sources are versioned. The videos are not uploaded to a public host and will not appear in a fresh clone.

## Versions

| Version | Local video | Duration | Notes |
|---|---|---|---|
| v1 — original walkthrough | [datapressr-demo-v1.mp4](demos/datapressr-demo-v1.mp4) | 1:58.708 | Eight scenes. Detailed BB preview walkthrough: picker, CSV, validation, document edit, story and illustrative chart rebuild. Preserved byte-for-byte from the first export. |
| v2 — vision and prototype | [datapressr-demo-v2.mp4](demos/datapressr-demo-v2.mp4) | 0:49.750 | Opens with a broad data-to-story ambition; this framing was superseded by the brand clarification below. Introduces the early prototype inside BB once, then shows CSV, a document edit result and the Keeling story. Six scenes, 133 spoken words. |

Both versions use 1920 × 1080 H.264 at 24 fps, AAC audio, local synthetic narration (Kokoro `bf_emma`) and burned-in captions. They are made from actual prototype screenshots with modest motion. The screenshots show recorded results, not a live interaction. No stock footage or music is included.

The v2 cut uses the existing acceptance-test README edit screenshot. A future customer-facing capture with a useful paragraph change would improve it; the proposed recapture is described in the [visual assessment](../docs/demos/bb-preview-short-demo.md). Its opening uses the earlier broad framing; the following scenes show the current prototype. The video does not demonstrate the complete source-to-published-dataset workflow.

## Local location

The export pair currently lives in this development checkout:

```text
/Users/rgrp/.config/superpowers/worktrees/datapressr/bb-v01/desktop-app/demos/
```

Open either relative link above from this checkout, or use:

```sh
open desktop-app/demos/datapressr-demo-v1.mp4
open desktop-app/demos/datapressr-demo-v2.mp4
```

The original v1 export also remains at `docs/demos/hyperframes/output/datapressr-preview-v01.mp4`. The named copy in this directory has the same SHA-256 digest:

```text
a4dd00a352470cf828bfad3585784fa0c7e164dca7cc22a9a9d4b3e89443b681
```

## Scripts and reproduction

- [Original storyboard](../docs/demos/bb-preview-v01.md) and [original narration](../docs/demos/bb-preview-v01-voiceover.txt).
- [v2 narration](../docs/demos/datapressr-demo-v2-voiceover.txt), [v2 composition builder](../docs/demos/hyperframes/build-v2.mjs) and [v2 render command](../docs/demos/hyperframes/render-v2.mjs).
- [Hyperframes setup instructions](../docs/demos/hyperframes/README.md), including local speech dependencies and model-download workaround.

After installing those dependencies, run from `docs/demos/hyperframes/`:

```sh
node build-v2.mjs --speech
npm run render:v2
```

The v2 builder stages its own composition, narration and assets in the ignored `v2/` directory. It does not change the original composition or WAVs. The v2 render command refuses to overwrite `desktop-app/demos/datapressr-demo-v2.mp4`. To make another cut, select a new version filename in the render script and add it to the table; preserve these comparison copies.

## Sharing copy

> We’re building DataPressr: skills and tools for wrangling data and creating data-driven stories with AI. This demo shows the app—your conversation with an agent beside the data, documents and charts you’re working on.
>
> Setup guide: https://github.com/datasets/datapressr/blob/feat/bb-v01/site/docs/bb-preview.md

Use that branch guide until the feature is merged and the published tutorial URL is verified. The MP4s need to be attached or uploaded separately; a GitHub link to their ignored local paths will not work.

## Export checks on 2026-10-01

- v1: 28,263,709 bytes; the preserved copy’s hash matches the original export.
- v2: 21,821,187 bytes; 49.750 seconds; 1920 × 1080 at 24 fps; H.264 video and 48 kHz stereo AAC audio. SHA-256: `371805c7e8f558b1fae6f903b14caee304326705a9ed970f17f7ad00ea6ffc68`.
- Hyperframes v2 checks: no runtime, layout or motion errors; 45/45 contrast checks passed. Eight advisory composition-structure and repeated-image warnings remain.
- All six scene snapshots and the ending were visually inspected, plus a frame extracted from the encoded MP4. FFmpeg decoded the complete v2 export without errors. Audio signal measured −22.2 dB mean and −1.5 dB peak; this was not a full listening review.
- Sentence caption timings are estimated from the measured voice clips. For a public final cut, review spoken delivery and caption alignment.
- Both MP4 paths are ignored by Git. Only source and notes are committed.


## Positioning revision after v2

The owner clarified that DataPressr is skills and an app for wrangling data and creating data-driven stories in the AI age. This video demonstrates the app: an integrated place to work with an agent and view the data and stories. Start with brief audience context, introduce the suite, then show the app. Mention BB once as the prototype host. The [brand reference](../docs/brand.md) contains the proposed next opening. Neither existing video has been changed.

## Narration direction for a future cut

The owner found the current local synthetic voice flat, with insufficient pacing. No replacement voice has been generated yet. Recommended production experiment:

1. Audition two or three conversational ElevenLabs voices on the same 15–20 seconds of script. Use its expressive model controls and model-specific prompting; v3/v4 use audio tags and punctuation rather than SSML break tags. See the [official prompting guide](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).
2. For tighter performance control, record a guide take with the desired emphasis and pauses, then try [ElevenLabs Voice Changer](https://elevenlabs.io/docs/overview/capabilities/voice-changer). The source performance supplies the delivery; this is distinct from cloning a voice.
3. Cartesia is an alternative for an API workflow; its [official SDK examples](https://github.com/cartesia-ai/cartesia-python/blob/main/examples/examples.py) demonstrate changing speed and emotion.
4. Choose the performance by listening. Generate coherent passages with room for a thought to develop, then edit at natural boundaries. Add deliberate silence when the viewer needs time to read a result, rather than relying on a single global speed setting.
5. Finish the narration first, place visual cuts around it, and align captions to the final audio. Our existing builder measures WAV durations, so a new provider can supply audio without replacing Hyperframes. Preserve v1/v2 and export a new version.

Suggested direction for auditioning: “Show a curious colleague what you’ve built. Warm, matter-of-fact, lightly amused. Give the viewer time to look. Let the aside pass naturally.” This is performance direction, not literal spoken text or guaranteed API syntax. Provider capabilities above were checked against official sources on 2026-10-01; no paid service was configured or called.
