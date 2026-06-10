const fs = require('fs');

let bundle = fs.readFileSync('bundle.js', 'utf8');

// 1. Fix hash canonical URLs
[
  ['concat(pc,"/#/products")', 'concat(pc,"/products")'],
  ['concat(pc,"/#/equipment")', 'concat(pc,"/equipment")'],
  ['concat(pc,"/#/service")', 'concat(pc,"/service")'],
  ['concat(pc,"/#/news")', 'concat(pc,"/news")'],
  ['concat(pc,"/#/contact")', 'concat(pc,"/contact")'],
].forEach(([from, to]) => { bundle = bundle.split(from).join(to); });

// 2. Add enterpriseAdvantages SEO config
const contactEnd = 'canonical:"".concat(pc,"/contact"),type:"website"}};';
const contactReplacement = 'canonical:"".concat(pc,"/contact"),type:"website"},enterpriseAdvantages:{title:"Enterprise Advantages | KIWL Machine - Global Dairy & Juice Equipment",description:"Discover KIWL Machine enterprise advantages: global production plants, equipment innovation, technical expertise, patents and honors in dairy and juice machinery.",keywords:"enterprise advantages, dairy machinery manufacturer, global factory, equipment innovation, patents",canonical:"".concat(pc,"/enterprise-advantages"),ogImage:"".concat(pc,"/og-image.jpg"),type:"website"}};';
if (bundle.includes(contactEnd)) bundle = bundle.replace(contactEnd, contactReplacement);

// 3. Add og:image inside Helmet blocks
const ogTags = ',(0,dt.jsx)("meta",{property:"og:image",content:"".concat(pc,"/og-image.jpg")}),(0,dt.jsx)("meta",{property:"og:image:alt",content:"KIWL Machine - Dairy and Juice Processing Equipment"}),(0,dt.jsx)("meta",{name:"twitter:image",content:"".concat(pc,"/og-image.jpg")})';
let ogCount = 0;
['l', 's', 't', 'f'].forEach((v) => {
  const needle = 'content:' + v + '.description})]}),';
  const replacement = 'content:' + v + '.description})' + ogTags + ']}),';
  const count = bundle.split(needle).length - 1;
  if (count > 0) { bundle = bundle.split(needle).join(replacement); ogCount += count; }
});
console.log('og:image patches:', ogCount);

// 4. Alt text improvements
[
  ['alt:"About Us Banner"', 'alt:"KIWL Machine - dairy and juice processing equipment manufacturer in Wenzhou China"'],
  ['alt:"Product Banner"', 'alt:"Dairy and juice production line machinery - KIWL Machine products"'],
  ['alt:"Product Detail"', 'alt:"KIWL dairy juice production line equipment detail view"'],
  ['alt:"Thumbnail "', 'alt:"KIWL product thumbnail image"'],
  ['alt:"Equipment Banner"', 'alt:"Dairy beverage mechanical equipment - KIWL Machine"'],
  ['alt:"News Banner"', 'alt:"KIWL Machine industry news and company updates"'],
  ['alt:"Service Support"', 'alt:"KIWL Machine after-sale service and technical support"'],
  ['alt:"Our Promise"', 'alt:"KIWL Machine quality promise and customer commitment"'],
  ['alt:"Enterprise Advantages"', 'alt:"KIWL Machine enterprise advantages global manufacturing"'],
  ['alt:"Contact Banner"', 'alt:"Contact KIWL Machine for dairy juice machinery quote"'],
].forEach(([from, to]) => { bundle = bundle.split(from).join(to); });

// 5. Lazy loading
let lazyCount = 0;
bundle = bundle.replace(/\(0,dt\.jsx\)\("img",\{([^}]+)\}\)/g, (match, attrs) => {
  if (attrs.includes('loading:')) return match;
  lazyCount++;
  return '(0,dt.jsx)("img",{' + attrs + ',loading:"lazy"})';
});
console.log('lazy loading patches:', lazyCount);

// 6. Product detail SEO (wc)
const wcMarker = 'return c?(0,dt.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,dt.jsxs)("div",{className:"relative h-[400px]';
const wcSeo = 'return c?(0,dt.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,dt.jsxs)(ut,{children:[(0,dt.jsx)("title",{children:"".concat(c.title," | KIWL Machine")}),(0,dt.jsx)("meta",{name:"description",content:c.description}),(0,dt.jsx)("link",{rel:"canonical",href:"".concat(pc,"/products/").concat(r)}),(0,dt.jsx)("meta",{property:"og:title",content:"".concat(c.title," | KIWL Machine")}),(0,dt.jsx)("meta",{property:"og:description",content:c.description}),(0,dt.jsx)("meta",{property:"og:type",content:"product"}),(0,dt.jsx)("meta",{property:"og:url",content:"".concat(pc,"/products/").concat(r)}),(0,dt.jsx)("meta",{property:"og:image",content:"".concat(pc,"/og-image.jpg")}),(0,dt.jsx)("meta",{name:"twitter:card",content:"summary_large_image"}),(0,dt.jsx)("meta",{name:"twitter:title",content:"".concat(c.title," | KIWL Machine")}),(0,dt.jsx)("meta",{name:"twitter:description",content:c.description}),(0,dt.jsx)("meta",{name:"twitter:image",content:"".concat(pc,"/og-image.jpg")})]}),(0,dt.jsxs)("div",{className:"relative h-[400px]';
if (bundle.includes(wcMarker)) { bundle = bundle.replace(wcMarker, wcSeo); console.log('Added product detail SEO'); }

// 7. News detail SEO (Tc)
const tcMarker = 'return n?(0,dt.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,dt.jsxs)("div",{className:"relative h-[400px]';
const tcSeo = 'return n?(0,dt.jsxs)("div",{className:"min-h-screen bg-gray-50",children:[(0,dt.jsxs)(ut,{children:[(0,dt.jsx)("title",{children:"".concat(n.title," | KIWL Machine News")}),(0,dt.jsx)("meta",{name:"description",content:n.excerpt}),(0,dt.jsx)("link",{rel:"canonical",href:"".concat(pc,"/news/").concat(e)}),(0,dt.jsx)("meta",{property:"og:title",content:"".concat(n.title," | KIWL Machine News")}),(0,dt.jsx)("meta",{property:"og:description",content:n.excerpt}),(0,dt.jsx)("meta",{property:"og:type",content:"article"}),(0,dt.jsx)("meta",{property:"og:url",content:"".concat(pc,"/news/").concat(e)}),(0,dt.jsx)("meta",{property:"og:image",content:"".concat(pc,"/og-image.jpg")}),(0,dt.jsx)("meta",{name:"twitter:card",content:"summary_large_image"}),(0,dt.jsx)("meta",{name:"twitter:title",content:"".concat(n.title," | KIWL Machine News")}),(0,dt.jsx)("meta",{name:"twitter:description",content:n.excerpt}),(0,dt.jsx)("meta",{name:"twitter:image",content:"".concat(pc,"/og-image.jpg")})]}),(0,dt.jsxs)("div",{className:"relative h-[400px]';
if (bundle.includes(tcMarker)) { bundle = bundle.replace(tcMarker, tcSeo); console.log('Added news detail SEO'); }

try {
  new Function(bundle);
  fs.writeFileSync('bundle.js', bundle);
  console.log('bundle.js saved - syntax OK');
} catch (e) {
  console.error('SYNTAX ERROR:', e.message);
  process.exit(1);
}
