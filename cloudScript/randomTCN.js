"use strict";
try {
    var axios = require('axios');
    var AV = require('leancloud-storage');
    AV.init({
        appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
        appKey: 'vLplaY3j4OYf3e6e603sb0JX',
    });
} catch (e) {

}

var LCOscore = 0;
var combinationCount = 0;

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

    for (var i = 0; i < longURL.length; i++) {
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
    var r = await getRandomStr(6);//生成随机六位不重复的string
    const origURL = 'https://lcolok.github.io/FBUI/';
    var newURL = origURL + '?r=' + r;
    var shortURL = await shortenURL(newURL);
    var cutShortURL = cutHTTP(shortURL);
    // console.log(cutShortURL);
    var suffix = cutShortURL.split('/').pop();
    //计算t.cn编码的香农信息熵
    var shannonEntropy = entropy(suffix);
    console.log(`"${suffix}"的香农信息熵:${shannonEntropy}`);
    //计算t.cn编码的LCO信息熵
    var newSE = newEntropy(suffix);
    console.log(`"${suffix}"的LCO信息熵:${newSE}`);
    //上传到LC 
    var randomTCN = AV.Object.extend('randomTCN');
    var file = new randomTCN();
    file.set('r', r);
    file.set('shortURL', cutShortURL);
    file.set('shannonEntropy', shannonEntropy);
    file.save().then(function () {
        console.log(`r:${r},短链:${cutShortURL},香农信息熵:${shannonEntropy} 已上传到LeanCloud`);
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
    return sum;
};


function continuity(s) {
    var sc = 0, arr = s.split(''), len = s.length;

    for (var i = 0; i < len; i++) {
        for (var j = 1; j < len - i; j++) {
            if (arr[i] == arr[i + j]) {
                sc = sc + j;
            } else { break; }
        }
    }
    return sc / len
}



async function meaning(s) {

    var arr = s.split(''), len = s.length;
    //列举出全部组合
    for (var i = 0; i < len; i++) {
        var letter = arr[i];
        for (var j = 1; j < len - i; j++) {
            letter = letter + arr[i + j];
            combinationCount++;
            //检查大小写
            await caseCheck(letter);
        }
    }
    console.log(`总组合数:${combinationCount}`);
    console.log(`得分为:${LCOscore}`);

    return LCOscore;
}

async function caseCheck(s) {
    if (s.match(/[^a-zA-Z]/)) {
        // console.log('包含非字母'); 
        return
    };
    var arr = s.split('');
    if (/[A-Z]/.test(arr[0])) {//首字母是大写
        if (s == s.toUpperCase()) {
            // console.log('全大写');

            await youdaoDic(s);
            return
        }
        if (s == arr.shift() + arr.join('').toLowerCase()) {
            // console.log('首字母大写');

            await youdaoDic(s);
            return
        } else {
            // console.log('参差');
            return
        }
    } else {//首字母是小写
        if (s == s.toLowerCase()) {
            // console.log('全小写');

            await youdaoDic(s);
            return
        }
    }
}

function isSameCase(a, b) {
    var boo1 = /[A-Z]/.test(a);
    var boo2 = /[A-Z]/.test(b);
    return boo1 == boo2 ? true : false;
}

function newEntropy(s) {
    var sum_1 = 0, len = s.length;
    process(s, function (k, f) {
        var p = f / len;
        sum_1 -= p * Math.log(p) / Math.log(2);
    });

    var sum_2 = continuity(s);

    var sum_3 = meaning(s);

    var sum = sum_1 - sum_2 * 2 - sum_3;

    return sum;
};


async function youdaoDic(word) {

    try {
        var resp = await axios({
            method: 'GET',
            url: "http://dict.youdao.com/jsonapi",
            params: { q: word, dicts: { "count": 2, "dicts": [["ec"], ["ugc"]] } },
        });
        var data = resp.data;
        var trArr = [];
        if (data.ugc) {
            /*             data.ec.word[0].trs.forEach(e => {
                            trArr.push(e.tr[0].l.i);
                        })
                        console.log(`👍"${word}"👍 有意义:\n${trArr.join('\n')}`);
                        return true; */
            console.log(`👍"${word}"👍 有意义:\n${data.ugc.data.content}`);
            LCOscore++;
        } else {
            // console.log(data.result.msg);
            return false;
        }
        // if (data.result.code == 200) {
        //     console.log(`👍"${word}"👍 有意义:${data.data.entries[0].explain}`)
        //     return true;
        // } else {
        //     // console.log(data.result.msg);
        //     return false;
        // }
    } catch (e) {
        console.log(e);
    }
}


/* async function youdaoDicSuggest(word) {

    try {
        var resp = await axios({
            method: 'GET',
            url: "http://dict.youdao.com/suggest",
            params: { q: word, le: 'auto', doctype: 'json' },
        });
        var data = resp.data;
        if (data.result.code == 200) {
            console.log(`👍"${word}"👍 有意义:${data.data.entries[0].explain}`)
            return true;
        } else {
            // console.log(data.result.msg);
            return false;
        }
    } catch (e) {
        console.log(e);
    }
} */


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

};

function newSearch() {
    var query = new AV.Query('ShimoBed');
    query.contains("name", "北").contains("name", "京").contains("name", "提问0114").find().then(e => {
        e.forEach(e => {

            var name = e.attributes.name;
            console.log(name);
        });

    });

    /*     var query = new AV.Query('randomTCN');
        query.contains("shortURL", "Ety").contains("shortURL", "diyf").limit(1000).find().then(e => {
            e.forEach(e => {
    
                var name = e.attributes.shortURL;
                console.log(name);
            })
    
        }); */
}

function getRandomStr(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    var query = new AV.Query('randomTCN');//验证随机生成出来的这个六位数是否与leancloud上的r有重复
    query.equalTo("r", text).find().then(e => {
        if(e.length>0){
            e.forEach(e => {
                var r = e.attributes.r;
                console.log(`已经存在相同的随机数:${r},准备重新生成`);
                text = getRandomStr(len);
            });
        }


    });

    return text;
}

void (async () => {
    // console.log(getRandomStr(6));
    getShortURL();
    // caseCheck('HELLO');
    // listAllWords('Et5ttCC');

    // check();
    // youdaoDic('function');
})();

// return getShortURL();






