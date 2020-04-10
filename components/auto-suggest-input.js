import {
  LitElement,html, property
} from 'lit-element';


export class AutoSuggestInput extends LitElement
{

  static get stlyes(){
    return css `
    ul: { position:absolute; top:100%; left:0; right:0}
    ul::slotted(li): {  padding: 10px;cursor: pointer;  background-color: #fff;border-bottom: 1px solid #d4d4d4;}
    div: { position: relative; display:inline-block}
    `}
    static get properties() { return {
      items: { type: Array }
    };}

  constructor(){
    super();
    this.items = [{ vid:"vid1", title:"title1" }];
  }

  makeQuery(){

  }
  // Implement `render` to define a template for your element.
  render()
  { 
    var items = this.items;
    return html(`
  <form class=autocomplete @keydown="${this.keydown}" @submit="${this.makeQuery()}">
      <div>
        <input size=50 type='text' placeholder='search for audio' />
        <ul class='auto-complete-list'>
        </ul>
        <input type="submit" />       
     </div>
    </form>
    `);
  }
}
customElements.define("autosuggest-input-box", AutoSuggestInput);
