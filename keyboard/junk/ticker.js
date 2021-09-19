var timerID = null;
var interval = 100;
var start = 0;
self.onmessage = function ({ data }) {
  switch (data.type) {
    case "start":
      console.log("on msg")
      start = new Date();
      timerID = setInterval(function () {
        postMessage({
          event: "interval",
          time: new Date().getTime() - start.getTime(),
        });
      }, interval);
      break;
    case "stop":
      clearInterval(timerID);

      break;
    case "interval":
      interval = data.interval;
      break;
  }
};

window.postMessage("hi");