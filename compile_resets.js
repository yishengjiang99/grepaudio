const fs=require('fs');
const file = fs.readFileSync('./data/eq.preset');

const lines = file.toString().split("\n")

var presets = {}
for(let i =0; i< lines.length; i+=13){
  const title = lines[i];
  presets[title] = {
    preamp: lines[i+1].split("=")[1],

    
    bandpasses : [], 
  } 
  for(let j=i+2; j<i+11; j++){
    presets[title]['bandpasses'].push( lines[j].split("=")[1]);
  } 
}

console.log(JSON.stringify(presets));
