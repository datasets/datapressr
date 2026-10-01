# DataPressr Preview short demo script

A 118-word rewrite of the first demo, targeting 55–60 seconds with pauses. The focus is inspecting data and seeing an agent’s changes beside the conversation. This is the proposed next cut; the existing 1:59 MP4 still uses the original script. The [voiceover text](bb-preview-short-voiceover.txt) is ready for recording.

## Voiceover

> Your AI says “done.” You’d quite like to see what it did.
>
> DataPressr Preview puts your data, docs and charts beside the conversation in BB.
>
> Open a CSV. Check the actual numbers. Read the README. It’s all there while you work.
>
> For changes, ask Codex or Claude Code. The agent edits the file; the preview updates automatically.
>
> Here’s the request. And here’s the edited paragraph. Less tab tennis.
>
> You can open a whole data story, too. The explanation and the charts, together. This one shows how carbon dioxide changes over time.
>
> That’s the idea: ask for something, then look at what actually changed.
>
> Try DataPressr Preview in BB. It’s an early version, and the setup guide is below.

## Shot list

Timing is an editing target, not a measured new recording. Read warmly, as if showing a colleague something useful. Pause briefly after “done.” Deliver “Less tab tennis” casually. Avoid an announcer voice.

| Target | Picture | Voiceover cue |
|---|---|---|
| 0:00–0:12 | Start on the actual chart in DataPressr Preview, with the product name visible. Widen to establish BB. No separate logo sequence. | “Your AI says…” through “…in BB.” |
| 0:12–0:22 | Close crop of the CSV headings and a few rows; cut to a readable README. | “Open a CSV…” |
| 0:22–0:38 | Show a real request and its resulting paragraph beside it. Emphasize the request, then the changed text. | “For changes…” through “Less tab tennis.” |
| 0:38–0:51 | Show the Keeling story and annual chart, first in context, then closer. Keep axes visible. | “You can open…” through “…actually changed.” |
| 0:51–0:59 | Leave the product visible. Add “Try DataPressr Preview in BB · v0.1 · Setup guide below.” | Final invitation. |

The concrete edit is the main product moment. Installation, validator output, provider test results, worktree details and the illustrative bar-chart fixture are omitted from this cut. They remain in the [longer production guide](bb-preview-v01.md) and [tutorial](../../site/docs/bb-preview.md).

Use the [branch tutorial](https://github.com/datasets/datapressr/blob/feat/bb-v01/site/docs/bb-preview.md) in the video description until the feature is merged and a published tutorial URL is verified.

## Screenshot assessment

Reviewed the six original captures below at source resolution on 2026-10-01. They are 2560 × 1800 and need deliberate crops for a 1920 × 1080 video. A full-window fit makes useful text too small and devotes too much space to an idle conversation and sidebar.

| Capture | Assessment | Use in the next cut |
|---|---|---|
| [Clean installation](../benchmarks/images/bb-v01-clean-install.png) | Strong annual chart and visible product name. The conversation is an acceptance fixture saying “Ready,” so it is weak as a whole-screen hero. | Use a preview-panel crop for the opening. Prefer a fresh conversation/result capture for the wider view. |
| [CO₂ CSV](../benchmarks/images/bb-v01-csv-co2.png) | Clear headings and real values. The surrounding chat is empty of useful work. | Keep. Crop around the filename, row count, headings and first several rows. |
| [Keeling story](../benchmarks/images/bb-v01-story.png) | Strong annual-chart image; axes unobscured. Sidebar and test conversation add clutter. | Keep the story-panel crop for the chart scene. |
| [Seasonal story](../benchmarks/images/bb-v01-story-seasonal.png) | Useful chart, but the pointer halo sits over it. | Prefer the annual chart for this cut. Recapture with the pointer away if using the seasonal view. |
| [Claude edit](../benchmarks/images/bb-v01-claude-edit.png) | Request and resulting paragraph are both present. The title “CO₂ preview acceptance copy” and validation sentence make it feel like a test report. | Technically usable fallback; replace with a useful README change for the strongest version. |
| [Codex edit](../benchmarks/images/bb-v01-codex-edit.png) | Similar test content, plus prominent machine-specific skill paths and validator output. | Omit from this short cut. |

### The capture worth doing next

In a disposable copy of the CO₂ dataset, open its README and ask:

```text
Read this dataset’s datapackage.json. Rewrite the README introduction in plain English: what the dataset contains and what someone could use it for. Preserve the factual meaning. Change only this README; leave data files unchanged.
```

Record the actual request and response with the resulting paragraph visible in the preview. Use a plainly named demo conversation, move the pointer off the content, and frame the request and result large enough to read. Take a before and after still if a live recording is impractical. The request above is proposed; it has not been run or captured for this rewrite.

Existing stills can support a draft with “Here’s the request. And here’s the edited paragraph.” They show the outcome of a real test. They cannot demonstrate elapsed refresh time. Do not replace the screenshot’s test words with invented customer-facing UI text or animate it as if it were a live interaction.

## Free stock footage shortlist

Two optional candidates found on Pexels. Their listing details and the current license were checked on 2026-10-01; the clips have not been downloaded or reviewed in motion. These are sourcing candidates, not approved final footage.

| Candidate | Listed details | Possible placement | Editorial recommendation |
|---|---|---|---|
| [Hands typing beside a smartphone](https://www.pexels.com/video/a-person-typing-on-a-laptop-8165661/) by MART PRODUCTION | 4096 × 2160, 30 seconds, 25 fps | A 1–2 second insert during the opening line, followed immediately by BB. | Only use if the motion gives the opening a useful human beat. Keep generic screen content out of focus and do not imply it shows DataPressr. |
| [Coffee beside a laptop](https://www.pexels.com/video/a-cup-of-coffee-on-the-table-4316098/) by Engin Akyurt | 3840 × 2160, 34 seconds, 25 fps | Alternative 1–2 second opening detail. | Lower priority: pleasant, but it adds little to this particular story. Do not add a coffee joke just to justify the shot. |

Pexels permits free use, editing and product promotion, with no required attribution. Its license prohibits implied endorsement by depicted people or brands. These clips use the [Pexels License](https://www.pexels.com/license/), not a public-domain dedication. Keep source and creator credit in production notes if used.

Recommend the product-only version first. An optional two-second stock opening can replace part of the opening image without increasing runtime. A useful edit captured in BB will contribute more than a stock montage.

## Tone and production notes

The rewrite was drafted by a dedicated demo-writing sub-agent and reviewed against the actual captures. It follows the plain, specific, conversational approach in [PostHog’s voice and tone guide](https://posthog.com/handbook/brand/tone), with one understated aside. The words are original DataPressr copy.

Keep the original [Hyperframes project](hyperframes/README.md) reproducible: it currently reads the eight-paragraph original voiceover and uses the original eight scene timings. This new script needs its own five-scene composition and freshly generated narration. No new video was rendered as part of this script revision.
