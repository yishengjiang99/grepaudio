# grepaudio

Web-based DSP audio mixer and effects processor.

Live demo: https://dsp.grepawk.com

## Development

### Prerequisites
- Node.js 18 or higher
- npm

### Setup
```bash
npm install
```

### Development Server
```bash
npm run dev
```

This will start a local development server at http://localhost:3000

### Build for Production
```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## Deployment

The project is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

The deployment workflow:
1. Installs dependencies
2. Builds the project with Vite
3. Deploys to GitHub Pages

## Architecture

The application is built with:
- Vanilla JavaScript (ES Modules)
- Web Audio API
- WebRTC for real-time audio streaming
- Vite for build and bundling

### Core Components
- **Mixer.js**: Main audio mixer with track management
- **NoiseGate/**: Noise gate audio processor
- **splitband.js**: Multi-band audio splitting and EQ
- **AnalyzerView.js**: Audio visualization
- **band_pass_lfc/**: Band-pass filter implementation
- **draw.js**: Canvas-based visualization

