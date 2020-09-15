import { resolve, basename } from "path";
import { readFileSync, existsSync, readdirSync } from "fs";
import { createServer } from "http";

const puppeteer = require("puppeteer");
const template = readFileSync(
  resolve(__dirname, "../template.html")
).toString();

export const loadTest = async (scriptPath, port) => {
  let html = template.replace("__TITLE__", scriptPath);

  html = html.replace("__script__", scriptPath);
  const sendMaybe = (filename, res) => {
    console.log("");
    filename = filename.replace(".ts", "");
    const dirs = filename.includes("spec")
      ? ["dist/test/specs"]
      : ["dist/src", "dist/src/processors"];
    dirs.forEach((path) => {
      const jsfile = resolve(path, filename) + ".js";
      if (existsSync(jsfile)) {
        res.writeHead(200, {
          "Content-Type": "application/javascript",
        });
        res.end(readFileSync(jsfile));
        return;
      }
      console.log(jsfile);
    });
    res.writeHead(404);
  };
  const server = createServer((req, res) => {
    if (req.url === "/") {
      res.end(html);
    } else {
      sendMaybe(basename(req.url), res);
    }
  });
  server.listen(port);
  return await new Promise((resolve) => {
    server.on("listening", async function () {
      const browser = await puppeteer.launch({
        headless: false,
      });
      const page = await browser.newPage();
      await page.goto("http://localhost:" + port);
      // other actions...
      await page.click("button");
      let element = await page.$("div#console");
      let value = await page.evaluate((el) => el.textContent, element);
      //  server.close();
      await new Promise((resolve) => setTimeout(resolve, 4000));

      resolve(value);
    });
  });
};
loadTest("./specs/upload.spec.ts", 8081);

// readdirSync(resolve(__dirname, "specs")).forEach((spec, idx) => {
//   if (!spec.includes("map.js"))
//     loadTest(resolve(__dirname, "specs", spec), 3333 + idx);
// });
