# Deadline — Publishing Instructions

## Folder structure

```
deadline-sdu/               ← repo root
  editions/
    vol-1-no-1/
      edition.json          ← edition manifest (metadata + article list)
      articles/
        article-slug.html   ← one file per article
  css/                      ← shared stylesheets (do not edit per edition)
  js/                       ← shared scripts (do not edit per edition)
  index.html                ← front page — only change data-edition when publishing
  past-editions.html        ← archive page — add a card when archiving an edition
  about.html                ← staff list
  contact.html              ← contact details
  join.html                 ← recruitment page
  newsletter.html           ← newsletter sign-up page
  poster.html               ← print-to-A3 tool
```

---

## Writing a new article

1. Create an HTML fragment file in the edition's `articles/` folder, e.g. `articles/my-article.html`.
2. Use one of these templates depending on article length:

**Short article (2 paragraphs):**
```html
<article class="article article--short">
  <h2 class="article-headline">Your Headline Here</h2>
  <p class="article-byline">By Author Name, Role <span>&middot;</span> Vol. X, No. X</p>
  <div class="article-body">
    <p>Body text...</p>
    <p>Body text...</p>
  </div>
</article>
```

**Medium article (3–4 paragraphs):** same as above but `article--middle`.

**Long article (5+ paragraphs):** same as above but `article--long`.

**Optional elements inside `article-body`:**

Pull quote:
```html
<blockquote class="pull-quote">
  <p>&#8220;Quote text.&#8221;</p>
  <cite>&#8212; Speaker Name, Title</cite>
</blockquote>
```

Inline image (full width):
```html
<div class="img-inline">
  <div class="img-placeholder" style="--ratio: 66.66%;" role="img" aria-label="Description"></div>
  <p class="img-caption">Caption text. Photo: Photographer / Deadline</p>
</div>
```

Side image (floated right):
```html
<div class="img-side img-side--right" style="width: 140px;">
  <div class="img-placeholder" style="--ratio: 120%;" role="img" aria-label="Description"></div>
  <p class="img-caption">Caption.</p>
</div>
```

3. Register the article in `edition.json` (see below).

---

## The edition manifest (`edition.json`)

Controls what appears on the front page and in what order.

```json
{
  "volume": 1,
  "number": 1,
  "date": "August 2026",
  "institution": "University of Southern Denmark, Sønderborg",
  "lead": "my-lead-article.html",
  "leadTabLabel": "Short Tab Title",
  "sections": [
    {
      "id": "campus",
      "label": "Campus",
      "articles": ["article-one.html", "article-two.html"]
    },
    {
      "id": "student-life",
      "label": "Student Life",
      "articles": ["article-three.html"]
    }
  ]
}
```

- `lead` — the main feature article, shown on the Front Page tab without a sidebar.
- `leadTabLabel` — short title shown on the Front Page tab button (keep it brief, e.g. the article headline or a punchy version of it). Falls back to the full article headline if omitted.
- `sections` — each section gets its own tab with a labelled divider and a sidebar listing its articles. Articles appear in the order listed.
- Add a new section by adding a new object to the `sections` array with a unique `id`.

### Section layouts

By default articles in a section stack vertically. Two additional layouts are available:

**Side-by-side pair (`doubles`):**
```json
{ "layout": "doubles", "articles": ["left-article.html", "right-article.html"] }
```

**Grouped articles within a section:**
```json
{
  "id": "campus",
  "label": "Campus",
  "groups": [
    { "articles": ["full-width-article.html"] },
    { "layout": "doubles", "articles": ["left.html", "right.html"] },
    { "articles": ["another-full-width.html"] }
  ]
}
```
Use `groups` instead of `articles` when you want to mix full-width and side-by-side articles in the same section.

---

## Front page tabs

The front page is divided into tabs:

- **Lead tab** — displays the lead article full-width with no sidebar. Its tab label is set by `leadTabLabel` in `edition.json`.
- **Section tabs** — each section defined in `edition.json` gets a tab. Clicking a section tab shows the "In This Section" sidebar with links to each article.

---

## Publishing a new edition — checklist

### 1. Create the new edition folder
```
editions/vol-X-no-X/
  edition.json
  articles/
    article-one.html
    article-two.html
    ...
```

### 2. Update `index.html`
Change the `data-edition` attribute on the `<main>` element to point to the new edition:
```html
<main id="edition-main" data-edition="editions/vol-X-no-X/edition.json">
```
This is the **only** change needed to `index.html`.

### 3. Update `past-editions.html`
- **Archive the old edition:** uncomment the template block at the bottom of the editions grid and fill in the volume/number, lead headline, date, and the `href` pointing to `index.html?edition=editions/vol-X-no-X/edition.json`.
- **Update the current edition card** at the top of the grid with the new volume, headline, and date. Its link should simply be `index.html`.

### 4. Check `about.html`
Update the editorial team if any staff have changed.

### 5. Check `contact.html`
Update if the editor-in-chief or any contact details have changed.

---

## What updates automatically

Once `index.html`'s `data-edition` is updated, these update on their own:

- The masthead (Vol. X, No. X / Month Year) on every page — including About, Contact, Newsletter, and Join
- The full front page layout, article order, and tab structure
- The page title on the front page

---

## Printing an article as an A3 poster

`poster.html` lets you turn any article into a print-ready A3 poster to put up around campus.

### How to use it

1. Start the local server (see below) — the poster tool needs it for the same reason as the main site.
2. Open `http://localhost:7900/poster.html` in a browser.
3. In the path field, type the article path, e.g.:
   ```
   editions/vol-1-no-1/articles/dorms-website.html
   ```
4. Click **Load** (or press Enter).
5. Choose **1**, **2**, or **3** columns using the selector.
6. Click **Print / Save PDF** and select A3 paper with no additional margins.

The poster automatically pulls the edition metadata (volume, number, date) from the current edition. Each poster includes a QR code linking to `deadline-sdu.dk` at the end of the last column.

### Linking directly to an article

You can share or bookmark a URL that pre-loads a specific article:

```
http://localhost:7900/poster.html?article=editions/vol-1-no-1/articles/dorms-website.html
```

### Print settings

In the browser print dialog:
- Paper size: **A3**
- Margins: **None**
- Background graphics: **on** (required for the masthead rule and CTA strip colour)

---

## Running the site locally

The site requires a local server (it fetches JSON and HTML files via `fetch()`).

```
cd deadline-sdu
python -m http.server 7900
```

Then open `http://localhost:7900` in a browser. Opening `index.html` directly as a file will not work.
