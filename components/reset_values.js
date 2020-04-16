'use strict';

const e = React.createElement;

class Slider extends React.Component {

  render() {
    const style = '"display: inline-block; -webkit-appearance: slider-vertical; width: 50px; height: 150px;'
    const { min, max, title, value, index } = this.props;
    return e('input',
      {
        onInput: (e) => this.props.onSliderUpdate(this.index, e.target.value),
        style={ style },
        orient='vertical',
        title: { title },
        type: "range",
        className: 'slider',
        min: { min },
        max={ max }
      });
  }
}

class SliderGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preset: props.preset,
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
    const { bands, preset, presetMenu } = this.state;

    return (

      <div id="equalizer" style="margin-top: 10px">
        <select value={preset}>
          {presetMenu.map(preset => {
            return (
              <option value={preset}>{preset}</option>
            )
          })}
        </select>
        {bands.map((band, index) => {
          (
            <Slider min={-12} max={12} onSliderUpdate={this.onSliderUpdate} value={band} index={index} />
          )
        })}
      </div>
    )
  }
}


const domContainer = document.querySelector('#equalizer');

ReactDOM.render(e(SliderGroup,{
  presets:presets.defaultPreset,
  presetMenu: Object.keys(presets),
  gains: presets['defalutPreset'].bandpasses,
  hz_list: props.hs_list
}), domContainer);


const presets={
  "default": "[Dance]",
	"[Classical]": {
		"preamp": "0.375",
		"bandpasses": [
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"-4.5",
			"-4.5",
			"-4.5"
		]
	},
	"[Club]": {
		"preamp": "0.375",
		"bandpasses": [
			"0.375",
			"0.375",
			"2.25",
			"3.75",
			"3.75",
			"3.75",
			"2.25",
			"0.375",
			"0.375"
		]
	},
	"[Dance]": {
		"preamp": "0.375",
		"bandpasses": [
			"6",
			"4.5",
			"1.5",
			"0",
			"0",
			"-3.75",
			"-4.5",
			"-4.5",
			"0"
		]
	},
	"[Flat]": {
		"preamp": "0.375",
		"bandpasses": [
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375"
		]
	},
	"[Live]": {
		"preamp": "0.375",
		"bandpasses": [
			"-3",
			"0.375",
			"2.625",
			"3.375",
			"3.75",
			"3.75",
			"2.625",
			"1.875",
			"1.875"
		]
	},
	"[Laptop Speakers/Headphone]": {
		"preamp": "0.375",
		"bandpasses": [
			"3",
			"6.75",
			"3.375",
			"-2.25",
			"-1.5",
			"1.125",
			"3",
			"6",
			"7.875"
		]
	},
	"[Rock]": {
		"preamp": "0.375",
		"bandpasses": [
			"4.875",
			"3",
			"-3.375",
			"-4.875",
			"-2.25",
			"2.625",
			"5.625",
			"6.75",
			"6.75"
		]
	},
	"[Pop]": {
		"preamp": "0.375",
		"bandpasses": [
			"-1.125",
			"3",
			"4.5",
			"4.875",
			"3.375",
			"-0.75",
			"-1.5",
			"-1.5",
			"-1.125"
		]
	},
	"[Full Bass and Treble]": {
		"preamp": "0.375",
		"bandpasses": [
			"4.5",
			"3.75",
			"0.375",
			"-4.5",
			"-3",
			"1.125",
			"5.25",
			"6.75",
			"7.5"
		]
	},
	"[Full Bass]": {
		"preamp": "0.375",
		"bandpasses": [
			"6",
			"6",
			"6",
			"3.75",
			"1.125",
			"-2.625",
			"-5.25",
			"-6.375",
			"-6.75"
		]
	},
	"[Full Treble]": {
		"preamp": "0.375",
		"bandpasses": [
			"-6",
			"-6",
			"-6",
			"-2.625",
			"1.875",
			"6.75",
			"9.75",
			"9.75",
			"9.75"
		]
	},
	"[Soft]": {
		"preamp": "0.375",
		"bandpasses": [
			"3",
			"1.125",
			"-0.75",
			"-1.5",
			"-0.75",
			"2.625",
			"5.25",
			"6",
			"6.75"
		]
	},
	"[Party]": {
		"preamp": "0.375",
		"bandpasses": [
			"4.5",
			"4.5",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"0.375",
			"4.5"
		]
	},
	"[Ska]": {
		"preamp": "0.375",
		"bandpasses": [
			"-1.5",
			"-3",
			"-2.625",
			"-0.375",
			"2.625",
			"3.75",
			"5.625",
			"6",
			"6.75"
		]
	},
	"[Soft Rock]": {
		"preamp": "0.375",
		"bandpasses": [
			"2.625",
			"2.625",
			"1.5",
			"-0.375",
			"-2.625",
			"-3.375",
			"-2.25",
			"-0.375",
			"1.875"
		]
	},
	"[Large Hall]": {
		"preamp": "0.375",
		"bandpasses": [
			"6.375",
			"6.375",
			"3.75",
			"3.75",
			"0.375",
			"-3",
			"-3",
			"-3",
			"0.375"
		]
	},
	"[Reggae]": {
		"preamp": "0.375",
		"bandpasses": [
			"0.375",
			"0.375",
			"-0.375",
			"-3.75",
			"0.375",
			"4.125",
			"4.125",
			"0.375",
			"0.375"
		]
	},
	"[Techno]": {
		"preamp": "0.375",
		"bandpasses": [
			"4.875",
			"3.75",
			"0.375",
			"-3.375",
			"-3",
			"0.375",
			"4.875",
			"6",
			"6"
		]
	}
}
