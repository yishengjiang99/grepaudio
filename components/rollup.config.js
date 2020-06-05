import resolve from 'rollup-plugin-node-resolve';
import scss from 'rollup-plugin-scss'

export default {
  // If using any exports from a symlinked project, uncomment the following:
  // preserveSymlinks: true,
  input: ['src/index.js'],
    output: {
        file: "bundle.js",
        format: "umd",
        name: "grepawk_audio",
    },
  plugins: [
    scss(),
    resolve()
  ]
};
