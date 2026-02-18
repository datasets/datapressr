---
number: 13
title: Unicode Codes
state: open
author: rufuspollock
created_at: "2013-04-15T07:33:04Z"
updated_at: "2024-10-17T11:06:18Z"
labels: ["Type: Reference", "Priority: ★★★", hackathon]
assignees: [solo11]
---

# Unicode Codes

http://www.unicode.org/Public/UNIDATA/UnicodeData.txt

## Comments

### hirntodt (2015-02-26T20:27:43Z)

I can package this one.The data is already in csv format.

i will research what's actually in there and get back for discussion of what we want to include etc.

### rufuspollock (2015-12-02T05:44:41Z)

@hirntodt how are you doing here? It would be great to get this packaged. /cc @pdehaye

### zelima (2016-04-20T19:23:28Z)

@rgrp I can package this one, just not really get what column names should be..

### rufuspollock (2016-04-21T08:38:08Z)

@zelima great - please move ahead. Can you copy a small sample of the data here for us to look at. @hirntodt suggested this was already in CSV format so we may not need to do much.

### zelima (2016-04-21T10:24:57Z)

@rgrp yes it is.. Just it does not have header.

sample

```
0056;LATIN CAPITAL LETTER V;Lu;0;L;;;;;N;;;;0076;
0057;LATIN CAPITAL LETTER W;Lu;0;L;;;;;N;;;;0077;
0058;LATIN CAPITAL LETTER X;Lu;0;L;;;;;N;;;;0078;
0059;LATIN CAPITAL LETTER Y;Lu;0;L;;;;;N;;;;0079;
005A;LATIN CAPITAL LETTER Z;Lu;0;L;;;;;N;;;;007A;
005B;LEFT SQUARE BRACKET;Ps;0;ON;;;;;Y;OPENING SQUARE BRACKET;;;;
005C;REVERSE SOLIDUS;Po;0;ON;;;;;N;BACKSLASH;;;;
005D;RIGHT SQUARE BRACKET;Pe;0;ON;;;;;Y;CLOSING SQUARE BRACKET;;;;
005E;CIRCUMFLEX ACCENT;Sk;0;ON;;;;;N;SPACING CIRCUMFLEX;;;;
005F;LOW LINE;Pc;0;ON;;;;;N;SPACING UNDERSCORE;;;;
0060;GRAVE ACCENT;Sk;0;ON;;;;;N;SPACING GRAVE;;;;
```

### rufuspollock (2016-04-24T10:29:49Z)

@zelima can you suggest headers based on your inspection.

### zelima (2016-04-25T17:31:04Z)

To be honest I don't know, but According to - some of ftp://ftp.unicode.org/Public/UNIDATA/ files - They might be:
`Unicode,Schematic Name,General_Category property value,,,CJK Radical,Code Point Sequence for USI,,,ast_Asian_Width property,The formal name aliases,,,mapping,`

### abiola-adeoye (2023-09-29T08:37:05Z)

@anuveyatsu I'd like to take this issue as a prerequisite to applying for the DE role

### rufuspollock (2024-06-07T14:34:55Z)

@Mikanebu did this get completed?

### solo11 (2024-10-09T19:10:59Z)

@rufuspollock @anuveyatsu  I can help here if this issue has not already been worked on, I have a fair idea about where to look for the headers, documentation and references.

### anuveyatsu (2024-10-10T10:51:01Z)

hi @solo11 it would be great if you could work on it - thanks!

### solo11 (2024-10-11T19:43:25Z)

@anuveyatsu This is what I came up with -  https://github.com/solo11/Unicode-Codes

### anuveyatsu (2024-10-13T06:31:38Z)

hi @solo11 thanks for this - great stuff! Could you open PR against this repository so that I can properly review it please? https://github.com/datasets/unicode-characters

### solo11 (2024-10-14T20:32:22Z)

@anuveyatsu Sure, the repo is empty though I cannot open a PR

### anuveyatsu (2024-10-16T10:59:35Z)

@solo11 it is a new repo so yes it's empty. Could you fork that repo and push your commits into a fork? Then you could open a PR.

### solo11 (2024-10-16T12:43:20Z)

Fork will not work without any files, can you add a README to the repo?
Refer to this https://github.com/expressjs/.github/issues/1

On Wed, Oct 16, 2024 at 6:59 AM Anuar Ustayev (aka Anu) <
***@***.***> wrote:

> @solo11 <https://github.com/solo11> it is a new repo so yes it's empty.
> Could you fork that repo and push your commits into a fork? Then you could
> open a PR.
>
> —
> Reply to this email directly, view it on GitHub
> <https://github.com/datasets/awesome-data/issues/13#issuecomment-2416469686>,
> or unsubscribe
> <https://github.com/notifications/unsubscribe-auth/AHXVILCJRRNOXHUYCVGWYCTZ3ZBK7AVCNFSM6AAAAABI6ZGHMKVHI2DSMVQWIX3LMV43OSLTON2WKQ3PNVWWK3TUHMZDIMJWGQ3DSNRYGY>
> .
> You are receiving this because you were mentioned.Message ID:
> ***@***.***>
>

### anuveyatsu (2024-10-17T11:06:16Z)

@solo11 fixed :+1:
