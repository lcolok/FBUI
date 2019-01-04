var axios = require('axios');

var uri = 'https://t.cn/EL0aF36';

expand(uri) 

async function expand(uri) {
  uri = uri.match(/((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/gm)[0];

  if (!uri.match('http')) {
      uri = 'https://' + uri;
  }
  axios({
    method: 'get',
    url: uri,
    maxRedirects: 0,
  }).catch(function (error) {
    var newURL = error.response.headers.location;
    console.log(newURL);

    axios({
      method: 'get',
      url: newURL,
      maxRedirects: 0,
    }).catch(function (error) {
      var longURL = error.response.headers.location;
      longURL = decodeURIComponent(longURL);
      console.log(longURL);
      
    });;

  });;



}



