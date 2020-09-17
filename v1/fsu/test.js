"use strict";
exports.__esModule = true;
var fs = require("fs");
var https = require("https");
var template_1 = require("./template");
var express = require('express');
var session = require('express-session');
var app = express();
var uuid = 0;
var genuuid = function () {
    return uuid++;
};
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    genid: function (req) {
        return genuuid(); // use UUIDs for session IDs
    },
    cookie: { secure: true }
}));
app.get("/", function (req, res) {
    res.write(template_1.html0);
    res.write(template_1.critcss);
    res.write(template_1.critjs("\n    const wshost = 'wss://" + req.hostname + "/" + req.session.genid + "';\n    const sessionId = '" + req.session.genid + "'"));
    res.write(template_1.html3);
    res.write("<script crossorigin src=\"https://unpkg.com/react@16/umd/react.production.min.js\"></script>\n  <script crossorigin src=\"https://unpkg.com/react-dom@16/umd/react-dom.production.min.js\"></script>");
});
app.get("/:channelId", function (req, res) {
    res.end(req.params.channelId);
});
var tls = {
    hostname: process.env.HOST,
    key: fs.readFileSync(process.env.PRIV_KEYFILE),
    cert: fs.readFileSync(process.env.CERT_FILE)
};
var server = https.createServer(tls, app);
server.listen(443);
https.get("https://dev.walmart.com", function (res) {
    res.pipe(process.stdout);
    server.close();
    res.on('end', function () { return process.exit(0); });
});
