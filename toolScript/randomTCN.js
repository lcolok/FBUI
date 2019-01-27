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
    //计算t.cn编码的香农信息熵
    var suffix = cutShortURL.split('/').pop();
    var shannonEntropy = entropy(suffix);
    //上传到LC 
    var randomTCN = AV.Object.extend('randomTCN');
    var file = new randomTCN();
    file.set('shortURL', cutShortURL);
    file.set('shannonEntropy', shannonEntropy);
    file.save().then(function () {
        console.log("已上传到LeanCloud");
    }, function (error) {
        console.log(JSON.stringify(error));
    });
    return cutShortURL;
}


// Create a dictionary of character frequencies and iterate over it.(创建一个字符频率字典并迭代它)
function process(s, evaluator) {
    var h = Object.create(null), k;
    s.split('').forEach(function (c) {
        h[c] && h[c]++ || (h[c] = 1);
    });
    if (evaluator) for (k in h) evaluator(k, h[k]);
    return h;
};

// Measure the entropy of a string in bits per symbol.(以字符串位数测量字符串的熵)
function entropy(s) {
    var sum = 0, len = s.length;
    process(s, function (k, f) {
        var p = f / len;
        sum -= p * Math.log(p) / Math.log(2);
    });
    console.log(`"${s}"的香农信息熵:${sum}`)
    return sum;
};


function check() {
    var query = new AV.Query('randomTCN');
    query.limit(1000);//请求数量上限为1000条
    query.find().then(function (every) {
        console.log("总数:" + every.length);
        every.forEach(function (each) {//each.attributes
            if (!each.attributes.shannonEntropy) {
                // console.log(`ID号为"${each.id}"缺失了香农信息熵`);
                query.get(each.id).then(function (data) {
                    // 成功获得实例
                    // console.info(data);
                    var suffix = each.attributes.shortURL.split('/').pop();
                    var shannonEntropy = entropy(suffix);
                    each.set('shannonEntropy', shannonEntropy);
                    each.save().then(function () {
                        console.log("已上传到LeanCloud");
                    }, function (error) {
                        console.log(JSON.stringify(error));
                    });
                }, function (error) {
                    // 异常处理
                });
            }
        });

    }).then(function () {
        // 更新成功
    }, function (error) {
        // 异常处理
    });

}

void (async () => {

    getShortURL();
    check();
})();

// return getShortURL();






