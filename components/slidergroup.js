'use strict';
import {EQ_PRESETS} from '../presets.js';

const e = React.createElement;

class Slider extends React.Component {

  render() {
    const style = '"display: inline-block; -webkit-appearance: slider-vertical; width: 50px; height: 150px;'
    const { min, max, title, value, index } = this.props;
    return e('input',
      {
        onInput: (e) => this.props.onSliderUpdate(this.index, e.target.value),
        orient: 'vertical',
        title: { title },
        type: "range",
        className: 'slider',
        min: { min },
        max: { max }
      });
  }
}

export class SliderGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pcurrentPreseteset: props.currentPreset,
      presetMenu: props.presetMenu,
      gains: props.gains,
      hz_list: props.hs_list
    }
  }

  onSliderUpdate(index, value) {
    var gains = this.state.gains;
    gains

  }
  render() {
    const min_db = -12;
    const max_db = 12;
    const { bands, preset, presetMenu } = this.props;

    return e(
      'div',
      {},
      [
        e('select',
          { name: 'preset' },
          presetMenu.map(p => e('option', { value: p }, p))
        ),
        e('div', {},
          HZ_LIST.map( (hz, index) => e('Slider',{min:12, max:12, onSliderUpdate: this.onSliderUpdate, value: hz, index: index}))

        )
      ]
    )

  }
}
 
const HZ_LIST = new Float32Array([31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

const domContainer = document.querySelector('#equalizer');

const presetMenu = Object.keys(EQ_PRESETS)
ReactDOM.render(e(SliderGroup,{
	currentPreset: presetMenu[0],
  presetMenu: presetMenu,
  gains: EQ_PRESETS[presetMenu[0]].bandpasses,
  hz_list: HZ_LIST
}), domContainer);

