export const timeseries = (arr: Float32Array, divId) => {
  const length = arr.length;
  const div = document.getElementById(divId);
  const width = div.parentElement.clientWidth;
  const height = div.parentElement.clientHeight;
  let points = "";
  for (let i = 0; i < arr.length; i++) {
    const x = (i / length) * width;
    const y = height / 2 + (arr[i] * height) / 10;
    points += x + "," + y + " ";
  }
  div.innerHTML = `<svg viewBox="0 0 ${width} ${height}" class="chart">
  <polyline
     fill="none"
     stroke="#0074d9"
     stroke-width="1"
     points="${points.trim()}"/>
</svg>`;
};
