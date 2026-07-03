const { JSDOM } = require('jsdom');
const dom = new JSDOM('', { url: 'https://athleisure-kicks.myshopify.com/' });
dom.window.fetch('https://trysotto.in/api/widget/events?account_id=0640169a-acef-4f34-a043-040efd042097', {
  headers: { 'Origin': 'https://athleisure-kicks.myshopify.com' }
}).then(res => res.json()).then(console.log).catch(console.error);
