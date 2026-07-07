(async function () {
  if (document.getElementById('edition-main')) return;

  try {
    var indexRes = await fetch('index.html');
    if (!indexRes.ok) return;
    var match = (await indexRes.text()).match(/data-edition="([^"]+)"/);
    if (!match) return;

    var editionRes = await fetch(match[1]);
    if (!editionRes.ok) return;
    var edition = await editionRes.json();

    var metaEl = document.querySelector('.masthead-meta');
    if (metaEl) {
      metaEl.innerHTML =
        'Vol. ' + edition.volume + ', No. ' + edition.number +
        ' <span>|</span> ' + edition.date +
        ' <span>|</span> ' + edition.institution;
    }
  } catch (e) {}
})();
