/*const chromium = require("@sparticuz/chromium");
const { chromium: playwright } = require("playwright-core");
const puppeteer = require("puppeteer-core");
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT ?? 8080;
const cheerio = require("cheerio");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/lahelu/random", async (req, res) => {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "new",
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
  
    async function getShuffle() {
      try {
        await page.goto(`https://lahelu.com/shuffle`, {
          waitUntil: "networkidle2",
        });
    
        await page.waitForSelector("article");
        
        const $ = cheerio.load(await page.content());
        const currpage = $('div[class^="Div_space__7HOAc Div_gap-xs__yTwgF"]');
        const authorpfp = $("article").find("img").attr("src");
        const authorname = $('span[class^="AuthorMeta_username__yRXGw"]').text();
      
        const title = currpage.find("h1").text();
        const media =
          currpage.find("video").attr("src") || currpage.find("img").attr("src");
        const category = $(
          'div[class^="Div_space__7HOAc Div_gap-2xs__OnWXN Div_wrap__Ae_Kw"]'
        ).text();
    
        if (category.toLowerCase().includes("sensitif")) {
          await browser.close();
          return getShuffle();
        }
    
        return {
          author: {
            name: authorname,
            profilepicture: authorpfp,
          },
          title: title,
          media: media,
          category: category,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  
    try {
      const data = await getShuffle();
      await page.close();
      await browser.close();
      res.set({
        "Access-Control-Allow-Origin": "*",
      });
      return res.json({
        error: false,
        data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while getting the content.",
      });
    }
  });
/*
app.get("/lahelu/random", async (req, res) => {
    let browser = null;
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "new",
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
  async function getShuffle() {

    await page.goto(`https://lahelu.com/shuffle`, {
      waitUntil: "networkidle2",
    });
    await page.waitForSelector("article");
    const $ = cheerio.load(await page.content());
    await browser.close();
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
    if (category.toLowerCase().includes("sensitif")) return await getShuffle();

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
  res.send({
    error: false,
    a,
  });
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});*/