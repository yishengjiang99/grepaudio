const templatecss = require("fs").readFileSync("./static/crit.css");
const templateJs = require("fs").readFileSync("./static/crit.js");
const html0 = `<html<body><head><title>whatver we awesome</title>`;
const critcss = `<style>${templatecss}</style>`;
const critjs = (js) => `<script>` + js + "\n" + templateJs + `</script>`;
const html3 = `</head >
    <body>
        <style>
            body {
                width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: black;
            color: white;
        }

        #container {
                display: grid;
            width: 100vw;
            height: 100vh;
            grid-gap: 10px;
            color: white;
        }


        .header {
                grid - row: 1/2;
            grid-column: 2 / 5;
            background-color: #222222;
        }

        .sidenav {
                grid - column: 1;
            grid-row: 1 / 4;
            background-color: #333333;

        }

        .main {
                grid - column: 2 / 4;
            grid-row: 2 / 8;
            background-color: #555555;
        }

        .nowplaying {
                grid - column: 4 / 5;
            grid-row: 2 / 8;
            background-color: #555555;
        }

        .localchannel {
                grid - column: 1;
            grid-row: 4;
            background-color: #333333;

        }

        .band_freq_out {
                grid - column: 1;
            grid-row: 5/6;
            background-color: #333333;
        }


        .footer {
                padding: 20px;
            grid-row: 8/10;
            grid-column: 1 / 5;
            background-color: #333333;
        }

        .song-controls button {
                cursor: pointer;
        }
    </style>
        <div class="mui-appbar">
            <span id='welcome'></span>

        </div>
        <div id=container>
            <div class=header id='header'>


            </div>
            <div class=sidenav id='playlist'>

            </div>
            <div class=main id='tracklist'>

            </div>`;
module.exports = {
    html0, critcss, critjs, html3
}