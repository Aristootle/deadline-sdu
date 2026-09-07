(async function () {
  const container = document.getElementById('front-main');
  if (!container) return;

  let data;
  try {
    const res = await fetch('articles.json');
    if (!res.ok) throw new Error('fetch failed');
    data = await res.json();
  } catch (e) {
    container.innerHTML = '<p class="edition-error">Could not load articles. Make sure you are running a local server (<code>python -m http.server 7900</code>).</p>';
    return;
  }

  const { articles, categories } = data;

  // Build category id → label map
  const catLabels = {};
  for (const c of categories) catLabels[c.id] = c.label;

  // Sort by date descending
  const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Featured articles — up to 2 with featured:true, fallback to newest
  const featuredList = sorted.filter(a => a.featured).slice(0, 2);
  if (!featuredList.length) featuredList.push(sorted[0]);
  const featuredSlugs = new Set(featuredList.map(a => a.slug));

  let html = renderFeaturedSection(featuredList);

  // Per-category sections (exclude all featured articles)
  for (const cat of categories) {
    const catArticles = sorted
      .filter(a => a.category === cat.id && !featuredSlugs.has(a.slug))
      .slice(0, 4);
    if (!catArticles.length) continue;
    html += renderSection(cat, catArticles);
  }

  container.innerHTML = html;

  // --- Render helpers ---

  function renderFeaturedSection(list) {
    if (list.length >= 2) {
      return `
      <section class="front-featured front-featured--pair">
        ${list.map(renderFeaturedCard).join('')}
      </section>`;
    }
    return renderFeatured(list[0]);
  }

  function renderFeaturedCard(article) {
    const catLabel = esc(catLabels[article.category] || article.category);
    const imgHtml = article.image
      ? `<div class="featured-card-image" style="background-image: url('${article.image}')" role="img" aria-label="${esc(article.title)}"></div>`
      : '';
    return `
      <div class="front-featured-card">
        ${imgHtml}
        <div class="front-featured-text">
          <span class="section-label">${catLabel}</span>
          <h2 class="front-featured-headline">
            <a href="article.html?slug=${article.slug}">${esc(article.title)}</a>
          </h2>
          <p class="front-featured-summary">${esc(article.summary)}</p>
          <p class="front-featured-meta">${article.author ? esc(article.author) + ' &middot; ' : ''}${fmtDate(article.date)}</p>
        </div>
      </div>`;
  }

  function renderFeatured(article) {
    const catLabel = esc(catLabels[article.category] || article.category);
    const imgHtml = article.image
      ? `<div class="featured-image" style="background-image: url('${article.image}')" role="img" aria-label="${esc(article.title)}"></div>`
      : '';
    return `
      <section class="front-featured">
        <div class="front-featured-inner">
          ${imgHtml}
          <div class="front-featured-text">
            <span class="section-label">${catLabel}</span>
            <h2 class="front-featured-headline">
              <a href="article.html?slug=${article.slug}">${esc(article.title)}</a>
            </h2>
            <p class="front-featured-summary">${esc(article.summary)}</p>
            <p class="front-featured-meta">${article.author ? esc(article.author) + ' &middot; ' : ''}${fmtDate(article.date)}</p>
          </div>
        </div>
      </section>`;
  }

  function renderSection(cat, articles) {
    return `
      <section class="front-section">
        <div class="section-header">
          <span class="section-label">${esc(cat.label)}</span>
          <span class="section-rule"></span>
          <a class="section-all-link" href="category.html?cat=${encodeURIComponent(cat.id)}">All ${esc(cat.label)} &rarr;</a>
        </div>
        <div class="article-card-grid">
          ${articles.map(renderCard).join('')}
        </div>
      </section>`;
  }

  function renderCard(article) {
    const imgHtml = article.image
      ? `<div class="article-card-image" style="background-image: url('${article.image}')"></div>`
      : '';
    return `
      <a class="article-card" href="article.html?slug=${article.slug}">
        ${imgHtml}
        <div class="article-card-body">
          <p class="article-card-headline">${esc(article.title)}</p>
          <p class="article-card-summary">${esc(article.summary)}</p>
          <p class="article-card-meta">${article.author ? esc(article.author) + ' &middot; ' : ''}${fmtDate(article.date)}</p>
        </div>
      </a>`;
  }

  function fmtDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
