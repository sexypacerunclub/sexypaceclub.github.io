# UTM Tracking — Sexy Pace Website

## Why this exists

Every click has a story: where someone came from, and what specifically drove
them to click. UTM parameters are the industry-standard way to tell that
story — a few extra pieces of text on the end of a URL that GA4 reads
automatically and turns into real attribution data (which channel, which
post, which influencer actually drove traffic and signups).

**This does not require GTM.** GA4 parses UTM parameters natively from the
landing URL — completely separate from the GTM/`cta_click` setup in
`ANALYTICS.md`, which tracks what people do *after* they land, not where
they came from. Two different jobs, two different (independent) systems.

## The 4 parameters we actually use

| Parameter | What it answers | Example |
|---|---|---|
| `utm_source` | Which specific place did this come from? | `tiktok`, `linkedin`, `qr_park`, `jane_runs_htx` |
| `utm_medium` | What *category* of channel is that? | `social`, `offline`, `influencer`, `share` |
| `utm_campaign` | Which initiative is this tied to? | `evergreen`, `la_bandera_5k` |
| `utm_content` | Which specific placement, if there's more than one? | `bio_link`, `story_post`, `park_signage` |

`utm_term` exists in the spec but is mainly for paid search keyword
tracking — not relevant here, skip it.

## The one rule that matters most: naming consistency

**GA4 is case-sensitive.** `tiktok`, `TikTok`, and `Tik_Tok` will show up as
three different, disconnected sources in every report, silently splitting
your data. Rules:

- **Always lowercase.**
- **Underscores, not spaces** (spaces get URL-encoded into ugly `%20`s).
- **Reuse the same `utm_source` value every single time** for a given
  platform — put the variation in `utm_campaign` or `utm_content` instead
  of inventing a new source name each time. One `tiktok`, forever — not
  `tiktok_bio`, `tiktok2`, `TikTokApp`.
- Keep a link log (below) so nobody has to remember the exact spelling
  from last time.

## Ready-to-use templates

Base URL: `https://sexypacerunningclub.com/`

**TikTok bio link:**
```
https://sexypacerunningclub.com/?utm_source=tiktok&utm_medium=social&utm_campaign=evergreen&utm_content=bio_link
```

**Instagram bio link:**
```
https://sexypacerunningclub.com/?utm_source=instagram&utm_medium=social&utm_campaign=evergreen&utm_content=bio_link
```
For an Instagram Story link specifically (as opposed to the permanent bio
link), swap `utm_content=bio_link` for `utm_content=story` so the two are
distinguishable in reports.

**LinkedIn:**
```
https://sexypacerunningclub.com/?utm_source=linkedin&utm_medium=social&utm_campaign=evergreen&utm_content=bio_link
```

**QR code at the park:**
```
https://sexypacerunningclub.com/?utm_source=qr_park&utm_medium=offline&utm_campaign=evergreen&utm_content=park_signage
```
If there's ever more than one physical QR location (e.g. a sign-in table
*and* a flyer board), differentiate with `utm_content` — `signin_table` vs
`flyer_board` — keep `utm_source=qr_park` the same for both, since they're
still the same source (the park), just different placements.

**Influencer / partner post template** — one unique link per person, so you
can see exactly who's actually driving traffic (useful for deciding who to
work with again, and eventually for sponsor reporting):
```
https://sexypacerunningclub.com/?utm_source=[their_handle_lowercase]&utm_medium=influencer&utm_campaign=[campaign_name]&utm_content=[post_type]
```
Example, for an Instagram post from @jane.runs.htx promoting La Bandera 5K:
```
https://sexypacerunningclub.com/?utm_source=jane_runs_htx&utm_medium=influencer&utm_campaign=la_bandera_5k&utm_content=post
```
Use `utm_content=story`, `reel`, or `post` depending on the format — same
person, same campaign, different content type, so you can also see which
*format* worked best for them.

**Special-event campaigns** (like La Bandera 5K) — swap `evergreen` for the
event's campaign name (e.g. `la_bandera_5k`) in any of the templates above
when promoting that specific event instead of the club generally.

## QR code generation

Since GA4 does the actual tracking (via the UTM parameters baked into the
URL), you don't need a "smart" or "trackable" QR code product — a plain,
free, static QR code pointing at the UTM-tagged URL is all that's needed.
Paying for a QR analytics subscription would just be tracking the same
thing twice.

Recommended: **[QR Code Monkey](https://www.qrcode-monkey.com/)** or
**[goqr.me](https://goqr.me/)** — free, no account needed, both let you
customize the color to match the brand (pink `#f4afc3` on black). Paste in
the QR-park template link above, download the image, print it.

## Link log — keep one, avoid duplicate/inconsistent tagging

Recommended: a simple Google Sheet, one row per link ever created:

| Date | Destination page | Platform | Full URL | Created for | Notes |
|---|---|---|---|---|---|

This is the single source of truth for "what's the exact link I used for
X" — prevents accidentally creating `utm_source=insta` one time and
`utm_source=instagram` another time for the same platform.

## Where to see the results in GA4

**Reports → Acquisition → Traffic acquisition** — breaks down sessions by
Source/Medium. Filter or add a secondary dimension for Campaign or Content
to drill into a specific link's performance. **Reports → Realtime** also
shows "Session source" live, useful for confirming a brand-new link is
tagged correctly right after posting it (same technique used earlier to
verify the CTA click tracking).
