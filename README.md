# Nero DC — Private Events Landing Page

Static, single-purpose landing page for **privateevents.nerowashdc.com**, built on the Dineline Private Events Playbook and designed to replace the BentoBox `/private-events/` page as the destination for all paid private-events traffic.

**Why it exists:** the current page publishes no pricing, has no conversion event we can trust, and gives Google Ads nothing to bid toward. This page publishes real menu and bar prices, lets a planner calculate their own all-in number, and fires conversions on a real thank-you page load instead of a Submit-button click.

**Positioning:** corporate-first in the messaging, without excluding private dinners, birthdays, wedding receptions, showers, NGO events and buyouts.

---

## Files

| File | What it is |
|---|---|
| `index.html` | The landing page. Everything inline — no build step, no dependencies. |
| `thank-you.html` | Post-submit page. **This is the conversion.** Meta `Lead`, GA4 `generate_lead`, Google Ads conversion all fire here. |
| `vercel.json` | Clean URLs (`/thank-you`, not `/thank-you.html`), redirects, security headers. |
| `robots.txt` / `sitemap.xml` | Indexable page, thank-you excluded. |
| `apps-script/Code.gs` | The lead-capture backend. Paste into a Google Sheet's Apps Script editor. |
| `n8n-lead-capture.json` | Alternative backend — importable n8n workflow, same payload. |
| `LEAD-CAPTURE-SETUP.md` | How to wire the form to the Sheet. **Read this before launch.** |
| `DNS-SETUP.md` | Client-facing. Send to Matías as-is. |
| `CLIENT-QUESTIONS.md` | What we still need from the client. Mostly answered as of the Aug 17 meeting — see the "Still open" note at the top. |

---

## Deploy

You create the Vercel project and connect it to the Git repo.

### 1. Push the repo

```bash
cd nero-private-events
git remote add origin https://github.com/<org>/nero-private-events.git
git push -u origin main
```

Files go at the **repo root** — if the repo ends up with `nero-private-events/index.html`, Vercel serves nothing at `/`.

### 2. Import into Vercel

Add New… → Project → import the repo → **Framework Preset: `Other`** → leave Build Command and Output Directory empty → Deploy. Static site, no build, no env vars.

### 3. Add the domain

Settings → Domains → `privateevents.nerowashdc.com`. Send `DNS-SETUP.md` to the client; it already has the exact CNAME. SSL issues automatically. Nothing on `nerowashdc.com` is affected.

### 4. After that

`git push` redeploys. PRs get preview URLs — the easy way to show the client a change before it's live.

---

## What the page contains

1. **Hero** — corporate-first, with the full event-type list underneath so social bookers don't bounce
2. **Find Your Space** — Wine Bar, Sabina, Main Bar, Full Buyout with capacities, best-fit uses and features
3. **Food Packages** — all four banquet tiers with published per-head prices and selection counts
4. **Beverage** — three packages with 2/3-hour pricing, plus host tab, individual tabs, consumption and wine cards
5. **Cost Estimator** — interactive; guest count × menu × bar → all-in total with tax, event fee and gratuity broken out
6. **How Pricing Works** — why the quote is still customized even though prices are published
7. **Event Features** — projector, DJ, music by floor, outside vendors, layouts, wine machine, parking
8. **What We Commit To** — the four-point promise, led by the reply-within-the-hour SLA
9. **The Inquiry Process** — four steps
10. **Gallery**, **testimonial** (placeholder), **inquiry form**, footer

### The estimator

The playbook's highest-leverage element, and it's live now that we have real prices. It applies 10% DC sales tax + 5% event fee + 18% gratuity to the food and beverage subtotal and shows the per-guest all-in.

Two things it does beyond the arithmetic:

- **Menu cards feed it.** "Price It Out" on any tier jumps to the estimator with that tier selected.
- **It feeds the form.** "Send This to the Events Team" writes the planner's selections into the inquiry's notes field, so the events team sees the number the planner already had in their head before they reply.

The dessert-course toggle hides itself on Sabina's Cena, where dessert is included.

