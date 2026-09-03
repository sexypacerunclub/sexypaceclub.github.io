# Analytics Setup — Sexy Pace Website

## Current state

- GTM container: `GTM-NH7PDQ4V` ("Sexy Pace Website")
- GA4 property: `G-939TEPVZ8S` ("Sexy Pace Running Club")
- Both inherited from the previous agency-managed WordPress site. **Access confirmed (2026-09-03)** — Ismael has access to both via the Sexy Pace Gmail. The GTM container's live version had been empty since first publish (04/23/2025) — the agency's analytics setup never actually went live, matching the charter's note that WordPress analytics attempts never worked.
- **CTA click tracking is now live** (as of 2026-09-03): the `Click - CTA - data-cta present` trigger, `jsv - cta name` variable, and `GA4 - Event - cta_click` tag described below were built, tested in GTM Preview (confirmed `cta_click` fires with the correct `cta_name` on the paired `gtm.click` event — note: link clicks fire both a `gtm.linkClick` and a separate `gtm.click` event for the same interaction; the tag only fires on the latter, which is correct and expected), and published.
- **Still open:** GTM's own Container Diagnostics flagged "add another administrator" — the Sexy Pace Gmail is currently the only admin on this GTM account, the same single-point-of-failure risk noted for the GitHub repo. Worth adding a second admin (Ismael's personal Google account, or Maria) sooner rather than later.

## What's already wired into the code

Every meaningful call-to-action on the site carries a `data-cta="..."` attribute — a hook for GTM to read, with no page code changes needed later. Current values:

| `data-cta` value | Where it appears |
|---|---|
| `check_in` | Nav, hero, mobile sticky bar |
| `join_crew` | Nav, hero, About, Signup section |
| `sponsor` | Sponsors section |
| `contact` | Contact section |
| `feedback` | Contact section (feedback survey) |
| `follow_instagram` / `follow_tiktok` / `follow_strava` | Gallery section, footer |
| `special_event_banner` | Special-event banner (only visible when special event mode is on) |
| `special_event_rsvp` | Special-event section (only visible when special event mode is on) |

## Recommended GTM setup

Client-side GTM is the right call at this traffic level — server-side GTM only pays for itself at much higher volume/ad spend, so don't build that.

### 1. Turn on GA4 Enhanced Measurement first (no GTM work needed)

GA4 Admin → Data Streams → your web stream → Enhanced measurement. Make sure these are on:
- Page views
- Scrolls (fires automatically at 90% depth)
- Outbound clicks
- Site search
- Form interactions

This alone gives generic scroll-depth and generic outbound-click volume for free — don't build custom scroll or generic-click tracking, it would just duplicate this.

### 2. Add one custom trigger + tag for named CTA clicks

Enhanced Measurement can't tell "Check In" apart from "Follow Instagram" — both are just a generic "outbound click" to it. For that, one small GTM setup covers every CTA on the site, present and future:

**Trigger** — `Click - CTA - data-cta present`
- Type: *Click - All Elements*, fires on *Some Clicks*
- Condition: *Click Element* matches CSS selector → `[data-cta]`

**Variable** — `jsv - cta name` (Custom JavaScript variable)
```js
function() {
  return {{Click Element}}.getAttribute('data-cta');
}
```
(Requires the built-in *Click Element* variable enabled under Variables → built-in.)

**Tag** — `GA4 - Event - cta_click`
- Tag type: GA4 Event, using your GA4 config tag
- Event name: `cta_click`
- Event parameter: `cta_name` = `{{jsv - cta name}}`
- Trigger: `Click - CTA - data-cta present`

To track a new button later, just add `data-cta="whatever_name"` to it in the HTML — no GTM changes required.

### 3. Naming convention going forward

- GA4 event names: snake_case, verb-first where sensible (`cta_click`, not `CTAClick`)
- `data-cta` values: snake_case, name the action not the location (`check_in`, not `hero_check_in_button`)
- GTM tags/triggers/variables: prefix by type — `GA4 - Event - x`, `Click - x`, `jsv - x` / `dlv - x`

### 4. Once data is flowing

- Register `cta_name` as a GA4 custom dimension (Admin → Custom definitions), then build a CTA-click breakdown report (Explore → Free Form)
- Connect Search Console via GA4 Admin → Product Links, for organic search visibility

## Why this shape (short version)

One `cta_click` event with a `cta_name` parameter (rather than a separate named event per button) keeps the GTM container small and means a brand-new button never needs new GTM configuration — just a new `data-cta` value in the HTML. The `data-*` attribute approach (rather than inline `dataLayer.push()` calls in the page's own JS) keeps tracking fully declarative and decoupled from styling — a future redesign that changes CSS classes won't silently break analytics.
