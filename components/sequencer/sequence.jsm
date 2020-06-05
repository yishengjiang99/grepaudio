const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

class Sequence {
    constructor(){
        this._sheet = [...Array(1024)].map(e => Array(15).fill(0));
        this._cursor = 0;
        this._bpm = 120;
    }
    static indexOf(note){
        if(note.length==2){
            return notes.indexOf( note.substr(0));
        }else{
            return notes.indexOf( note.substr(0,2));

        }
    }
    get sheet(){
        return this._sheet.splice(0,this._cursor);
    }
    get bpm(){
        return this._bpm;
    }
    set bpm(val){
        this._bpm = val;
    }
    addNote(note){
        this._sheet[this._cursor][Sequence.indexOf(note)] = 1;
        this._cursor++;
        return this;
    }
    addNotes(notes){
        notes.forEach(note=>{
            this._sheet[this._cursor][Sequence.indexOf(note)] = 1;
        })
        this._cursor++;
        return this;
    }
    
}

var sequence = new Sequence();
sequence.addNote("C2").addNote("E2").addNote("G2")
console.log(sequence.bpm)



console.log(sequence.sheet)