# Lead Capture Setup

Nero doesn't have TripleSeat, and their current form is a BentoBox site feature. This document covers what we're doing instead, why, and how to wire it up in about fifteen minutes.

---

## Why not the BentoBox form

BentoBox is a closed hosted platform. Their form is a component of their site builder — there's no supported embed code to drop it onto a domain we control. The only BentoBox route available is *linking out* to `nerowashdc.com/private-events/`, and that costs us the three things this page exists to fix:

- The visitor leaves our page, so the conversion fires on a click, not a submission — the exact mis-attribution we're trying to end
- We can't add the qualifying fields, so the events team keeps starting from four data points
- UTMs and `gclid` die at the domain boundary, so we still can't tell which ad produced which booking

So: our own form, posting to a Google Sheet. This is the better outcome anyway — we control every field, we own the data, and there's no third-party script that can restyle itself out from under us.

**The honest trade-off:** a spreadsheet is not a CRM. It won't chase anyone, won't track a lead through to booking, won't tell you what closed. The instant email notification is what makes it workable day to day — the sheet is the log and the reporting surface, the inbox is the workflow. If private events volume grows, revisit a real events CRM.

---

## What happens on submit

1. Visitor fills the form on `privateevents.nerowashdc.com`
2. Browser POSTs JSON to a Google Apps Script web app
3. Apps Script appends a row to the Sheet **and** emails the events team immediately, with reply-to set to the guest's address — so hitting Reply goes straight to them
4. Browser lands on `/thank-you`, where Meta `Lead`, GA4 `generate_lead` and the Google Ads conversion fire on a real page load

If step 2 fails for any reason, the visitor gets an error with a **prefilled mailto** containing every answer they gave. A lost lead is the one failure this page can't have.

---

## Setup

### 1. The Sheet — already created

**Nero Private Events Inquiries | Dineline**
`https://docs.google.com/spreadsheets/d/1Q-Lu6HXq--pIAoHnQTxVj4z67ALTtjN8lIXJyhiiFts/edit`

Owned by `mike@dineline.co`, in the Dineline shared drive. This is arrangement **B** below — Dineline owns it, the client's team gets the notifications.

The script writes to a tab called `Leads` and creates it on first run. Delete the empty default `Sheet1` afterwards so nobody types into the wrong tab.

### 2. Add the script

Open the sheet → Extensions → Apps Script. Delete the placeholder, paste the contents of `apps-script/Code.gs`, save.

`CONFIG` is already filled in for this account — no edits needed unless you want to change who's notified:

```js
var CONFIG = {
  NOTIFY: 'matias@nerowashdc.com, mike@dineline.co',
  FROM_NAME: 'Nero Private Events',
  SLACK_WEBHOOK: '',
  SHEET_NAME: 'Leads',
  ALLOWED_HOST: 'privateevents.nerowashdc.com'
};
```

### 3. Test before deploying

In the editor, select `testSubmission` from the function dropdown and Run. Google will ask you to authorize — approve it. You'll click through an "unverified app" warning; that's expected for your own script.

Confirm a row appears in the Sheet and the email arrives.

### 4. Deploy

Deploy → New deployment → gear icon → **Web app**

| Setting | Value |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

"Anyone" sounds alarming but is required — the visitor's browser is anonymous. The endpoint only accepts POSTs and only writes rows; it never reads the sheet back out.

Copy the `/exec` URL.

### 5. Wire it into the page

In `index.html`, find:

```js
var ENDPOINT = 'LEAD_ENDPOINT_URL';
var NOTIFY_EMAIL = 'events@nerowashdc.com';
```

Replace with the `/exec` URL and the real events address. Commit and push; Vercel redeploys.

### 6. Test end to end

Submit a real inquiry from the live page with `?utm_source=meta&utm_campaign=test&gclid=abc123` on the URL. Confirm: row in the Sheet with UTM columns filled, email received, browser on `/thank-you`, Meta Pixel Helper showing `Lead` there and nowhere else.

---

## After any script edit

**Deploy → Manage deployments → edit → Version: New version → Deploy.**

Saving the script does *not* update the live URL. This catches everyone at least once.

---

## The n8n alternative

`n8n-lead-capture.json` is an importable workflow that does the same job — webhook → Google Sheets → email → Slack — if you'd rather run this through the Dineline n8n instance than Apps Script.

Import it, set the Google Sheets and SMTP credentials, activate, and paste the production webhook URL into `ENDPOINT` instead. The page doesn't care which it's talking to; the payload is identical.

**Which to pick:** Apps Script keeps the leads inside a Google account with no extra dependency. n8n gives better observability and easier routing if you want Slack alerts, HubSpot sync, or conditional logic later. Apps Script is the safer default; n8n is better if this needs to feed other Dineline systems.

---

## Who should own the sheet

Three workable arrangements. The script always **sends from whichever Google account owns it** — that part can't be changed, only the display name can.

| | Owner | Emails come from | Trade-off |
|---|---|---|---|
| **A** | Client's Google account | Their own domain | Cleanest. Needs Matías to sit down for 10 minutes and click through Google's authorization. |
| **B** | Dineline account, client shared in + notified | Dineline's address, displayed as "Nero Private Events" | Set up today with no client dependency. Emails originate off-domain — see spam note below. |
| **C** | Dineline, migrate to client later | Changes on migration | Migration means a **redeploy and a new endpoint URL**, so a code change. Fine, just not free. |

**If you go with B** — Dineline owns it, client's team gets the pings:

1. Set `NOTIFY` to the client's addresses (comma-separated for several).
2. Set `FROM_NAME` to `Nero Private Events` so their inbox shows something they recognize.
3. **Tell the recipients to check spam on day one and mark it "not spam."** Mail arriving from an outside domain about their own business is exactly what filters flag. This is the one thing that quietly breaks a setup like this — the sheet fills up, nobody sees an email, and it looks like the page isn't working.
4. Share the Sheet with them as **Editor** so they can add a `Status` column and work the leads. Tell them: never insert or reorder columns — the script writes by position, so a new column in the middle silently corrupts every row after it. New columns go on the far right only.
5. Add your own address to `NOTIFY` too. You want to see lead flow without asking.

Reply-to is set to the guest's address in all three arrangements, so whoever hits Reply is writing to the planner — not to Dineline, and not into a void.

---

## What you get in the Sheet

One row per inquiry, 38 columns. The ones that earn their place:

- **`estimate_shown`** — the all-in number the estimator gave them before they submitted. You know their budget expectation before you reply.
- **`utm_source` / `utm_campaign` / `gclid`** — which ad produced this inquiry. Filter the sheet by campaign, count how many booked, and you have a real cost per booked event rather than cost per lead.
- **`space`** — blank means they chose "recommend one for me," which is a planner telling you they're early and open to guidance.
- **`budget`** and **`priorities`** — what to lead the reply with.

Add a `Status` and `Booked value` column by hand at the far right (never insert columns in the middle — the script writes by position). That's enough to calculate lead-to-booking rate and revenue per campaign, which is the number this whole build exists to produce.

---

## Spam

Two guards: a hidden honeypot field, and a rejection of anything submitted within 2.5 seconds of page load. Between them they stop most drive-by bots without putting a CAPTCHA in front of a real planner.

If spam does get through, the fix is a reCAPTCHA v3 score check in the Apps Script rather than a challenge on the page — never make a qualified lead prove they're human.
