const fs=require('fs');

const file = fs.readFileSync('./data/eq.preset');

const lines = file.toString().split("\n")

var presets = {}
for(let i =0; i< lines.length; i+=13){
  const title = lines[i];
  presets[title] = {
    preamp: lines[i+1],
    bandpasses : [], 
  } 
  for(let j=i+2; j<i+11; j++){
    presets[title]['bandpasses'].push( lines[j].split("=")[1]);
  } 
}


function menu(){
  return "<select oninput=presetPick>" + Object.keys(presets).map(name=>`<option value='${name}'>${name}</option>`).join("");
}

const freq=[31.25f, 62.5f, 125,  250,  500, 1000,   2000,  4000, 8000, 16000];
function biquadFilters(item){
  return preseets[name].bandpasses.map(b=>{
  });
}

console.log(presets,menu());
