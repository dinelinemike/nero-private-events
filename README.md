# Nero DC — Private Events Landing Page

Static, single-purpose landing page for **privateevents.nerowashdc.com**, built on the Dineline Private Events Playbook and designed to replace the BentoBox `/private-events/` page as the destination for all paid private-events traffic.

**Why it exists:** the current page buries pricing, has no conversion event we can trust, and gives Google Ads nothing to bid toward. This page publishes the all-in number, embeds TripleSeat directly, and fires conversions on a real thank-you page load instead of a Submit-button click.

---

## Files

| File | What it is |
|---|---|
| `index.html` | The landing page. Everything inline — no build step, no dependencies. |
| `thank-you.html` | Post-submit page. **This is the conversion.** Meta `Lead`, GA4 `generate_lead`, Google Ads conversion all fire here. |
| `vercel.json` | Clean URLs (`/thank-you`, not `/thank-you.html`), redirects, security headers. |
| `robots.txt` / `sitemap.xml` | Indexable page, thank-you excluded. |
| `DNS-SETUP.md` | Client-facing. Send this to Matías as-is. |
| `CLIENT-QUESTIONS.md` | Everything we need from the client before this goes live. |

---

## Deploy

You create the Vercel project and connect it to the Git repo. Here is the sequence.

### 1. Create the repo and push

```bash
cd nero-private-events

git init
git add .
git commit -m "Nero DC private events landing page — v1"
git branch -M main
git remote add origin https://github.com/<org>/nero-private-events.git
git push -u origin main
```

If you'd rather not use the command line: create the repo on GitHub, click **uploading an existing file**, and drag the contents of this folder in.

### 2. Import into Vercel

1. Vercel dashboard → **Add New… → Project**
2. Import the repo
3. **Framework Preset:** `Other`
4. **Build Command:** leave empty
5. **Output Directory:** leave empty (root)
6. **Deploy**

It's a static site — no build, no env vars. First deploy takes about 20 seconds.

### 3. Add the domain

1. Project → **Settings → Domains**
2. Add `privateevents.nerowashdc.com`
3. Vercel shows a CNAME record to verify ownership
4. Send `DNS-SETUP.md` to the client — it already contains the exact record

SSL is issued automatically once the record resolves. Nothing on `nerowashdc.com` is affected; this is a subdomain only.

### 4. Every change after that

```bash
git add . && git commit -m "what changed" && git push
```

Vercel redeploys on push. Pull requests get their own preview URL, which is the easy way to show the client a change before it's live.

---

## Placeholders — must be replaced before launch

Everything below is marked in the source with `⚑ PLACEHOLDER` or wrapped in `class="ph"`.

**To see every placeholder highlighted in the browser:** open the page's `<body>` tag and change it to `<body class="review">`. Every unconfirmed value gets a gold dashed outline. Remove the class before launch.

| # | Placeholder | Where | Source |
|---|---|---|---|
| 1 | `LEAD_FORM_ID` | `index.html`, TripleSeat script block | TripleSeat → Settings → Lead Forms → View Setup Codes |
| 2 | `PUBLIC_KEY` | `index.html`, TripleSeat script block | Same screen as above |
| 3 | `G-XXXXXXXXXX` | Both pages, `<head>` | Nero's GA4 property |
| 4 | `AW-XXXXXXXXX` | Both pages, `<head>` | Google Ads → Admin |
| 5 | `AW-XXXXXXXXX/AbC_dEfGhIj` | `thank-you.html` | Google Ads conversion action label (create it first — see below) |
| 6 | Package names, prices, minimums, inclusions | `index.html` → `#packages` | Client — CLIENT-QUESTIONS.md §1 |
| 7 | Example cost breakdown | `index.html` → `#pricing` | Client — CLIENT-QUESTIONS.md §1 |
| 8 | Testimonial + attribution | `index.html`, quote section | Client — CLIENT-QUESTIONS.md §5 |
| 9 | `events@nerowashdc.com` | `index.html`, twice | Client — the named captain's real inbox |
| 10 | Urgency strip copy | `index.html`, top of `<body>` | Us — swap seasonally |

