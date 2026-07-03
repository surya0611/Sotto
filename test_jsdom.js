const { JSDOM } = require('jsdom');
const fs = require('fs');

const scriptContent = fs.readFileSync('./public/widget.min.js', 'utf-8');

const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://www.trysotto.in/widget.min.js" data-account-id="0640169a-acef-4f34-a043-040efd042097" id="sotto-script"></script>
</head>
<body>
  <span data-sotto-inline="active-visitors"></span>
</body>
</html>
`;

const dom = new JSDOM(html, { 
  runScripts: "dangerously", 
  resources: "usable",
  url: "https://athleisure-kicks.myshopify.com/products/black-jordans"
});

// Polyfill fetch
dom.window.fetch = async (url, options) => {
  if (url.includes('/api/widget/track')) {
    return { json: async () => ({ success: true }) };
  }
  if (url.includes('/api/widget/events')) {
    return { json: async () => ({ skip: true }) };
  }
  if (url.includes('/api/widget/inline')) {
    return { json: async () => ({
      active_visitors: { enabled: true, count: 24, text: "24 people viewing", color: "inherit", size: "inherit", icon: "pulse_red" }
    })};
  }
  return { json: async () => ({}) };
};

// Wait for scripts to load and execute
setTimeout(() => {
  console.log("Span HTML:", dom.window.document.querySelector('[data-sotto-inline]').innerHTML);
}, 2000);
