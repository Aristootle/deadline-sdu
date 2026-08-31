(async function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const contentEl = document.getElementById('article-content');

  if (!slug) {
    contentEl.innerHTML = '<p class="edition-error">No article specified.</p>';
    return;
  }

  // Fetch article fragment
  let fragmentHtml;
  try {
    const res = await fetch('articles/' + slug + '.html');
    if (!res.ok) throw new Error();
    fragmentHtml = await res.text();
  } catch (e) {
    contentEl.innerHTML = '<p class="edition-error">Article not found.</p>';
    return;
  }

  // Fix image paths: fragments use paths relative to articles/ (e.g. images/foo.jpg)
  // but the shell sits at root, so rewrite to articles/images/.
  contentEl.innerHTML = fragmentHtml
    .replace(/src="images\//g, 'src="articles/images/')
    .replace(/url\('images\//g, "url('articles/images/");

  // Fetch articles.json for metadata
  let data;
  try {
    const res = await fetch('articles.json');
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch (e) { return; }

  const { articles, categories } = data;
  const current = articles.find(function (a) { return a.slug === slug; });
  if (!current) return;

  // Update page title
  document.title = current.title + ' \u2014 Deadline';

  // Update back link
  const backLink = document.querySelector('.article-back-link');
  if (backLink) {
    const cat = categories.find(function (c) { return c.id === current.category; });
    if (cat) {
      backLink.href = 'category.html?cat=' + encodeURIComponent(cat.id);
      backLink.textContent = cat.label;
    }
  }

  // Set active category nav item
  const navEl = document.getElementById('nav-' + current.category);
  if (navEl) navEl.classList.add('active');

  // Related articles: same category, exclude current, newest first, up to 3
  const related = articles
    .filter(function (a) { return a.category === current.category && a.slug !== slug; })
    .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
    .slice(0, 3);

  const relContainer = document.getElementById('related-articles');
  if (!relContainer || !related.length) return;

  const cat = categories.find(function (c) { return c.id === current.category; });
  const catLabel = cat ? cat.label : current.category;

  relContainer.innerHTML =
    '<div class="related-articles-header">' +
      '<span class="section-label">' + esc(catLabel) + '</span>' +
      '<span class="section-rule"></span>' +
      '<a class="related-all-link" href="category.html?cat=' + encodeURIComponent(current.category) + '">All ' + esc(catLabel) + ' &rarr;</a>' +
    '</div>' +
    '<div class="article-card-grid">' +
      related.map(function (a) {
        return '<a class="article-card" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
          (a.image ? '<div class="article-card-image" style="background-image: url(\'' + esc(a.image) + '\')"></div>' : '') +
          '<div class="article-card-body">' +
            '<p class="article-card-headline">' + esc(a.title) + '</p>' +
            '<p class="article-card-summary">' + esc(a.summary) + '</p>' +
            '<p class="article-card-meta">' + (a.author ? esc(a.author) + ' &middot; ' : '') + fmtDate(a.date) + '</p>' +
          '</div>' +
        '</a>';
      }).join('') +
    '</div>';

  function fmtDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
