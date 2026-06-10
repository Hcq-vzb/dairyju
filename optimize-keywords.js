const fs = require('fs');

const pyramid = JSON.parse(fs.readFileSync('keyword-pyramid.json', 'utf8'));
const pages = pyramid.pages;

// 1. Generate route-meta.json (strip tier field)
const routeMeta = {};
Object.keys(pages).forEach(function (path) {
  var p = pages[path];
  routeMeta[path] = {
    title: p.title,
    description: p.description,
    keywords: p.keywords
  };
});
fs.writeFileSync('route-meta.json', JSON.stringify(routeMeta, null, 2));
console.log('Updated route-meta.json:', Object.keys(routeMeta).length, 'pages');

// 2. Update index.html meta
var home = pages['/'];
var html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  /<title>[^<]*<\/title>/,
  '<title>' + home.title.replace(/&/g, '&amp;') + '</title>'
);
html = html.replace(
  /<meta name="description" content="[^"]*"/,
  '<meta name="description" content="' + home.description + '"'
);
html = html.replace(
  /<meta name="keywords" content="[^"]*"/,
  '<meta name="keywords" content="' + home.keywords + '"'
);
html = html.replace(
  /<meta property="og:title" content="[^"]*"/,
  '<meta property="og:title" content="' + home.title.replace(/&/g, '&amp;') + '"'
);
html = html.replace(
  /<meta property="og:description" content="[^"]*"/,
  '<meta property="og:description" content="' + home.description + '"'
);
html = html.replace(
  /<meta name="twitter:title" content="[^"]*"/,
  '<meta name="twitter:title" content="' + home.title.replace(/&/g, '&amp;') + '"'
);
html = html.replace(
  /<meta name="twitter:description" content="[^"]*"/,
  '<meta name="twitter:description" content="' + home.description + '"'
);
fs.writeFileSync('index.html', html);
console.log('Updated index.html home meta');

// 3. Patch bundle.js hc object keywords & titles/descriptions for main pages
var bundle = fs.readFileSync('bundle.js', 'utf8');
var hcMap = {
  home: '/',
  products: '/products',
  equipment: '/equipment',
  service: '/service',
  news: '/news',
  contact: '/contact',
  enterpriseAdvantages: '/enterprise-advantages'
};

Object.keys(hcMap).forEach(function (key) {
  var path = hcMap[key];
  var p = pages[path];
  if (!p) return;
  // Patch title
  var titleRe = new RegExp('(' + key + ':\\{title:")([^"]*)(")');
  if (titleRe.test(bundle)) {
    bundle = bundle.replace(titleRe, '$1' + p.title.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '$3');
  }
  // Patch description
  var descRe = new RegExp('(' + key + ':\\{title:"[^"]*",description:")([^"]*)(")');
  if (descRe.test(bundle)) {
    bundle = bundle.replace(descRe, '$1' + p.description.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '$3');
  }
  // Patch keywords
  var kwRe = new RegExp('(' + key + ':\\{title:"[^"]*",description:"[^"]*",keywords:")([^"]*)(")');
  if (kwRe.test(bundle)) {
    bundle = bundle.replace(kwRe, '$1' + p.keywords.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '$3');
  }
});

// 4. Add keywords meta to product detail Helmet (wc) if missing
var wcKwMarker = 'content:c.description}),(0,dt.jsx)("link",{rel:"canonical"';
var wcKwReplacement = 'content:c.description}),(0,dt.jsx)("meta",{name:"keywords",content:"".concat(c.title.toLowerCase(),", ",c.title," manufacturer, dairy juice equipment China, KIWL Machine CE OEM")}),(0,dt.jsx)("link",{rel:"canonical"';
if (bundle.includes(wcKwMarker) && !bundle.includes('name:"keywords",content:"".concat(c.title')) {
  bundle = bundle.replace(wcKwMarker, wcKwReplacement);
  console.log('Added dynamic keywords to product detail pages');
}

// 5. Add keywords to news detail Helmet (Tc)
var tcKwMarker = 'content:n.excerpt}),(0,dt.jsx)("link",{rel:"canonical"';
var tcKwReplacement = 'content:n.excerpt}),(0,dt.jsx)("meta",{name:"keywords",content:"".concat(n.title,", dairy machinery news, juice equipment, KIWL Machine")}),(0,dt.jsx)("link",{rel:"canonical"';
if (bundle.includes(tcKwMarker) && !bundle.includes('name:"keywords",content:"".concat(n.title')) {
  bundle = bundle.replace(tcKwMarker, tcKwReplacement);
  console.log('Added keywords to news detail pages');
}

try {
  new Function(bundle);
  fs.writeFileSync('bundle.js', bundle);
  console.log('Updated bundle.js hc config - syntax OK');
} catch (e) {
  console.error('bundle.js syntax error:', e.message);
  process.exit(1);
}

// 6. Update index.html crawler links from route-meta (exclude bogus news product paths)
var productLinks = Object.keys(routeMeta)
  .filter(function (k) { return k.indexOf('/products/') === 0; })
  .map(function (k) {
    var title = routeMeta[k].title.split('|')[0].trim();
    return '<li><a href="' + k + '">' + title + '</a></li>';
  }).join('\n    ');

var newsLinks = Object.keys(routeMeta)
  .filter(function (k) { return k.indexOf('/news/') === 0; })
  .map(function (k) {
    var title = routeMeta[k].title.split('|')[0].trim();
    return '<li><a href="' + k + '">' + title + '</a></li>';
  }).join('\n    ');

html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  /<ul>[\s\S]*?<\/ul>\s*<\/main>/,
  '<ul>\n    ' + productLinks + '\n  </ul>\n  <h2>Latest News</h2>\n  <ul>\n    ' + newsLinks + '\n  </ul>\n</main>'
);
fs.writeFileSync('index.html', html);
console.log('Updated index.html crawler product/news links');

console.log('\nKeyword pyramid optimization complete.');
