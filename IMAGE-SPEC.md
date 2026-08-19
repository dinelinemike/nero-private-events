# Images — Where They Go and What to Call Them

Right now every image on the page is hotlinked from Nero's BentoBox CDN. That works, but it breaks the day they redo their site — and the space photos aren't reliably the rooms they're labeled as. This is how we fix both.

**Drop files in `img/`. Use the exact filenames in the table below.** Everything else here is detail you only need if you're curious.

---

## The rule

```
img/
  originals/          ← whatever the client sends, untouched. Any name, any size.
  hero.jpg            ← final, web-sized files go here at the root of img/
  space-wine-bar.jpg
  ...
```

Put raw client files in `img/originals/` under whatever names they arrive with. Don't rename them, don't resize them — I'll pull from there, crop and compress, and write out the properly-named versions.

If you'd rather do the naming yourself, the convention is:

- **lowercase only**, hyphens between words, no spaces, no underscores, no capitals
- **role first, subject second**: `space-wine-bar`, `gallery-03-wine-machine`
- **two-digit numbers** where order matters: `gallery-01`, not `gallery-1` — otherwise `gallery-10` sorts before `gallery-2`
- `.jpg` for photographs, `.png` only for the logo (it needs transparency)

Spaces and capitals in filenames cause real problems on web servers — `Wine Bar.JPG` becomes `Wine%20Bar.JPG` and breaks in ways that are annoying to debug. Lowercase-hyphen avoids all of it.

---

## The files the page needs

| Filename | Where it appears | Target size | Priority |
|---|---|---|---|
| `hero.jpg` | Full-bleed background behind the headline | 2400 × 1350 | **High** |
| `space-wine-bar.jpg` | Wine Bar card | 1200 × 800 | **Highest** |
| `space-sabina.jpg` | Sabina card | 1200 × 800 | **Highest** |
| `space-main-bar.jpg` | Main Bar card | 1200 × 800 | **Highest** |
| `space-buyout.jpg` | Full Buyout card | 1200 × 800 | **Highest** |
| `gallery-01-full-room.jpg` | Gallery, large tile (spans 2×2) | 1600 × 1200 | Medium |
| `gallery-02-main-bar.jpg` | Gallery | 1000 × 750 | Medium |
| `gallery-03-wine-machine.jpg` | Gallery | 1000 × 750 | Medium |
| `gallery-04-dancing.jpg` | Gallery | 1000 × 750 | Medium |
| `gallery-05-sabina.jpg` | Gallery | 1000 × 750 | Medium |
| `og-share.jpg` | Link preview in Slack, iMessage, LinkedIn | **1200 × 630 exactly** | Medium |
| `logo-nero.png` | Nav bar and thank-you page | ≥ 600px wide, transparent | Low — current one works |

Dimensions are targets, not requirements. Anything larger is fine — I'll crop and compress. Anything *smaller* than the target will look soft on a retina screen, which is most of your Meta traffic.

**The four `space-*.jpg` files are the whole point of this exercise.** The page asks a planner to choose between three rooms, and right now it can't actually show them the rooms. Everything else on this list is a nice-to-have; those four change whether the page works.

---

## What makes a usable photo here

The page is dark with gold accents, and the CSS drops saturation slightly and layers gradients over the hero and space cards. That means:

- **Well-lit originals work best.** A photo that's already dark and moody goes muddy once our overlay lands on it. Sabina is the risk here — it's a genuinely dark room, so favor the brightest usable shot.
- **Landscape, not portrait.** Every slot is wider than it is tall. A vertical phone photo gets cropped to a thin strip and loses whatever made it good.
- **Leave room at the edges.** The hero has a headline across the middle and gallery tiles have a caption bar along the bottom. A photo where the subject sits dead-center or bottom-left will get covered.
- **Rooms with people in them beat empty rooms.** A planner is buying an atmosphere, not a floor plan. An empty room at 3pm reads as "available," a full room mid-event reads as "this works."
- **No text, no logos, no date stamps** baked into the image.
- **Avoid heavy Instagram filters.** We're applying our own treatment; stacking two looks wrong.

