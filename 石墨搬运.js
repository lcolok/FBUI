var AV = require('leancloud-storage');
var http = require('request');
// var Promise = require('es6-promise').Promise;
var rp = require('request-promise');

// 初始化存储 SDK
AV.init({
    appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
    appKey: 'vLplaY3j4OYf3e6e603sb0JX',
});

var ShimoBed = AV.Object.extend('ShimoBed');

var type = "🎬";
var title = "电信ch直播测试";
var shortURL = "t.cn/E4Mgz5Q";
var longURL = expandURL(shortURL);


addItem();

function addItem() {
    var product = new ShimoBed();
    product.set('type', type);
    product.set('title', title);
    product.set('shortURL', shortURL);
    // product.set('longURL', longURL);
    // product.set('owner', AV.User.current());
    product.save().then(function () {

    }, function (error) {
        alert(JSON.stringify(error));
    });
};

async function expandURL(uri) {
    uri = uri.match(/((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/gm)[0];

    if (!uri.match('http')) {
        uri = 'https://' + uri;
    }

    var newLongURL = await http(
        {
            uri: uri,
            followRedirect: false,
        },
        async function (err, httpResponse) {
            if (err) {
                return console.error(err);
            }
            console.log(httpResponse.headers.location || uri);
            return httpResponse.headers.location;
        }
    )
    
    return newLongURL
}