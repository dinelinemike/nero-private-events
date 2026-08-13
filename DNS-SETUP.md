# Getting the Private Events Page Live on Your Domain

We've built a dedicated private events page and we're hosting it at:

**`privateevents.nerowashdc.com`**

This is a *subdomain* — it sits alongside your main website and does **not** affect `nerowashdc.com` or anything currently live. Your existing site, menus and reservations stay exactly as they are. Your current `/private-events/` page also stays up; we'll simply point ads and, if you'd like, a button on your site to the new one.

Same setup as the World Cup page — two quick steps.

---

## Step 1 — We add the domain (our side)

We add `privateevents.nerowashdc.com` to the hosting project. The host then asks us to confirm you own the domain, which is what the DNS record in Step 2 takes care of.

Nothing for you to do here. Just let us know once Step 2 is done.

---

## Step 2 — You add one DNS record (your side)

1. Log in to wherever `nerowashdc.com` is managed (GoDaddy, Namecheap, Squarespace, Wix, Cloudflare, Google Domains, etc.).
2. Open the **DNS settings** for `nerowashdc.com` — usually under "Manage Domain" or "DNS."
3. Add a new record with these exact values:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name / Host | `privateevents` |
| Value / Target / Points to | `cname.vercel-dns.com` |
| TTL | 1 Hour (or leave default) |

4. Save.

Most registrars apply the change within a few minutes; full propagation can take up to an hour.

---

## What "Name" means at your registrar

Some registrars want just the subdomain piece, others want the whole thing:

- Most providers (GoDaddy, Namecheap, Cloudflare): enter just **`privateevents`**
- A few providers: enter the full **`privateevents.nerowashdc.com`**

If you enter `privateevents` and it auto-fills the rest, that's correct.

---

## When it's live

The page will be live at:

**`https://privateevents.nerowashdc.com`**

A clean URL, and the SSL certificate (the padlock / `https`) is issued automatically once the record is verified, at no cost.

---

## What happens to inquiries

Nothing changes about how you receive them. The form on the new page is your **TripleSeat** lead form — the same one you use today. Inquiries land in TripleSeat exactly as they do now.

The one improvement: because we control the page, we can finally tell you which ad produced which inquiry. Right now that connection is guesswork.

---

## If you'd rather not touch DNS yourself

You can grant us temporary access to your DNS provider and we'll add the record for you, or we can hop on a 5-minute screen-share. Just reply and we'll set it up.

---

### Quick reference (for your IT person or registrar support)

> Add a CNAME record: host `privateevents`, pointing to `cname.vercel-dns.com`. This is for a Vercel-hosted subdomain and does not change the apex `nerowashdc.com` records or any existing subdomain.
