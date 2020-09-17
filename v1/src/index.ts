import { bufferReader } from "./buffer-reader";
const prompt = document.createElement("div");
prompt.textContent = "press any key to load buffer";
document.appendChild(prompt);

document.onkeydown = async (e) => {
  if (prompt.textContent !== "loading") {
    prompt.textContent = "loading";
    await bufferReader("http://localhost/samples/song.mp3");
    prompt.textContent = "playing";
  }
};
