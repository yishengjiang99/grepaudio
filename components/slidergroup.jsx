
const EQ_PRESETS = {
    "Classical":{"preamp":"0.375", "gains":["0.375","0.375","0.375","0.375","0.375","0.375","-4.5","-4.5","-4.5"]},
    "Club":{"preamp":"0.375","gains":["0.375","0.375","2.25","3.75","3.75","3.75","2.25","0.375","0.375"]},
    "Dance":{"preamp":"0.375","gains":["6","4.5","1.5","0","0","-3.75","-4.5","-4.5","0"]},
    "Flat":{"preamp":"0.375", "gains":["0.375","0.375","0.375","0.375","0.375","0.375","0.375","0.375","0.375"]},
    "Live":{"preamp":"0.375","gains":["-3","0.375","2.625","3.375","3.75","3.75","2.625","1.875","1.875"]},
    "Laptop Speakers/Headphone":{"preamp":"0.375","gains":["3","6.75","3.375","-2.25","-1.5","1.125","3","6","7.875"]},
    "Rock":{"preamp":"0.375","gains":["4.875","3","-3.375","-4.875","-2.25","2.625","5.625","6.75","6.75"]},
    "Pop":{"preamp":"0.375","gains":["-1.125","3","4.5","4.875","3.375","-0.75","-1.5","-1.5","-1.125"]},
    "Full Bass and Treble":{"preamp":"0.375","gains":["4.5","3.75","0.375","-4.5","-3","1.125","5.25","6.75","7.5"]},
    "Full Bass":{"preamp":"0.375","gains":["6","6","6","3.75","1.125","-2.625","-5.25","-6.375","-6.75"]},
    "Full Treble":{"preamp":"0.375","gains":["-6","-6","-6","-2.625","1.875","6.75","9.75","9.75","9.75"]},
    "Soft":{"preamp":"0.375","gains":["3","1.125","-0.75","-1.5","-0.75","2.625","5.25","6","6.75"]},
    "Party":{"preamp":"0.375","gains":["4.5","4.5","0.375","0.375","0.375","0.375","0.375","0.375","4.5"]},
    "Ska":{"preamp":"0.375","gains":["-1.5","-3","-2.625","-0.375","2.625","3.75","5.625","6","6.75"]},
    "Soft Rock":{"preamp":"0.375","gains":["2.625","2.625","1.5","-0.375","-2.625","-3.375","-2.25","-0.375","1.875"]},
    "Large Hall":{"preamp":"0.375","gains":["6.375","6.375","3.75","3.75","0.375","-3","-3","-3","0.375"]},
    "Reggae":{"preamp":"0.375","gains":["0.375","0.375","-0.375","-3.75","0.375","4.125","4.125","0.375","0.375"]},
    "Techno":{"preamp":"0.375","gains":["4.875","3.75","0.375","-3.375","-3","0.375","4.875","6","6"]}
}
const presetMenu = Object.keys(EQ_PRESETS)
var currentPreset= presetMenu[0];
var gains = EQ_PRESETS[currentPreset+""]["gains"]
const HZ_LIST = new Float32Array([31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
const domContainer = document.querySelector('#equalizer');


class SliderGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPreset: props.currentPreset,
            presetMenu: props.presetMenu,
            gains: props.gains,
            hz_list: props.hs_list
        }
    }

    onSliderUpdate() {
        var gains = this.state.gains;

    }
    render() {

        const min_db = -12;
        const max_db = 12;
        const { bands, currentPreset, gains, presetMenu } = this.props;


        return(<div>
            <div>{currentPreset}
                <span>
                    <select name='presetselect'>
                        {presetMenu.map(p => (<option value={p}>{p}</option>))}
                    </select>
                </span>
            </div>
            <div>
            <Slider index={1} max="12" onSliderUpdate={this.onSliderUpdate} />

            </div>
        </div>)
    }
}
  
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
                max: { max },
                value: { value }
            });
    }
}




ReactDOM.render((<SliderGroup 
    currentPreset={currentPreset}
    presetMenu={presetMenu}
    gains={gains}
    bands={HZ_LIST}
/>), domContainer);

  