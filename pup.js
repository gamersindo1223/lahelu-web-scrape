const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
(async () => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true,
      });
  const page = await browser.newPage();

  await page.goto("https://lahelu.com/user/perjuangan_komu");

  // Find the div with the specified selector
  const div = await page.querySelector("#portal2 .Component_wrapper__soShl");

  // Get the text of the div
  const text = await div.textContent;

  console.log(text); // "Wibu I"

  await browser.close();
})();