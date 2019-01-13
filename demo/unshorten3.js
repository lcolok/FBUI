var request = require('request');

var uri = 't.cn/EbG7i5v';

expand(uri);

async function expand(uri){
  if(!uri.match("http")){
    uri = "https://"+uri;
  }
  var resp = await request(
    {
      uri: uri,
      followRedirect: false,
    },
    async function(err, httpResponse) {
    return httpResponse.headers.location;
    }
  );
  console.log(resp);
}



var content = "";
async.forEachLimit(data, 1, function(index, callback) { //The second argument (callback) is the "task callback" for a specific index
    http.request(urlEntity, function(res){
      res.on("data", function(data) {
        content += data;
      });
    }); // This way async knows which index in data have finished
}, function(err) {
    if (err) return next(err);
    //Respond the user about the content when they're all done.
    res.json({
        success: true,
        message: content
    });
});