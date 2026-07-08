(async function () {
  var main = document.getElementById('edition-main');
  if (!main) return;

  var params = new URLSearchParams(window.location.search);
  var editionPath = params.get('edition') || main.dataset.edition;
  var basePath = editionPath.slice(0, editionPath.lastIndexOf('/') + 1);

  var edition;
  try {
    var res = await fetch(editionPath);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    edition = await res.json();
  } catch (err) {
    main.innerHTML = '<p class="edition-error">Could not load edition. Make sure you are running a local server (python -m http.server 8000).</p>';
    return;
  }

  // Update masthead meta
  var metaEl = document.querySelector('.masthead-meta');
  if (metaEl) {
    metaEl.innerHTML =
      'Vol. ' + edition.volume + ', No. ' + edition.number +
      ' <span>|</span> ' + edition.date +
      ' <span>|</span> ' + edition.institution;
  }
  document.title = 'Deadline — Vol. ' + edition.volume + ', No. ' + edition.number;

  // Collect file-slot mappings per section
  var sectionItems = edition.sections.map(function (section) {
    var fileSlots = [];
    if (section.layout === 'front-grid' && section.slots) {
      (section.slots.lead || []).forEach(function (f) { fileSlots.push({ file: f, slot: 'lead' }); });
      (section.slots.secondary || []).forEach(function (f) { fileSlots.push({ file: f, slot: 'secondary' }); });
      (section.after || []).forEach(function (f) { fileSlots.push({ file: f, slot: 'after' }); });
    } else if (section.groups) {
      section.groups.forEach(function (group) {
        (group.articles || []).forEach(function (f) { fileSlots.push({ file: f, slot: 'article' }); });
      });
    } else {
      (section.articles || []).forEach(function (f) { fileSlots.push({ file: f, slot: 'article' }); });
    }
    return { section: section, fileSlots: fileSlots };
  });

  // Fetch lead article and all section articles in parallel
  var leadFile = edition.lead || null;
  var allFileSlots = [];
  sectionItems.forEach(function (si) { allFileSlots = allFileSlots.concat(si.fileSlots); });

  var fetches = allFileSlots.map(function (fs) { return fetchFragment(basePath, fs.file); });
  if (leadFile) fetches.unshift(fetchFragment(basePath, leadFile));

  var allHtmls = await Promise.all(fetches);

  // Parse lead article
  var leadEl = null;
  var leadTitle = '';
  if (leadFile) {
    var leadHtml = allHtmls.shift();
    var leadDiv = document.createElement('div');
    leadDiv.innerHTML = leadHtml.trim();
    leadEl = leadDiv.firstElementChild;
    if (leadEl) {
      leadEl.id = leadFile.replace('.html', '');
      var leadHeadline = leadEl.querySelector('.article-headline');
      leadTitle = leadHeadline ? leadHeadline.textContent.trim() : '';
    }
  }

  // Parse each section article into a DOM element, set its id, and extract the headline
  var htmlIdx = 0;
  sectionItems.forEach(function (si) {
    si.fileSlots.forEach(function (fs) {
      var html = allHtmls[htmlIdx++];
      var div = document.createElement('div');
      div.innerHTML = html.trim();
      var el = div.firstElementChild;
      if (el && fs.file) {
        el.id = fs.file.replace('.html', '');
      }
      fs.el = el;
      var headlineEl = el ? el.querySelector('.article-headline') : null;
      fs.title = headlineEl ? headlineEl.textContent.trim() : fs.file.replace('.html', '');
    });
  });

  // Build sidebar: lead link first, then section labels + article sub-links
  var sidebarList = document.querySelector('.article-sidebar ul');
  if (sidebarList) {
    var leadItem = '';
    if (leadFile && leadTitle) {
      var leadSlug = leadFile.replace('.html', '');
      leadItem = '<li class="sidebar-lead-item"><a href="#' + leadSlug + '">' + leadTitle + '</a></li>';
    }
    sidebarList.innerHTML = leadItem + sectionItems.map(function (si) {
      var articleLinks = si.fileSlots.map(function (fs) {
        var slug = fs.file.replace('.html', '');
        return '<li><a href="#' + slug + '">' + fs.title + '</a></li>';
      }).join('');
      return '<li class="sidebar-section">' +
        '<a class="sidebar-section-label" href="#' + si.section.id + '">' + si.section.label + '</a>' +
        '<ul class="sidebar-articles">' + articleLinks + '</ul>' +
        '</li>';
    }).join('');
  }

  // Build DOM: lead first, then sections
  main.innerHTML = '';
  if (leadEl) main.appendChild(leadEl);

  sectionItems.forEach(function (si) {
    var sectionEl = document.createElement('section');
    sectionEl.className = 'edition-section';
    sectionEl.id = si.section.id;
    sectionEl.innerHTML =
      '<div class="section-header">' +
        '<span class="section-label">' + si.section.label + '</span>' +
        '<div class="section-rule" aria-hidden="true"></div>' +
      '</div>';

    if (si.section.layout === 'front-grid' && si.section.slots) {
      var grid = document.createElement('div');
      grid.className = 'front-grid';

      var leadSlots = si.fileSlots.filter(function (fs) { return fs.slot === 'lead'; });
      var secSlots = si.fileSlots.filter(function (fs) { return fs.slot === 'secondary'; });

      leadSlots.forEach(function (fs) { if (fs.el) grid.appendChild(fs.el); });

      if (secSlots.length) {
        var secDiv = document.createElement('div');
        secDiv.className = 'front-grid-secondary';
        secSlots.forEach(function (fs) { if (fs.el) secDiv.appendChild(fs.el); });
        grid.appendChild(secDiv);
      }

      sectionEl.appendChild(grid);

      si.fileSlots.filter(function (fs) { return fs.slot === 'after'; })
        .forEach(function (fs) { if (fs.el) sectionEl.appendChild(fs.el); });
    } else if (si.section.groups) {
      si.section.groups.forEach(function (group) {
        var groupFiles = group.articles || [];
        var groupSlots = si.fileSlots.filter(function (fs) {
          return groupFiles.indexOf(fs.file) !== -1;
        });
        if (group.layout === 'doubles') {
          var doublesDiv = document.createElement('div');
          doublesDiv.className = 'doubles';
          groupSlots.forEach(function (fs) { if (fs.el) doublesDiv.appendChild(fs.el); });
          sectionEl.appendChild(doublesDiv);
        } else {
          groupSlots.forEach(function (fs) { if (fs.el) sectionEl.appendChild(fs.el); });
        }
      });
    } else if (si.section.layout === 'doubles') {
      var doublesDiv = document.createElement('div');
      doublesDiv.className = 'doubles';
      si.fileSlots.forEach(function (fs) { if (fs.el) doublesDiv.appendChild(fs.el); });
      sectionEl.appendChild(doublesDiv);
    } else {
      si.fileSlots.forEach(function (fs) { if (fs.el) sectionEl.appendChild(fs.el); });
    }

    main.appendChild(sectionEl);
  });

  // Signal sidebar to initialise scroll-spy
  document.dispatchEvent(new CustomEvent('edition-loaded'));

  // Honour article permalink: ?edition=...#article-slug scrolls to that article
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }
})();

async function fetchFragment(basePath, file) {
  try {
    var res = await fetch(basePath + 'articles/' + file);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } catch (err) {
    return '<p class="edition-error">Failed to load: ' + file + '</p>';
  }
}
