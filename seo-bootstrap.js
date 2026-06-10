(() => {
  var BASE = 'https://dairyjuicemachinery.com';
  var OG = BASE + '/og-image.jpg';
  var meta = null;

  function upsertMeta(attr, key, content) {
    if (!content) return;
    var sel = 'meta[' + attr + '="' + key + '"]';
    var el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href) {
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  function upsertJsonLd(id, data) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function normalizePath() {
    var path = location.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

  function applyMeta(route) {
    if (!route) return;
    document.title = route.title;
    upsertMeta('name', 'description', route.description);
    upsertMeta('name', 'keywords', route.keywords || '');
    upsertLink('canonical', BASE + (route.path || normalizePath()));
    upsertMeta('property', 'og:title', route.title);
    upsertMeta('property', 'og:description', route.description);
    upsertMeta('property', 'og:type', route.type || 'website');
    upsertMeta('property', 'og:url', BASE + (route.path || normalizePath()));
    upsertMeta('property', 'og:image', OG);
    upsertMeta('property', 'og:image:alt', 'KIWL Machine - Dairy and Juice Processing Equipment');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', route.title);
    upsertMeta('name', 'twitter:description', route.description);
    upsertMeta('name', 'twitter:image', OG);
  }

  function applyJsonLd(path) {
    var url = BASE + path;
    if (path.indexOf('/products/') === 0) {
      var title = document.title.replace(' | KIWL Machine', '').trim();
      var desc = (document.querySelector('meta[name="description"]') || {}).content || '';
      upsertJsonLd('jsonld-page', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: desc,
        url: url,
        image: OG,
        brand: { '@type': 'Brand', name: 'KIWL Machine' },
        manufacturer: { '@type': 'Organization', name: 'KIWL Machinery Group Co., Ltd', url: BASE }
      });
    } else if (path.indexOf('/news/') === 0) {
      upsertJsonLd('jsonld-page', {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: document.title.replace(' | KIWL Machine News', '').trim(),
        description: (document.querySelector('meta[name="description"]') || {}).content || '',
        url: url,
        image: OG,
        publisher: { '@type': 'Organization', name: 'KIWL Machine', url: BASE }
      });
    } else if (path === '/') {
      upsertJsonLd('jsonld-page', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: document.title,
        url: url,
        isPartOf: { '@type': 'WebSite', url: BASE, name: 'KIWL Machine' }
      });
    }
  }

  function onRoute() {
    var path = normalizePath();
    if (meta && meta[path]) applyMeta(Object.assign({ path: path }, meta[path]));
    applyJsonLd(path);
  }

  fetch('/route-meta.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { meta = data; onRoute(); })
    .catch(function () { onRoute(); });

  window.addEventListener('popstate', function () { setTimeout(onRoute, 50); });
  window.addEventListener('hashchange', function () { setTimeout(onRoute, 50); });
  new MutationObserver(function () { setTimeout(onRoute, 100); }).observe(document.head, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(onRoute, 200);
    setTimeout(onRoute, 1500);
  });
})();
