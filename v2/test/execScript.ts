import { resolve, basename } from "path";
import { readFileSync, existsSync, readdirSync } from "fs";
import { createServer } from "http";

const puppeteer = require("puppeteer");
const template = readFileSync(
  resolve(__dirname, "../template2.html")
).toString();

export const execScript = async (script) => {
  const html = template.replace("__script_body__", script);
  const sendMaybe = (filename, res) => {
    filename = filename.replace(".ts", "");
    ["dist/test/specs", "dist/src", "dist/test", "dist/test/specs"].forEach(
      (path) => {
        const jsfile = resolve(path, filename) + ".js";
        console.log("checking", jsfile);
        if (existsSync(jsfile)) {
          res.writeHead(200, {
            "Content-Type": "application/javascript",
          });
          res.end(readFileSync(jsfile));
          return;
        }
      }
    );
    res.writeHead(404);
  };
  const server = createServer((req, res) => {
    if (req.url === "/") {
      res.end(html);
    } else {
      sendMaybe(basename(req.url), res);
    }
  });
  server.listen(3322);
  return await new Promise((resolve) => {
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
      server.close();
      await new Promise((resolve) => setTimeout(resolve, 4000));

      resolve(value);
    });
  });
};