**A caveat worth understanding:** the estimator assumes a beverage *package* if one is selected, and shows "Tab / consumption" otherwise. Since Matías says most events run on tabs, most visitors will see a food-only total. The fine print says so, but if this creates sticker shock in the other direction — planners underestimating and then being surprised — the fix is to add a "typical bar spend per guest" figure. Ask him what that number actually is.

---

## Placeholders — must be replaced before launch

Marked in the source with `⚑ PLACEHOLDER` or `class="ph"`. **Set `<body class="review">` to highlight every unconfirmed value in gold.** Remove before launch.

| # | Placeholder | Where | Source |
|---|---|---|---|
| 1 | `LEAD_ENDPOINT_URL` | `index.html`, submit handler | The Apps Script `/exec` URL — see `LEAD-CAPTURE-SETUP.md` |
| 2 | `NOTIFY_EMAIL` | `index.html`, submit handler | The events inbox, used for the mailto fallback |
| 3 | `G-XXXXXXXXXX` | Both pages | Nero's GA4 property |
| 4 | `AW-XXXXXXXXX` | Both pages | Google Ads → Admin |
| 5 | `AW-XXXXXXXXX/AbC_dEfGhIj` | `thank-you.html` | Google Ads conversion action label |
| 6 | Testimonial + attribution | `index.html`, quote section | Client |
| 7 | `events@nerowashdc.com` | `index.html`, twice | The named contact's real inbox |
| 8 | Urgency strip copy | Top of `<body>` | Us — swap seasonally |
| 9 | Caesar's Cena antipasto count | `#menus` | See below |

Meta Pixel `4732017186828350` is Nero's real ID, not a placeholder.

---

## Ratings block

The `#ratings` section publishes Nero's live Google rating instead of a testimonial. We went this route because **there is no usable private-events review to quote** — across 398 Google reviews, Google's own topic extraction surfaces no event, party or group theme at all. The single on-topic review (a 5-star surprise birthday) opens by describing a booking mix-up, which would undercut the page's whole no-surprises argument.

Aggregate proof needs nobody's permission, can't be accused of being invented, and links out for anyone who wants to check.

**These numbers drift.** Re-check quarterly and update four things:

- the score in `.rating-num`
- the star glyphs in `.rating-stars` (last star gets `class="half"` when the score ends ~.3–.7)
- the count in `.rating-count`
- the three topic counts in `.rating-topics`

Then bump `data-checked` on the section. All five live within about fifteen lines of each other. Source: the Maps listing at `maps.google.com/?cid=7878215544412519366` — topic chips sit above the review list.

**Deliberately no `AggregateRating` schema markup.** Google's structured-data guidelines restrict self-serving aggregate ratings on a business's own site, and a manual action would cost more than a star snippet is worth. If we ever want rich results here, pull the rating through the Places API rather than hard-coding it into schema.

**Replace this with a real quote when we get one.** Matías described a past corporate client on the Aug 27 call — *"I called, they gave me the price really fast and easy, and I got it done"* — which is almost exactly this page's argument in a customer's own words. Worth the ask. The ratings block can stay alongside it; the two do different jobs.

---

## Data conflicts to settle with the client

**1. Caesar's Cena antipasto count.** The PDF lists four antipasto items under Caesar's Cena but no "choose up to N" label — every other tier has one. We've published "up to 3" to match Augustus'. Confirm before launch; it's the only invented number left on the page.

**2. Capacities changed between sources.** Their website says Main Bar and Wine Tap Room are "50 seated / 30 standing," which was always backwards. The Aug 17 meeting gave Wine Bar ~60 standing, Sabina ~50, Main Bar ~60, buyout ~180 standing / ~70 seated. **We've used the meeting numbers.** Their website is now inconsistent with this page — worth telling them to update it, or at least knowing which one a planner will believe.

**3. The dessert upcharge is regressive.** $40 menu → +$7, $55 → +$5, $75 → +$3, $110 → included. So dessert costs the most on the cheapest package. It's presented accurately, but it reads oddly on a comparison grid and a planner may ask. Worth checking it's intentional.

