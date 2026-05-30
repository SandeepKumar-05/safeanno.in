const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    console.log('Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', {waitUntil: 'networkidle2'}).catch(e => console.log('Nav error:', e.message));
    console.log('Done waiting.');
    await browser.close();
  } catch (e) {
    console.error('Puppeteer error:', e);
  }
})();