The Meta Pixel ID (`4732017186828350`) is Nero's real one, carried over from the World Cup page. It is not a placeholder.

---

## TripleSeat setup

The form is TripleSeat's own embed (`ts_script.js`, `inline_form=true`), restyled with CSS so it reads as part of the page. Data lands directly in TripleSeat — no middleware, no sync to break.

**In TripleSeat:**

1. **Settings → Lead Forms** — either use the existing form or create one named `Private Events LP` so we can tell landing-page leads apart from website leads in reporting.
2. **View Setup Codes** → copy the `lead_form_id` and `public_key` into `index.html`.
3. Keep the field list tight. Every field costs conversions. Recommended: first name, last name, email, phone, event date, guest count, space, event type, notes. Nine fields is the ceiling.
4. **Do not** set a redirect inside TripleSeat. Our page handles it via `TS.custom_success_callback` so the attribution parameters survive the hop.

**Optional but worth doing** — add hidden or short-text custom questions named `utm_source`, `utm_campaign` and `gclid`. The page's `enrichForm()` fills them automatically, which means every TripleSeat lead record carries which ad produced it. Without this we can count leads but can't tie a booked event back to a campaign. If the client skips it, the page falls back to appending a `[src: …]` tag to the notes field.

---

## Conversion tracking

This is the part that fixes the reporting problem.

**Meta.** `Lead` fires on the thank-you page. In Events Manager, the private-events campaign should optimize for this `Lead` event on `privateevents.nerowashdc.com`. Add that domain to the pixel's allowed domains. Once live, compare `Lead` counts against actual TripleSeat lead counts for a week — they should match within one or two.

**Google Ads.** There is currently no lead conversion action in the account at all. Create one:

1. Google Ads → **Goals → Conversions → New conversion action → Website**
2. Enter `privateevents.nerowashdc.com`
3. Category: **Submit lead form** · Value: use a per-lead value once we know close rate × average event value · Count: **One**
4. Copy the conversion label into placeholder #5

Until that action exists, a private-events Google campaign is unbiddable. This page is the prerequisite for that work.

**GA4.** `generate_lead` fires with `lead_source` and `campaign` from the URL. Mark it as a key event in GA4 admin.

---

## Testing checklist

- [ ] Form renders inside the dark card, not as a white block
- [ ] Submit a real test lead — it appears in TripleSeat
- [ ] Submission lands on `/thank-you` with UTM params intact in the URL
- [ ] Meta Pixel Helper shows `Lead` on the thank-you page and **not** on the landing page
- [ ] Google Tag Assistant shows the conversion firing on thank-you only
- [ ] Visit with `?utm_source=meta&utm_campaign=test&gclid=abc123` and confirm the params carry through to thank-you
- [ ] Test on a phone — the form is where most Meta traffic converts
- [ ] Disable JavaScript or block `api.tripleseat.com` and confirm the phone/email fallback appears after 8 seconds
- [ ] All anchor links scroll correctly and clear the fixed nav
- [ ] `<body class="review">` removed

---

## Known trade-offs

**Images are hotlinked** from the client's BentoBox CDN (`images.getbento.com`). Fine for launch, but if they redo their site those URLs break. Get original files from the client (CLIENT-QUESTIONS.md §5) and commit them to `/img` before this becomes load-bearing for spend.

**No instant-quote configurator in v1.** The playbook's 30-second all-in quote is the single highest-leverage element on the page and it's deliberately deferred — it can't be built until packages and pricing are confirmed. Ship v1, get real pricing, then add it. That's the v2 scope.

**The form is TripleSeat's, not ours.** We restyled it, but their markup can change without notice. If the CSS ever looks off, the fix is a selector update, not a rebuild. The alternative — a fully custom form posting to `api.tripleseat.com/v1/leads/create.js` — gives total design control and native UTM fields, and is worth revisiting if the embed proves limiting.