---

## Priority shot list

If you can only get a few things, get these in order:

1. **The Wine Bar with the projector actually in use** — someone presenting, a slide on screen, people seated. This is the single most valuable photo on the list because it's the corporate use case and nothing on their current site shows it.
2. **Sabina with people in it**, bright enough to survive the overlay.
3. **The Main Bar as an event space**, not as a Tuesday-night bar.
4. **A full buyout in progress** — the shot that shows scale, ideally with multiple levels visible.
5. **A set table**, family-style, food actually on it. The menus section publishes four packages and shows zero food.
6. **The wine machine being used** by a guest, not a product shot of the hardware.

Phone photos are fine if they're well-lit and horizontal. A good phone photo of the right thing beats a professional photo of the wrong thing.

---

## After you drop them in

Tell me they're in `img/originals/` and I'll do the rest: crop to the right ratios, compress (target under 300KB each, under 500KB for the hero), write the properly-named files, swap every hotlinked BentoBox URL in `index.html` for a local path, and add `width`/`height` attributes so the layout stops shifting as images load.

That last part is worth more than it sounds — self-hosted images on Vercel's CDN will load faster than the BentoBox ones do now, and a page that doesn't jump around while loading measurably holds more people on mobile.

---

## Two things to check with the client

**Do they own these photos?** If a photographer shot them, confirm Nero has rights to use them in advertising — not just on their own website. We'll be running these in Meta ads, which is a different license in some contracts.

**Are there people in them who need to consent?** Recognizable faces in a paid ad is a question worth asking once rather than dealing with later.

---

## Status — updated Aug 18, 2026

Thirteen photos supplied (all Wine Bar or Sabina). Nine are now processed and live in the page. Notes on what happened to them:

| Slot | Source | Treatment |
|---|---|---|
| `hero.jpg` | `peopleseatedeating` | Cropped 16:9. Already bright — no lift needed. |
| `space-wine-bar.jpg` | `peoplesittingphoto` | Cropped 3:2. Brightest file supplied. |
| `space-sabina.jpg` | `sabina-1` | **Exposure doubled** — the original was too dark to survive the overlay. |
| `gallery-01-full-room.jpg` | `groupphoto` | Big tile. Best corporate proof in the set. |
| `gallery-02-dancing.jpg` | `sabina-hero-2` | B&W, left as-is. |
| `gallery-03-wine-machine.jpg` | `winemachine` | Lifted 40%. |
| `gallery-04-screen.jpg` | `happycouple` | The only shot showing the screen in use. |
| `gallery-05-sabina-bar.jpg` | `sabina-hero-1` | Exposure doubled. |
| `og-share.jpg` | `groupphoto` | 1200×630 for link previews. |
| `logo-nero.png` | worldcup creatives folder | Now self-hosted rather than hotlinked. |

**Two files were unusable:** `spaces-winebar-1.png` and `-2.png` are 1206×2622 phone screenshots — mostly black letterbox around a small frame. Not enough pixels for any slot.

**Six of the thirteen arrived with EXIF rotation** (portrait phone shots tagged sideways). Handled in processing, but worth knowing: if these get used in ad creative, some tools will render them rotated.

### Still needed

1. **The Main Bar** — zero photos supplied. That card is still hotlinked to a BentoBox image that may not even be the Main Bar.
2. **A full buyout / multi-level shot** — same situation. This is the highest-value booking on the page and we can't show it.
3. **Food.** The menus section publishes four packages at $40–$110 a head and shows no food at all. A set family-style table would earn its place.
4. **The projector with an actual deck on screen.** `gallery-04` proves a screen exists, but it's showing a fireplace at a birthday. A slide would sell the corporate use case.
