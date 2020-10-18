/* eslint-disable space-before-function-paren */
import { openSync, read } from "fs";
import { resolve } from "path";
import { ChildProcess, spawn } from "child_process";
import { Hertz, MidiNote, Milliseconds, Note } from "../tonejs/core/type/Units";
export const sleep = (ms: Milliseconds): Promise<void> => new Promise((r) => setTimeout(r, ms));
export const hrdiff = (h1: any, h2: any): number => h2[0] - h1[0] + (h2[1] - h1[1]) / 0xffffffff;
export const MP3_NOTE_SIZE = 10088;
export const pcm_note_size = 76216696 / 88;
export const midiToFreq = (midi: number): Hertz => {
	return Math.pow(2, (Math.floor(midi) - 69) / 12) * 440;
};
export const AU_SIZE = 128;
export const timePerFrame = (1 / 44100) * AU_SIZE;

export function sigfig(num: number, sigdig: number): number {
	const mask = 10 << sigdig;
	return Math.floor(num * mask) / mask;
}
const fds = {};
export type FileDescriptor = number;
export const getFd = (instrument: string): FileDescriptor => {
	const key = `mp3/FatBoy_${instrument.replace(" ", "_")}.mp3`;
	if (!fds[key]) {
		fds[key] = openSync(resolve(__dirname, "..", key), "r");
	}
	return fds[key];
};
export const keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export const cspawn = (cmd: string, str: string): ChildProcess => {
	const proc = spawn(cmd, str.split(" "));
	proc.stderr.pipe(process.stderr);
	// console.log(cmd + " " + str);
	return proc;
};

// export type FFMPEGFormat = <T extends string & "3dostr|3g2|3gp|4xm|a64|aa|aac|ac3|acm|act|adf|adp|ads|adts|adx|aea|afc|aiff|aix|alaw|alias_pix|alp|amr|amrnb|amrwb|anm|apc|ape|apm|apng|aptx|aptx_hd|aqtitle|argo_asf|asf|asf_o|asf_stream|ass|ast|au|av1|avfoundation|avi|avisynth|avm2|avr|avs|avs2|bethsoftvid|bfi|bfstm|bin|bink|bit|bmp_pipe|bmv|boa|brender_pix|brstm|c93|caf|cavsvideo|cdg|cdxl|cine|codec2|codec2raw|concat|crc|dash|data|daud|dcstr|dds_pipe|derf|dfa|dhav|dirac|dnxhd|dpx_pipe|dsf|dsicin|dss|dts|dtshd|dv|dvbsub|dvbtxt|dvd|dxa|ea|ea_cdata|eac3|epaf|exr_pipe|f32be|f32le|f4v|f64be|f64le|ffmetadata|fifo|fifo_test|film_cpk|filmstrip|fits|flac|flic|flv|framecrc|framehash|framemd5|frm|fsb|fwse|g722|g723_1|g726|g726le|g729|gdv|genh|gif|gif_pipe|gsm|gxf|h261|h263|h264|hash|hca|hcom|hds|hevc|hls|hnm|ico|idcin|idf|iff|ifv|ilbc|image2|image2pipe|ingenient|ipmovie|ipod|ircam|ismv|iss|iv8|ivf|ivr|j2k_pipe|jacosub|jpeg_pipe|jpegls_pipe|jv|kux|kvag|latm|lavfi|libmodplug|live_flv|lmlm4|loas|lrc|lvf|lxf|m4v|matroska|matroska,webm|md5|mgsts|microdvd|mjpeg|mjpeg_2000|mkvtimestamp_v2|mlp|mlv|mm|mmf|mov|mov,mp4,m4a,3gp,3g2,mj2|mp2|mp3|mp4|mpc|mpc8|mpeg|mpeg1video|mpeg2video|mpegts|mpegtsraw|mpegvideo|mpjpeg|mpl2|mpsub|msf|msnwctcp|mtaf|mtv|mulaw|musx|mv|mvi|mxf|mxf_d10|mxf_opatom|mxg|nc|nistsphere|nsp|nsv|null|nut|nuv|oga|ogg|ogv|oma|opus|paf|pam_pipe|pbm_pipe|pcx_pipe|pgm_pipe|pgmyuv_pipe|pictor_pipe|pjs|pmp|png_pipe|ppm_pipe|psd_pipe|psp|psxstr|pva|pvf|qcp|qdraw_pipe|r3d|rawvideo|realtext|redspark|rl2|rm|roq|rpl|rsd|rso|rtp|rtp_mpegts|rtsp|s16be|s16le|s24be|s24le|s32be|s32le|s337m|s8|sami|sap|sbc|sbg|scc|sdp|sdr2|sds|sdx|segment|ser|sgi_pipe|shn|siff|singlejpeg|sln|smjpeg|smk|smoothstreaming|smush|sol|sox|spdif|spx|srt|stl|stream_segment,ssegment|streamhash|subviewer|subviewer1|sunrast_pipe|sup|svag|svcd|svg_pipe|swf|tak|tedcaptions|tee|thp|tiertexseq|tiff_pipe|tmv|truehd|tta|tty|txd|ty|u16be|u16le|u24be|u24le|u32be|u32le|u8|uncodedframecrc|v210|v210x|vag|vc1|vc1test|vcd|vidc|vividas|vivo|vmd|vob|vobsub|voc|vpk|vplayer|vqf|w64|wav|wc3movie|webm|webm_chunk|webm_dash_manifest|webp|webp_pipe|webvtt|wsaud|wsd|wsvqa|wtv|wv|wve|xa|xbin|xmv|xpm_pipe|xvag|xwd_pipe|xwma|yop|yuv4mpegpipe"
export const midiToNoteStr = (i: MidiNote): Note2 => `${keys[i % 12]}${Math.floor(i / 12)}` as Note2;

