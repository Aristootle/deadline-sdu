# Deadline — Publishing Instructions

## Folder structure

```
deadline-sdu/
  articles/               ← one HTML fragment per article
    images/               ← article images
    2026-08-28-slug.html  ← article content fragment (no boilerplate)
  articles.json           ← master content index (all articles + categories)
  article.html            ← shared page shell (header, nav, footer for all articles)
  css/                    ← shared stylesheets (do not edit per article)
  js/                     ← shared scripts
  index.html              ← front page (built dynamically from articles.json)
  category.html           ← category listing page
  search.html             ← search page
  about.html              ← about / staff list
  contact.html            ← contact details
  join.html               ← recruitment page
  newsletter.html         ← newsletter sign-up
  poster.html             ← print-to-A3 single-article poster tool
  headlines-poster.html   ← print-to-A3 multi-headline poster tool
```

---

## How pages work

- **`article.html`** is the single shared shell that renders every article. It contains the masthead, navigation, footer, and menu — edit this one file to change the layout for all articles.
- **`articles/2026-08-28-slug.html`** files contain only the `<article>` element — no `<html>`, `<head>`, or `<body>` tags, no nav, no footer. `article.html` fetches the correct fragment based on the `?slug=` URL parameter and injects it into the page.
- **`articles.json`** drives the front page, category pages, and search. Every article must be registered here.

---

## Writing a new article

### 1. Create the article fragment

Add a file to `articles/` named `YYYY-MM-DD-slug.html` (e.g. `2026-09-12-new-cafe.html`).

The file contains **only** the `<article>` element — nothing else:

```html
<article class="article article--long">
  <h2 class="article-headline">Your Headline Here</h2>
  <p class="article-byline">By Author Name <span>&middot;</span> 12 September 2026</p>
  <div class="article-body">
    <p>Body text...</p>
  </div>
</article>
```

Use `article--short` (2 paragraphs), `article--middle` (3–4 paragraphs), or `article--long` (5+ paragraphs).

### Optional elements inside `article-body`

**Pull quote:**
```html
<blockquote class="pull-quote">
  <p>&#8220;Quote text.&#8221;</p>
  <cite>&#8212; Speaker Name, Title</cite>
</blockquote>
```

**Full-width image:**
```html
<div class="img-placeholder" style="--ratio: 56.25%; background-image: url('images/your-image.jpg'); background-size: cover; background-position: center;" role="img" aria-label="Description"></div>
<p class="img-caption">Caption. Photo: Photographer</p>
```

**Inline image (inside body columns):**
```html
<div class="img-inline">
  <img src="images/your-image.jpg" alt="Description" style="width: 100%; display: block;">
  <p class="img-caption">Caption.</p>
</div>
```

**Side image (floated right):**
```html
<div class="img-side img-side--right" style="width: 140px;">
  <img src="images/your-image.jpg" alt="Description" style="width: 100%; display: block;">
  <p class="img-caption">Caption.</p>
</div>
```

> Image paths in fragments are relative to the `articles/` folder, e.g. `images/photo.jpg`.

### 2. Add images

Place any images in `articles/images/`.

### 3. Register the article in `articles.json`

Add an entry to the `articles` array:

```json
{
  "slug": "2026-09-12-new-cafe",
  "title": "New Café Opens on Campus",
  "category": "student-life",
  "date": "2026-09-12",
  "author": "Jane Smith",
  "summary": "A one-sentence summary shown in article cards.",
  "image": "articles/images/new-cafe.jpg",
  "featured": false
}
```

| Field | Required | Notes |
|---|---|---|
| `slug` | ✓ | Must match the filename without `.html` |
| `title` | ✓ | Full article headline |
| `category` | ✓ | Must match an `id` in the `categories` array |
| `date` | ✓ | `YYYY-MM-DD` format |
| `author` | | Shown in cards and related articles |
| `summary` | | One sentence shown in cards |
| `image` | | Path from site root to a card thumbnail. Use `null` if no image. |
| `featured` | | Set `true` on one article to feature it at the top of the front page |

### 4. The article is live

The article is immediately accessible at:
```
http://localhost:7900/article.html?slug=2026-09-12-new-cafe
```
It will also appear in category pages and search automatically.

---

## Categories

Categories are defined at the top of `articles.json`:

```json
"categories": [
  { "id": "university",            "label": "University" },
  { "id": "student-life",         "label": "Student Life" },
  { "id": "outside-sdu","label": "Outside of SDU" }
]
```

To add a new category: add an entry here, then also add it to the navigation in `article.html`, `index.html`, `category.html`, `search.html`, `about.html`, `contact.html`, `join.html`, and `newsletter.html`.

---

## Updating the shared shell (`article.html`)

Edit `article.html` to change anything that appears on every article page: masthead text, navigation links, subscribe strip, footer links. This file is fetched once and shared across all articles — you never need to touch individual article fragments for layout changes.

---

## Printing posters

### Single-article poster (`poster.html`)

Turns any article into a print-ready A3 poster.

1. Start the local server (see below).
2. Open `http://localhost:7900/poster.html`.
3. Paste the article URL or path into the field:
   ```
   https://deadline-sdu.dk/article.html?slug=2026-08-28-dorms-website
   ```
   or just the relative path:
   ```
   articles/2026-08-28-dorms-website.html
   ```
4. Click **Load**.
5. Choose 1, 2, or 3 columns.
6. Click **Print / Save PDF** — select A3, no margins, background graphics on.

You can also link directly to a pre-loaded poster:
```
http://localhost:7900/poster.html?article=articles/2026-08-28-dorms-website.html
```

### Headlines poster (`headlines-poster.html`)

Shows large headlines from multiple articles on one A3 sheet.

1. Open `http://localhost:7900/headlines-poster.html`.
2. Paste article URLs or paths into the rows (click **+ Add Article** for more).
3. Click **Load**, then **Print / Save PDF**.

---

## Running the site locally

The site requires a local server because it loads JSON and HTML files via `fetch()`.

```
cd deadline-sdu
python -m http.server 7900
```

Then open `http://localhost:7900` in your browser. Opening `index.html` directly as a file will not work.
