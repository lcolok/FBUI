try {
    var axios = require('axios');
    var AV = require('leancloud-storage');
    AV.init({
        appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
        appKey: 'vLplaY3j4OYf3e6e603sb0JX',
    });
} catch (e) {

}


function cutHTTP(input) {
    return input.replace(/[a-zA-z]+:\/\//g, '');
}

function randomNum() {
    var num = "";
    for (var i = 0; i < 6; i++) {
        num += Math.floor(Math.random() * 10)
    }
    return num;
}

async function shortenURL(input) {

    var longURL = input.match(/[a-zA-z]+:\/\/[^\s]*/g);

    for (i = 0; i < longURL.length; i++) {
        var url = 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long=' + encodeURIComponent(longURL[i]);
        var response = await axios.get(url);
        var json = response.data;
        var shortURL = json['urls'][0]["url_short"];
        input = input.replace(longURL[i], shortURL);
    }
    // console.log(clearHTTP);
    return input;
}

async function getShortURL() {
    var num = randomNum();
    const origURL = 'https://lcolok.github.io/FBUI/';
    var newURL = origURL + '?r=' + num;
    var shortURL = await shortenURL(newURL);
    var cutShortURL = cutHTTP(shortURL);
    console.log(cutShortURL);
    
    var randomTCN = AV.Object.extend('randomTCN');

    var file = new randomTCN();
    
    file.set('shortURL',cutShortURL);
    
    // file.set('owner', AV.User.current());
    file.save().then(function () {
        console.log("已上传到LeanCloud");
    }, function (error) {
        console.log(JSON.stringify(error));
    });
    return cutShortURL;
}
// void(async()=>{

//     getShortURL();
// })();

return getShortURL();






