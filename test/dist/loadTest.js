"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTest = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const puppeteer = require("puppeteer");
const http_1 = require("http");
const template = fs_1.readFileSync(path_1.resolve(__dirname, "../template.html")).toString();
function loadTest(script) {
    const html = template.replace("__script__", script);
    const basename = path_1.basename(script);
    const server = http_1.createServer((req, res) => {
        if (req.url !== "/") {
            res.writeHead(200, {
                "Content-Type": "application/javascript",
            });
            res.end(fs_1.readFileSync(path_1.resolve(__dirname, "../dist/" + basename + ".js")));
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
exports.loadTest = loadTest;
loadTest("./test_oscillator");
//# sourceMappingURL=loadTest.js.map