**4. The old 23% service charge is gone.** Earlier material said 23% (18% staff + 5% operational). The PDF says 10% DC sales tax + 5% event fee + 18% gratuity — **33% on top, not 23%**, and structured differently. The whole page now uses the PDF's numbers. If the 23% figure is still live anywhere on their website, that's a conflict a planner could catch.

---

## Lead capture

Nero doesn't have TripleSeat, and BentoBox forms can't be embedded off their platform. So the form is ours, posting to a Google Sheet via Apps Script. **Full setup: `LEAD-CAPTURE-SETUP.md`.**

Eight required fields — name, email, phone, date, guest count, event type, corporate/social — with the entire qualification questionnaire behind a "+ Add details" disclosure. One submit button, always one click away, so nobody gets trapped in an optional section.

Every submission writes a row to the Sheet **and** emails the events team with reply-to set to the guest, so Reply goes straight to them. If the endpoint is unreachable, the visitor gets a prefilled mailto with every answer intact rather than a dead end.

Spam is handled by a honeypot plus a 2.5-second minimum time-on-page. No CAPTCHA — never make a qualified planner prove they're human.

---

## Conversion tracking

**Meta.** `Lead` fires on the thank-you page only. Optimize the private-events campaign for it, and add `privateevents.nerowashdc.com` to the pixel's allowed domains. Once live, compare `Lead` counts against rows in the Sheet for a week — they should match exactly, and now we can actually check.

**Google Ads.** There is no lead conversion action in the account at all. Create one: Goals → Conversions → New → Website → `privateevents.nerowashdc.com` → category **Submit lead form** → count **One**. Copy the label into placeholder #5. Until this exists, a private-events Google campaign is unbiddable.

**GA4.** `generate_lead` fires with `lead_source` and `campaign`. Mark it a key event. Custom events also fire for `estimator_to_form` and `scroll_depth` — the first is a strong intent signal and worth building an audience from.

---

## Testing checklist

- [ ] Form renders inside the dark card, not as a white block
- [ ] Submit a real test lead — a row appears in the Sheet and the email arrives
- [ ] Submission lands on `/thank-you` with UTM params intact
- [ ] Meta Pixel Helper shows `Lead` on thank-you and **not** on the landing page
- [ ] Estimator maths: 40 guests × Nero's Cena, no bar = $3,000 subtotal, $3,990 all in
- [ ] "Price It Out" on a menu card selects that tier in the estimator
- [ ] "Send This to the Events Team" writes the summary into the form's notes field
- [ ] Dessert toggle disappears on Sabina's Cena
- [ ] Visit with `?utm_source=meta&utm_campaign=test&gclid=abc123` and confirm it carries to thank-you
- [ ] Test on a phone — most Meta traffic converts there
- [ ] Point `ENDPOINT` at a bad URL and confirm the prefilled-mailto error appears instead of a silent failure
- [ ] Submit with the optional section collapsed — required-only submissions must work
- [ ] `<body class="review">` removed

---

## Known trade-offs

**Images are hotlinked** from the client's BentoBox CDN. Fine for launch, fragile if they redo their site. Get originals and commit them to `/img` before this carries real spend.

**A spreadsheet is not a CRM.** It logs and reports; it doesn't chase anyone or track a lead through to booking. The instant email is what makes it work day to day — inbox is the workflow, sheet is the record. Add `Status` and `Booked value` columns by hand at the far right (never in the middle; the script writes by position) and you can calculate lead-to-booking rate per campaign, which is the number this whole build exists to produce. If private events volume grows, revisit a real events CRM.

**Google's sending limits.** Apps Script sends via the owning Google account, capped at 100 recipients/day on a consumer account and 1,500 on Workspace. Nowhere near a real constraint here, but worth knowing the ceiling exists.

**Space photography is generic.** Each of the four space cards uses a real Nero photo, but not necessarily *that* space — we don't have labelled shots of the wine bar, Sabina and the main bar as distinct rooms. A planner choosing between rooms is the exact person these images need to convince. This is the highest-value asset ask on the list.
