self.onmessage = function(e) {
    if(e.data.url){
        this.postMessage("gotdata")
    }
  };