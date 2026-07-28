var activeObserver = null;

function initSidebar() {
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  var articles = document.querySelectorAll('#edition-main article[id]');
  var articleLinks = document.querySelectorAll('.article-sidebar a[href^="#"]:not(.sidebar-section-label)');

  if (!articles.length || !articleLinks.length) return;

  activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');

        articleLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });

        document.querySelectorAll('.sidebar-section-label').forEach(function (label) {
          label.classList.remove('active');
        });
        var activeLink = document.querySelector('.sidebar-articles a[href="#' + id + '"]');
        if (activeLink) {
          var sectionLi = activeLink.closest('.sidebar-section');
          if (sectionLi) {
            var label = sectionLi.querySelector('.sidebar-section-label');
            if (label) label.classList.add('active');
          }
        }
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px' });

  articles.forEach(function (a) { activeObserver.observe(a); });
}

document.addEventListener('edition-loaded', initSidebar);
document.addEventListener('tab-changed', initSidebar);
