const fs = require('fs');
const BASE = 'https://dairyjuicemachinery.com';
const TODAY = '2026-06-10';
const b = fs.readFileSync('bundle.js', 'utf8');

const xcStart = b.indexOf('var xc=[');
const xcChunk = b.substring(xcStart, xcStart + 80000);
const details = [...xcChunk.matchAll(/id:"([^"]+)",title:"([^"]+)"/g)].map(m => ({ id: m[1], title: m[2] }));

const news = [...b.substring(b.indexOf('Pc=['), b.indexOf('Pc=[') + 5000).matchAll(/id:"([^"]+)",title:"([^"]+)"/g)].map(m => ({ id: m[1], title: m[2] }));

function urlEntry(loc, priority, changefreq) {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const urls = [
  urlEntry(`${BASE}/`, '1.0', 'weekly'),
  urlEntry(`${BASE}/products`, '0.9', 'weekly'),
  urlEntry(`${BASE}/equipment`, '0.9', 'weekly'),
  urlEntry(`${BASE}/service`, '0.7', 'monthly'),
  urlEntry(`${BASE}/enterprise-advantages`, '0.7', 'monthly'),
  urlEntry(`${BASE}/news`, '0.8', 'weekly'),
  urlEntry(`${BASE}/contact`, '0.8', 'monthly'),
];

const productDetails = details.filter(({ id }) => !id.startsWith('news-'));
productDetails.forEach(({ id }) => urls.push(urlEntry(`${BASE}/products/${id}`, '0.8', 'monthly')));
news.forEach(({ id }) => urls.push(urlEntry(`${BASE}/news/${id}`, '0.6', 'monthly')));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap);
console.log('Fixed sitemap:', urls.length, 'URLs,', productDetails.length, 'product details,', news.length, 'news');
