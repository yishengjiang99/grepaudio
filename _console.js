const _console = (function () {
    var div = document.getElementById("console");
    div.styles={
        right:0, position:"absolute", top:"20vh",
    }
    var buffer = Array(10).fill("");
    var position = 0;
    var display = () => {
      div.innerHTML =
        buffer.slice(position % 10, 10).join("") +
        buffer.slice(0, position % 10).join("");
    };
    return {
      log: function (str) {
        if (true || window.location.hash.substring(1).startsWith("debug")) {
          var c = position % 10;
          buffer[c] = "<br>" + str;
          position++;
          display();
        }
      },
    };
  })();
export default _console;