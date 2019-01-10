var AV = require('leancloud-storage');
var axios = require('axios');
const Qs = require("qs");

// 初始化存储 SDK
AV.init({
    appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
    appKey: 'vLplaY3j4OYf3e6e603sb0JX',
});


var key = "SVIP";



void (async () => {
    var result = await searchLC(key);
    console.log("找到了 " + result.length + " 个文件.");
    console.log(result);
})();



async function searchLC(key) {
    var query = new AV.SearchQuery('ShimoBed');//class名
    query.queryString(key);//要搜索的关键词
    var resp = await query.find();

    //    console.log("找到了 " + query.hits() + " 个文件.");
    var result = [];

    resp.forEach(e => {

        var dic = e.attributes;

        // var output = `${dic.type} ${dic.name} | ${dic.shortURL}`;
        var output = `${emoji(dic.type)} ${dic.name} | ${cutHTTP(dic.shortURL)}`;

        if (!result.join().match(output)) {//去除重复项目
            result.push(output);
        }

    });

    return result;
}



function emoji(suffix) {
    var emoji;

    if (suffix.match(/[a-zA-Z]/g)) {
        if (suffix.match(/mp4|mov|avi/ig)) {//根据后缀给出emoji
            emoji = "🎬";//常规视频文件
        } else if (suffix.match(/webm|mkv|avi/ig)) {
            emoji = "▶️";//手机无法播放的非常规视频文件
        } else if (suffix.match(/mp3|ogg|wav|flac|ape|alca|aac/ig)) {
            emoji = "🎵";//音频文件
        } else if (suffix.match(/zip|7z|rar/ig)) {
            emoji = "📦";//压缩包
        } else if (suffix.match(/dmg|iso/ig)) {
            emoji = "💽";//光盘映像
        } else if (suffix.match(/ai|psd|aep/ig)) {
            emoji = "📐";//工程文件
        } else if (suffix.match(/ppt|pptx|key/ig)) {
            emoji = "📽️";//演示文件
        } else if (suffix.match(/ttf|otf/ig)) {
            emoji = "🔤️";//字体文件
        } else if (suffix.match(/doc|pdf/ig)) {
            emoji = "️📄";//文档
        } else {
            emoji = "❓";//未知格式
        }
    } else {
        emoji = suffix;
    }
    return emoji;
}

function cutHTTP(shortURL) {
    return shortURL;
    //    return 't.cn/'+shortURL.split('/').pop();
}

module.exports={
    search:searchLC
}