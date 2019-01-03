var AV = require('leancloud-storage');
var axios = require('axios');
const Qs = require("qs");

async function tryCatch(promise) {
  try {
    const ret = await promise
    return [ret, null]
  } catch (e) {
    return [null, e]
  }
}

function httpRedirect(config) {
  return tryCatch(
    axios.create({
      // timeout: 1500,
      maxRedirects: 0,
      inCharset:'UTF-8',
      outCharset:'UTF-8',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      transformRequest: [data => Qs.stringify(data)]
    })(config)
  )
}

function http(config) {
    return tryCatch(
      axios.create({
        // timeout: 1500,
        transformRequest: [data => Qs.stringify(data)]
      })(config)
    )
  }
  

async function expand(url) {
  const [res, error] = await httpRedirect({
    method: "get",
    url: url,
  })
  if (error) {
    return error.response.headers.location
  };
}


// 初始化存储 SDK
AV.init({
    appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
    appKey: 'vLplaY3j4OYf3e6e603sb0JX',
});

var ShimoBed = AV.Object.extend('ShimoBed');

var type = "🎬";
var title = "电信ch直播测试";
var shortURL = "t.cn/E4Mgz5Q";

var key = "足球";



void(async()=>{
    const [res, error] = await http({
        method: "get",
        url: 'https://shimo.im/smapi/files/K8CWmBMqMtYYpU1f/discussions?limit=99999999',
      })
      if (error) {
        return console.log("请求出错: " + err);
      }
      console.log("请求成功: " + res);
      
      getOrig(res);
})();


async function getOrig(response){
    var list = response.data.data.list;

    for(var i in list){
        var item = list[i];
        var dic = JSON.parse(item.data.content);
        //  console.log(dic);
        var shortURL = dic.shortURL;
        delete dic.shortURL;
    
        shortURL = shortURL.match(/((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/gm)[0];
    
        if (!shortURL.match('http')) {
            shortURL = 'https://' + shortURL;
        }
    
        var uploaderURL = await expand(shortURL);
        // console.log(uploaderURL);
        var shimoURL = await expand(uploaderURL);
        // console.log(shimoURL);
        var longURL = shimoURL.split('?').shift();
        // console.log(longURL);
        var fileType = longURL.split('/').pop().split('.').pop();
        // console.log(fileType);
    
        dic.type = fileType;
        dic.shortURL = shortURL;
        dic.uploaderURL = uploaderURL;
        dic.longURL = longURL;
        console.log(dic);
        addItem(dic);
    }

}



function addItem(dic) {
    var file = new ShimoBed();

    file.set('type', dic.type);
    file.set('name', dic.name);
    file.set('name_trans', dic.name_trans);
    file.set('size',dic.size);
    file.set('shortURL', dic.shortURL);
    file.set('uploaderURL', dic.uploaderURL);
    file.set('longURL', dic.longURL);
    // file.set('owner', AV.User.current());
    file.save().then(function () {

    }, function (error) {
        alert(JSON.stringify(error));
    });
};
function search(response){

    var list = response.data.data.list;
    var result = [];

    
    var contentList = [];
    for(var i = 0;i<list.length;i++){
    
      var id = list[i].id;
      var content = list[i].data.content;
      var unixus = list[i].unixus;
     
      
      contentList.push({'content':content,'id':id,'unixus':unixus});
      
        var item = JSON.parse(content);
        var output = emoji(item.type)+' '+item.name+' | '+item.shortURL;
        var dic = emoji(item.type)+item.name+item.name_trans;
        dic = dic.toLowerCase();
        key = key.toLowerCase();
        if(dic.match(key)){
          if(!result.join().match(output)){//去除重复项目

            result.push(output);
          }
        }
      }
    console.log(result);
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

