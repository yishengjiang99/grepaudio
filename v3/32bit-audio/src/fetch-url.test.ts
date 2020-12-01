import { fetchLoader } from "./fetch-url";

describe("fetch-load", () => {
	it("loads info about sset", async () => {
		const headers = await fetchLoader(8000).preflight(
			"https://grep32bit.blob.core.windows.net/pcm/2L-145_mch_FLAC_96k_24b_01.flac"
		);
		headers.
	});
});

const azconn=`${process.env.AZ_ACCOUNT} ${process.env.AZ_KEY}`

function sp(str:TemplateStringsArray, $azAccount,$azkey){
	spawn()
}
function PUT(str:TemplateStringsArray, container, blob){
	const strage='grep32bit';
	sp`echo PUT /${container}/${blob} HTTP/1.1 \n\
	Content-Type: text/plain; charset=UTF-8 \n
	x-ms-blob-type: PageBlob \n\
	x-ms-blob-content-length: 1024 \n\
	x-ms-blob-sequence-number: 0 \n\
	Authorization: SharedKey ${process.env.AZ_ACCOUNT} ${process.env.AZ_KEY} \n\n`;
}


PUT`/pcm/blob4`;

