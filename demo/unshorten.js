var request = require('request');

var uri = 't.cn/EbG7i5v';

expand(uri);

function expand(uri){
  if(!uri.match("http")){
    uri = "https://"+uri;
  }
  request(
    {
      uri: uri,
      followRedirect: false,
    },
    function(err, httpResponse) {
      if (err) {
        return console.error(err)
      }else{

        var expandedURL = httpResponse.headers.location;
        if(expandedURL){
          console.log(expandedURL);
          try{
            expand(expandedURL);
          }catch(e){
            console.error(e);
          }
        }else{
          console.log("Done!");
        }
      }
      
    }
  )
}

