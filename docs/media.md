# Lesson media (audio recordings)

Each lesson can carry a companion audio recording — a spoken walkthrough of the
same material. This is how to add one and keep it free to host.

## The constraint that decides everything

**Cloudflare Pages has a hard 25 MiB limit per file, on every plan**, and the
Free plan allows 20,000 files per site. A recording over 25 MiB will not deploy.

That single number drives the rest of this document.

Sources: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits),
[Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing).

## Rules

1. **Audio only.** These are talk recordings. Video is wasted bytes against a
   25 MiB budget, and nobody watches a static slide for an hour.
2. **Mono.** Speech gains nothing from stereo and it doubles the bitrate needed.
3. **Target ~20 MB**, not 24.9. Headroom means a re-record does not suddenly
   breach the cap.
4. **No third-party embeds.** Not a podcast host, not YouTube, not Spotify. An
   embed hands the reader to someone else's tracker, and this site does not do
   that (see `CLAUDE.md`, "It stays free"). A plain `<audio>` element has
   accessible, keyboard-operable controls for free.
5. **The written lesson is the transcript.** The prose covers the same material,
   so the recording is never the only way to get the content. Keep it that way —
   it is an accessibility floor, not a nice-to-have.

## Encoding

macOS has `afconvert` built in, so **no install is needed** — not ffmpeg, not
anything. Check what you have first:

```sh
afinfo ~/Downloads/your-recording.m4a
```

Note `estimated duration` (seconds) and whether it is already mono.

Pick a bitrate from the duration, aiming at ~20 MB:

| Duration | Bitrate | Resulting size |
| --- | --- | --- |
| ~30 min | 64 kbps | ~14 MB |
| ~45 min | 56 kbps | ~19 MB |
| ~55 min | 48 kbps | ~20 MB |
| ~90 min | 32 kbps | ~22 MB |

The arithmetic is `bitrate × seconds ÷ 8`. Then:

```sh
afconvert -f m4af -d aac -b 48000 -s 1 \
  ~/Downloads/your-recording.m4a \
  public/audio/<course>/<lesson>.m4a
```

- `-f m4af -d aac` → AAC-LC in an MP4 container (`.m4a`), which every current
  browser plays. Avoid HE-AAC: smaller, but support outside Safari is uneven.
- `-s 1` → average bitrate, which hits the size target predictably.
- `-b` → bits per second, so `48000` is 48 kbps.

Confirm the result before wiring it up:

```sh
ls -lh public/audio/<course>/<lesson>.m4a
afinfo public/audio/<course>/<lesson>.m4a | grep -E "duration|bit rate"
```

The duration must match the source. If it does not, the encode truncated.

## Wiring it into a lesson

Add an `audio` block to the lesson's frontmatter — on **part 1** if the lesson
is split, since that is where a reader starts:

```yaml
lesson:
  # …
  audio:
    src: /audio/private-helicopter/ground-2.m4a
    duration: 54 min
    covers: all four parts of this lesson
```

Then render it just below the lesson header:

```mdx
import LessonAudio from '@components/LessonAudio.astro';

<LessonHeader lesson={frontmatter.lesson} />

<LessonAudio
	src={frontmatter.lesson.audio.src}
	duration={frontmatter.lesson.audio.duration}
	covers={frontmatter.lesson.audio.covers}
/>
```

`LessonAudio` **fails the build** if the file is missing or over 25 MiB. That is
deliberate: a typo in the path would otherwise ship a player that 404s when a
reader presses play, and an oversized file would fail at deploy time with a far
less obvious error.

## When to move to R2

Audio ships from `public/`, committed to the repo. That is the simplest thing
that works and costs nothing, but git stores binaries without delta compression,
so **every recording is ~20 MB of permanent history** and contributors clone all
of it.

Fine for a handful of lessons. Bad for fifty.

**When the repo's media passes roughly 250 MB**, move it to a
[Cloudflare R2](https://developers.cloudflare.com/r2/pricing) bucket: 10 GB-month
of storage free, and **zero egress fees**, so it stays genuinely free at this
scale.

The migration is deliberately one line. In `src/lib/media.ts`:

```ts
export const MEDIA_BASE = 'https://media.collectiveknowledge.example';
```

Every lesson's `audio.src` stays a root-relative path and is resolved through
`mediaUrl()`, so no content changes. Setting `MEDIA_BASE` also disables the
build-time file checks, because the file is no longer on disk — verify uploads
yourself at that point.

Check current media weight with:

```sh
du -sh public/audio
```
