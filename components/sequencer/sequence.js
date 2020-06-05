
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

class Sequence extends React.Component {

    constructor(){
        super();
        this.state={
            sheet:[...Array(50)].map(e => Array(notes.length).fill(0)),
            cursor:0,
            bpm: 120
        }
    }


    addNote(note){
        var i = notes.indexOf(note);
        const newState = this.state.sheet; //[this.state.cursor][i]=1;
        var c = this.state.cursor;
        
        newState[this.]
        this.setState({
            sheet: newState,
            cursor: this.state.cursor+1
        })
        return this;
    }
    addNotes(notes){
        notes.forEach(note=>{
            var i = notes.indexOf(note);

            this._sheet[this._cursor][i] = 1;
        })
        this._cursor++;
        return this;
    }
    
    render(){
        return <div>
            {}
        </div>
    }
}
