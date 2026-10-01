# DataPressr Preview video — Hyperframes

A narrated, screenshot-based demo built from the [approved script](../bb-preview-v01.md) and the real BB acceptance captures. The current cut is about 1 minute 59 seconds at 1920 × 1080, 24 fps. It uses a local synthetic British English voice (Kokoro `bf_emma`), restrained screenshot motion, and burned-in captions. The rebuilt bar chart is explicitly labeled as an illustrative fixture.

## Files

- `build.mjs`: reproducible HTML composition, asset staging, scene timing and caption generation.
- `package.json` / `package-lock.json`: pinned Hyperframes 0.8.103 and GSAP.
- `BRIEF.md`: the agreed scope and treatment.
- Generated `index.html`: editable/previewable Hyperframes composition.
- Generated `assets/voice-*.wav`: scene narration, synthesized locally.
- Generated `captions.srt`: captions with sentence timings estimated within each measured voice clip.
- Generated `output/datapressr-preview-v01.mp4`: the rendered deliverable.

Generated files, local fonts, models, Python environment and dependencies are excluded from Git. The MP4 is available in this checkout after rendering; it is not published or uploaded to a video host.

## Rebuild on macOS

Requires Node 22+, FFmpeg/ffprobe and Python. Run from this directory. The script reads the sibling voiceover text and repository screenshot files, so keep it in the DataPressr checkout.

```sh
npm ci --ignore-scripts
python3 -m venv .venv
.venv/bin/pip install kokoro-onnx==0.4.7 soundfile==0.14.0
node build.mjs --speech
npm run render
```

Speech generation downloads approximately 337 MB of Kokoro model/voice data on first use. No API key is needed. The builder stages the local macOS Arial fonts for rendering; it does not commit or redistribute font files. On another platform, change those two font source paths to fonts you have permission to use.

To reuse existing speech, run `npm run build` without `--speech`. If the narration changes, regenerate it. The build derives scene lengths from the actual WAV durations, adds breathing room, and writes both the HTML and SRT.

## Preview and inspect

```sh
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes check
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes snapshot --at 6,21,36,52,68,84,99,112 --output /tmp/datapressr-video-frames --describe false
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes preview
```

The composition uses one timeline with eight deliberately small scene groups. Hyperframes gives advisory lint warnings about nesting/track density and repeated screenshot sources. Runtime, layout, motion and contrast checks passed; the intentional screenshot cropping is marked as allowed overflow. All scene snapshots were visually inspected. Caption sentence timings are approximate, not word-aligned transcription; review them against the final spoken take before a polished public release.

## Render verification

The exported first cut is 118.708 seconds, 28,263,709 bytes, H.264 at 1920 × 1080 / 24 fps with stereo AAC at 48 kHz. FFmpeg decoded the entire export without errors. Encoded frames at 52 and 68 seconds were inspected in addition to the scene snapshots. Audio is present (mean −22.8 dB, peak −1.5 dB); this is a technical signal check, not a full listening review.

## Download workaround observed in this environment

The CLI's Node downloader stalled when fetching voice/model files, while curl against the exact same upstream release URLs succeeded. If this happens, download the files to temporary paths, then move them into Hyperframes' cache only after successful completion:

```sh
mkdir -p "$HOME/.cache/hyperframes/tts/voices" "$HOME/.cache/hyperframes/tts/models"
curl -fL --retry 2 -o /tmp/datapressr-voices.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin && mv /tmp/datapressr-voices.bin "$HOME/.cache/hyperframes/tts/voices/voices-v1.0.bin"
curl -fL --retry 2 -o /tmp/datapressr-kokoro.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx && mv /tmp/datapressr-kokoro.onnx "$HOME/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"
```

The official [Hyperframes source and guides](https://github.com/heygen-com/hyperframes) supplied the composition contract and CLI commands. Rendering is local; no hosted rendering service or public feedback submission was used.

## Vision and prototype cut

The second cut is isolated from the original: `node build-v2.mjs --speech` stages the new narration and composition under ignored `v2/`, then `npm run render:v2` exports a separately named MP4 into `desktop-app/demos/`. It refuses to overwrite that version’s existing export. See the app’s [SHARING.md](../../../desktop-app/SHARING.md) for both local video links, descriptions and reproduction notes. The original `build.mjs` and original export remain available.


## App focused cut

Version 3 uses the approved suite-and-app introduction: `node build-v3.mjs --speech`, then `npm run render:v3`. It stages separate assets under ignored `v3/`, enforces a duration below 60 seconds, and writes an exclusively created `desktop-app/demos/datapressr-demo-v3.mp4`. See [SHARING.md](../../../desktop-app/SHARING.md) for the version comparison and local playback links.
