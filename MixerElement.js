import { html, Component, render } from 'https://unpkg.com/htm/preact/standalone.module.js';


class Mixer extends Component{
    constructor( props ){
        super(props);
        const ctx = props.ctx || new AudioContext();

        this.state={
            ctx, 
            masterGain: props.masterGain || ctx.createGain(),
            labels: Array(8).fill(""),
            inputVolumes: Array(8).fill(ctx.createGain(1))
        }
    }

    render( ){
        const { labels, inputVolumes } = this.state;
        const { inputs } = this.props;
        return (
            <div>aa
                { inputs.map( (input, index) => {
                    switch(input.type){
                        case "YT_PLAYER":
                            return (<YTPlayer status={labels[index]} volume={ inputVolumes[index]} />);
                        case "httpaudio":
                            return (<HttpAudio csv={ input.csv } status={labels[index]} volume={ inputVolumes[index]} />);
                        case "piano":
                            return (<Chords csv={ input.csv}  status={labels[index]} volume={ inputVolumes[index]} />);
                        // case "notes":
                        //     return html(<NotesSample csv={ input.csv}  status={labels[index]} volume={ inputVolumes[index]} />);
                        // case "spotify":
                        //     return html(<Spotify status={labels[index]} volume={ inputVolumes[i]} />);
                        // case "usermedia":
                        //     return html(<Microphone status={labels[index]} volume={ inputVolumes[i]} />);
                        // case "rtcstream":
                        //     return html(<RTCStream status={labels[index]} volume={ inputVolumes[i]} />);
                    }
                })}    
            </div>)
        )
    }

}
const YTPlayer =()=> (<div>yaat</div>);
const HttpAudio =()=>(<div>HttpAudio</div>);
const Chords =() => (<div>Chords</div>);



render((<{Mixer} inputs={[
    {type:"YT_PLAYER"},
    {type:"httpaudio", csv:"https://dsp.grepawk.com/samples/songs.csv"}
]} />), document.body);