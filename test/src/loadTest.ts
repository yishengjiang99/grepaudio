import { resolve, basename as pathBaseName } from "path";
import { readFileSync } from "fs";
import * as puppeteer from "puppeteer";
import { createServer } from "http";

const template = readFileSync(
  resolve(__dirname, "../template.html")
).toString();

export function loadTest(script) {
  const html = template.replace("__script__", script);
  const basename = pathBaseName(script);
  const server = createServer((req, res) => {
    if (req.url !== "/") {
      res.writeHead(200, {
        "Content-Type": "application/javascript",
      });
      res.end(readFileSync(resolve(__dirname, "../dist/" + basename + ".js")));
      return;
    }
    res.end(html);
  });
  server.listen(3322);
  server.on("listening", async function () {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto("http://localhost:3322");
    // other actions...
    await page.click("button");
    let element = await page.$("div#console");
    let value = await page.evaluate((el) => el.textContent, element);
    console.log(value);
  });
}

loadTest("./test_oscillator");
