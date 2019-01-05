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
    //   inCharset:'UTF-8',
    //   outCharset:'UTF-8',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    //   },
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
      
      var all='';

      var query = new AV.Query('ShimoBed');
      query.select('shortURL');
      query.limit(1000);//请求数量上限为1000条
      query.find().then(function (every) {

          console.log("总数:"+every.length);
          every.forEach(function(each) {
              all +=  each.attributes.shortURL.split('/').pop()+'\n';
              
        });


        getOrig(res,all);

      }).then(function(todos) {
        // 更新成功
      }, function (error) {
        // 异常处理
      });

     
})();


async function checkSame(dic,all){
    var shortURL = dic.shortURL;
    
    if(!shortURL.match('t.cn/')){
        return console.log("不符合短链标准:"+shortURL)
    }
    var key = shortURL.split('/').pop();

    if(all.match(key)){
        console.log('跳过重复上传:'+dic.name)
    }else{//没检查到有重复
        await handleDic(dic);
    }

    // var query = new AV.SearchQuery('ShimoBed');//class名
    //  query.queryString(key);//要搜索的关键词
    //  query.find().then(async function(results) {
    //     if(query.hits()==0){//没检查到有重复
    //        await handleDic(dic);
    //     }else{
    //         console.log('跳过重复上传:'+dic.name)
    //     }

    //    //处理 results 结果
    //  }).catch(function(err){
    //    //处理 err
    //  });
}


function searchLC(key){
    var query = new AV.SearchQuery('ShimoBed');//class名
     query.queryString(key);//要搜索的关键词
     query.find().then(function(results) {
       console.log("找到了 " + query.hits() + " 个文件.");
       console.log(results);

       //处理 results 结果
     }).catch(function(err){
       //处理 err
     });
}

async function getOrig(response,all){
    var list = response.data.data.list;



    for(var i in list){
        var item = list[i];
        var dic = JSON.parse(item.data.content);

        await checkSame(dic,all);

    }

}

async function handleDic(dic){
    var shortURL = dic.shortURL;
    delete dic.shortURL;

    shortURL = shortURL.match(/((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/gm)[0];

    if (!shortURL.match('http')) {
        shortURL = 'https://' + shortURL;
    }

    var longURL = await expand(shortURL);
    // console.log(uploaderURL);
    if(longURL.match('uploader')){
        var uploaderURL = longURL;
        var shimoURL = await expand(longURL);
        shimoURL = shimoURL.split('?').shift();
    }else{
        var shimoURL = undefined;
    }
    // console.log(shimoURL);
    // console.log(longURL);
    try{
        var fileType = uploaderURL.split('/').pop().split('.').pop();
        dic.type = fileType;
    }catch(e){

    }

    try{
        var fileType = longURL.split('/').pop().split('.').pop();
        dic.type = fileType;
    }catch(e){

    }

    // console.log(fileType);

    dic.shortURL = shortURL;
    dic.uploaderURL = uploaderURL;
    dic.longURL = longURL;
    console.log(dic);
    addItem(dic);
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