export const strToFreq = (str: Note2): Hertz => {
	return midiToFreq(midis.indexOf(str) + 21);
};
export const strToMidi = (str: Note2): MidiNote => {
	const n = midis.indexOf(str.replace("_", "")) + 21;
	return n as MidiNote;
};
export type Note2 = "A0|Bb0|B0|C1|Db1|D1|Eb1|E1|F1|Gb1|G1|Ab1|A1|Bb1|B1|C2|Db2|D2|Eb2|E2|F2|Gb2|G2|Ab2|A2|Bb2|B2|C3|Db3|D3|Eb3|E3|F3|Gb3|G3|Ab3|A3|Bb3|B3|C4|Db4|D4|Eb4|E4|F4|Gb4|G4|Ab4|A4|Bb4|B4|C5|Db5|D5|Eb5|E5|F5|Gb5|G5|Ab5|A5|Bb5|B5|C6|Db6|D6|Eb6|E6|F6|Gb6|G6|Ab6|A6|Bb6|B6|C7|Db7|D7|Eb7|E7|F7|Gb7|G7|Ab7|A7|Bb7|B7|C8";
const midis = "A0|Bb0|B0|C1|Db1|D1|Eb1|E1|F1|Gb1|G1|Ab1|A1|Bb1|B1|C2|Db2|D2|Eb2|E2|F2|Gb2|G2|Ab2|A2|Bb2|B2|C3|Db3|D3|Eb3|E3|F3|Gb3|G3|Ab3|A3|Bb3|B3|C4|Db4|D4|Eb4|E4|F4|Gb4|G4|Ab4|A4|Bb4|B4|C5|Db5|D5|Eb5|E5|F5|Gb5|G5|Ab5|A5|Bb5|B5|C6|Db6|D6|Eb6|E6|F6|Gb6|G6|Ab6|A6|Bb6|B6|C7|Db7|D7|Eb7|E7|F7|Gb7|G7|Ab7|A7|Bb7|B7|C8".split(
	"|"
);
