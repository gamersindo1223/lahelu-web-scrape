const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const cors = require("cors");
const express = require("express");
const rateLimit = require('express-rate-limit')
const cheerio = require("cheerio");
const app = express();
const port = process.env.PORT ?? 8080;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 create account requests per `window` (here, per hour)
	message:
		'Too many request created from this IP, please try again after an hour',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.use(createAccountLimiter)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/lahelu/random", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    chromium.setHeadlessMode = true;
  
    // Optional: If you'd like to disable webgl, true is the default.
    chromium.setGraphicsMode = false;
    const page = await browser.newPage();
    async function getShuffle() {
      await page.setUserAgent(
        "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
      );
      const response = await page.goto(`https://lahelu.com/shuffle`, {
        waitUntil: "networkidle0",
      });
      await page.setRequestInterception(true);
      const rejectRequestPattern = [
        "googlesyndication.com",
        "/*.doubleclick.net",
        "/*.amazon-adsystem.com",
        "/*.adnxs.com",
      ];
      const blockList = [];
      page.on("request", (request) => {
        if (
          rejectRequestPattern.find((pattern) => request.url().match(pattern))
        ) {
          blockList.push(request.url());
          request.abort();
        } else request.continue();
      });
      if (response.status() !== 200)
        return res.json({
          error: true,
          statuscode: response.status(),
          message: "website is down",
        });
      await page.waitForSelector("article");
      const $ = cheerio.load(await page.content());
      const currpage = $('div[class^="Div_space__7HOAc Div_gap-xs__yTwgF"]');
      //get author thing
      const authorpfp = $("article").find("img").attr("src");
      const authorname = $('span[class^="AuthorMeta_username__yRXGw"]').text();
      //get media thing
      const title = currpage.find("h1").text();
      const media =
        currpage.find("video").attr("src") || currpage.find("img").attr("src");
      const category = $(
        'div[class^="Div_space__7HOAc Div_gap-2xs__OnWXN Div_wrap__Ae_Kw"]'
      ).text();
      if (category.toLowerCase().includes("sensitif")) {
        await browser.close();
        return await getShuffle();
      }
      console.log("should returns something");
      return {
        author: {
          name: authorname,
          profilepicture: authorpfp,
        },
        title: title,
        media: media,
        category: category,
      };
    }
    const a = await getShuffle();
    res.json({
      error: false,
      data: a,
    });
    await browser.close();
  } catch (e) {
    console.log(e);
  }
});

app.get("/lahelu/user/:username", async (req, res) => {
  const { username } = req.params;
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  chromium.setHeadlessMode = true;

  // Optional: If you'd like to disable webgl, true is the default.
  chromium.setGraphicsMode = false;
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
    );

    const response = await page.goto(`https://lahelu.com/user/${username}`, {
      waitUntil: "networkidle0",
    });
    await page.setRequestInterception(true);
    const rejectRequestPattern = [
      "googlesyndication.com",
      "/*.doubleclick.net",
      "/*.amazon-adsystem.com",
      "/*.adnxs.com",
    ];
    const blockList = [];
    page.on("request", (request) => {
      if (
        rejectRequestPattern.find((pattern) => request.url().match(pattern))
      ) {
        blockList.push(request.url());
        request.abort();
      } else request.continue();
    });
    if (response.status() !== 200)
      return res.json({
        error: true,
        statuscode: response.status(),
        message: "User not found or website is down",
      });
    const $ = cheerio.load(await page.content());
    const description = $('meta[property="og:description"]').attr("content");
    const profilepictureurl = $('meta[property="og:image"]').attr("content");
    const profileurl = $('link[rel="canonical"]').attr("href");
    const totalmemes = $($(".Div_grid__75b2Q span")[1]).text();
    const totalupvotes = $($(".Div_grid__75b2Q span")[3]).text();
    const badges = [];
    const allbadgeselector =
      "#__next > div > main > div > div.Div_space__7HOAc.Div_gap-xl__AU2oQ.Div_vertical__0POjO > div.Div_space__7HOAc.Div_gap-xs__yTwgF.Div_wrap__Ae_Kw > button:nth-child(5)";
    if (
      (await page.$(
        "#__next > div > main > div > div.Div_space__7HOAc.Div_gap-xl__AU2oQ.Div_vertical__0POjO > div.Div_space__7HOAc.Div_gap-xs__yTwgF.Div_wrap__Ae_Kw > button:nth-child(1)"
      )) !== null
    ) {
      let buttons;
      if ((await page.$(allbadgeselector)) !== null) {
        await page.click(allbadgeselector);
        buttons = await page.$$(
          "#__next > div > main > div > div.Div_space__7HOAc.Div_gap-xl__AU2oQ.Div_vertical__0POjO > div.Div_space__7HOAc.Div_gap-xs__yTwgF.Div_wrap__Ae_Kw button"
        );
      }
      // Click each button
      for (const button of buttons) {
        await button.click().then((x) => {
          setTimeout(async () => {
            badges.push(
              await page.$eval(
                "#portal2 .Component_wrapper__soShl",
                (element) => element.textContent
              )
            );
          }, 500);
        });
      }
    }
    res.json({
      user: {
        name: username,
        description: description,
        pictureurl: profilepictureurl,
        profileurl: profileurl,
        totalmemes: totalmemes,
        totalupvotes: totalupvotes,
        badges: badges,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({ error: true, message: "User not found" });
    await browser.close();
  }
});
app.get("/test", async (req, res) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  chromium.setHeadlessMode = true;

  // Optional: If you'd like to disable webgl, true is the default.
  chromium.setGraphicsMode = false;
  const page = await browser.newPage();
  await page.goto("https://example.com");
  const pageTitle = await page.title();
  res.send(pageTitle)
  await browser.close();
})
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
