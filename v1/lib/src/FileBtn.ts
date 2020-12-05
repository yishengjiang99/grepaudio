export const ButtonFile = () => {
  let fh;
  const btn = document.createElement("button");

  btn.addEventListener("click", async () => {
    // Destructure the one-element array.
    // @ts-ignore
    [fh] = await window.showOpenFilePicker();
    // Do something with the file handle.
  });
};
