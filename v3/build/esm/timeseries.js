import { __awaiter } from "tslib";
export const readableTimeseries = () => {
    const rs = new ReadableStream({
        start: (controller) => __awaiter(void 0, void 0, void 0, function* () {
            while (true) {
                yield new Promise((resolve) => {
                    controller.enqueue(new Date().toLocaleString());
                    setTimeout(resolve, 10);
                });
            }
        }),
        pull: (controller) => { },
        cancel: () => { },
    });
    let data = [];
    const reader = rs.getReader();
    reader.read().then(function process({ done, value }) {
        console.log(value, done);
        if (done)
            return;
        else
            return reader.read().then(process);
    });
};
export const timeseries = (arr, divId) => {
    const length = arr.length;
    const div = divId instanceof HTMLElement ? divId : document.getElementById(divId);
    if (!div || !div.parentElement) {
        return;
    }
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
//# sourceMappingURL=timeseries.js.map