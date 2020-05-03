export default class SPLDBaNode extends AudioWorkletNode {

    constructor(context) {
        super(context,'spl_dba');
        this.port.onmessage = this.handleMessage_.bind(this)
     }

      handleMessage_(event) {
        debugger;
        console.log(event);
      }
        
}