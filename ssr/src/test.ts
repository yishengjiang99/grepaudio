require("./wss");
const p = new PassThrough();
writeFrame(p, Buffer.from("heloworld"));
p.on("data", (d) => console.log(d.toString()));
