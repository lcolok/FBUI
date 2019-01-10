
var AV = require('leancloud-storage');
var axios = require('axios');
const Qs = require("qs");
var fs = require('fs');
var request = require('request');
var FormData = require('form-data');


var key = "";

// 初始化存储 SDK
AV.init({
  appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
  appKey: 'vLplaY3j4OYf3e6e603sb0JX',
});

var ShimoBed = AV.Object.extend('ShimoBed');

async function tryCatch(promise) {
  try {
    const ret = await promise
    return [ret, null]
  } catch (e) {
    return [null, e]
  }
}

function http(config) {
  return tryCatch(
    axios.create({
      // timeout: 1500,
      transformRequest: [data => Qs.stringify(data)]
    })(config)
  )
}

var newDiscussionID = "K8CWmBMqMtYYpU1f";
var getAttachmentID = "K8CWmBMqMtYYpU1f";
var shimoCookie = "shimo_sid=s:UmcqxgbtanN5R-yaheURrLnKpXDD9xlg.jn9p7u5voFG4bsuGZkiBvbURLOACUeoRMrARh3+B5Qs;";
var genericHeaders = {//一定要填充这个请求头才能规避那个频次过高的检测
  "Accept": "application/vnd.shimo.v2+json",
  "Accept-Encoding": "br, gzip, deflate",
  "Accept-Language": "zh-cn",
  "Authorization": "Bearer 62cbbe058449d3db514c7aece09afe0c13d0e501ed07624478704405d6cef617200823a164c086b87153edbba7acabcbc78c475c53a19a89df10cc2f872855a8",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16B92",
  'Cookie': shimoCookie
};




function KB2GB(KB) {
  return (KB / (1024 * 1024 * 1024)).toFixed(2);
}

async function getDiscussion(fileID) {
  var content, list;
  var contentList = [];
  var headers = {
    "Accept": "*/*",
    "Accept-Encoding": "br, gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Referer": "https://shimo.im/docs/K8CWmBMqMtYYpU1f",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.1 Safari/605.1.15",
    "X-CSRF-Token": "JDvV3azC-fmyRaI4kR98csJiXEhmprm78WMw",
    "Cookie": shimoCookie + "_csrf=q4MNRquXrxATGBLCwExHVcIs;"
  }

  const [resp, error] = await http({
    method: "get",
    url: `https://shimo.im/smapi/files/${fileID}/discussions?limit=99999999`,
    headers: headers,
  })
  if (error) {
    return console.log("getDiscussion请求出错: " + err);
  }
  // console.log("getDiscussion请求成功");

  var list = resp.data.data.list;

  for (var i in list) {
    var item = list[i];
    contentList.push(item.data.content);
  }
  // console.log(contentList);

  //contentList.reverse();//顺序倒过来，正常来说最新的内容在最上面
  //console.log(contentList.join("\n"));
  return contentList;
}

async function getAttachment(fileID) {
  //var origUrl = "https://api.shimo.im/files/" + fileID + "?contentUrl=true";
  //var origResp = UrlFetchApp.fetch(origUrl);
  //var contentUrl = JSON.parse(origResp).contentUrl;
  //console.log(contentUrl);


  var url = "https://api.shimo.im/files/" + fileID + "?content=true";
  const [resp, error] = await http({
    method: "get",
    url: url,
    headers: genericHeaders,
  })
  if (error) {
    return console.log("getAttachment请求出错: " + err);
  }
  // console.log("getAttachment请求成功 ");



  var attachmentsList = [];
  var orig = resp.data.content;
  orig = JSON.parse(orig);

  for (var i = 0; i < orig.length; i++) {
    var attachment = orig[i][1].attachment;
    if (attachment) {
      attachmentsList.push(attachment);
      // var name = attachment.name;
      // var url = attachment.url;
    }
  }

  // console.log(attachmentsList);

  return attachmentsList;
}


async function postDiscussion(fileID, content) {


  const [resp, error] = await http({
    method: "post",
    url: "https://shimo.im/smapi/files/" + fileID + "/discussions",
    headers: {
      "Cookie": shimoCookie,
    },
    data: {
      'content': content
    },
  })
  if (error) {
    return console.log("Discussion请求出错: " + err);
  };

  if (resp.data.code !== 0) {
    console.log('讨论上传失败，错误信息：『' + resp.message + '』\n' + "详情请查看：" + "https://shimo.im/docs/" + fileID);
    return "error";
  } else {
    return "success"
  }


}



async function shortenURL(input) {

  var longURL = input.match(/[a-zA-z]+:\/\/[^\s]*/g);

  for (i = 0; i < longURL.length; i++) {
    var url = 'http://api.weibo.com/2/short_url/shorten.json?source=2849184197&url_long=' + encodeURIComponent(longURL[i]);
    var response = await axios.get(url);
    var json = response.data;
    var shortURL = json['urls'][0]["url_short"];
    var input = input.replace(longURL[i], shortURL);
  }
  // console.log(clearHTTP);
  return input;
}

function cutHTTP(input) {
  return input.replace(/[a-zA-z]+:\/\//g, '');
}

async function googleTranslateByPost(orig) {

  var sl = 'auto';
  var tl = 'zh-CN';
  try {
    var response = await axios({
      method: 'POST',
      url: "http://translate.google.cn/translate_a/single",
      params: { "dt": "t", "q": orig, "tl": tl, "ie": "UTF-8", "sl": sl, "client": "ia", "dj": "1" },
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "br, gzip, deflate",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": "NID=154=Vf6msfWVov9Icm1WMYfq3dQ3BGHUlq6Txh5RHjnBtN48ZIZAdE_iQjxrrOMsOhbRlXXHtReYEm1rRKGUD3WsP1DhA0sO0nDf5S-J69qEBYRzIAY8nd1cE20wAKOr3cXxxPgwN12Dc5ly07v-F7RY-6Uv3ldkWGYeXWTgwkPR6Cs",
        "Host": "translate.google.cn",
        "User-Agent": "GoogleTranslate/5.26.59113 (iPhone; iOS 12.1; zh_CN; iPhone10,3)"
      }
    });

    var i;
    var output = '';
    var trans = response.data.sentences;
    if (trans.length > 1) {
      for (i = 0; i < trans.length; ++i) {
        output += trans[i]['trans'] + '\n';
      }
    }
    else {
      output = trans[0]['trans'];
    }
    console.log("谷歌翻译成功结果：" + output);
    return output;
  } catch (e) {
    console.log("谷歌翻译失败");
    return orig;
  }

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

function addItem(dic) {

  var file = new ShimoBed();

  file.set('type', dic.type);
  file.set('name', dic.name);
  file.set('name_trans', dic.name_trans);
  file.set('size', dic.size);
  file.set('shortURL', dic.shortURL);
  file.set('uploaderURL', dic.uploaderURL);
  file.set('longURL', dic.longURL);
  // file.set('owner', AV.User.current());
  file.save().then(function () {
    console.log("已上传到LeanCloud");
  }, function (error) {
    console.log(JSON.stringify(error));
  });
};


async function update(newDiscussionID, getAttachmentID) {//更新上传专用的石墨文档的项目是否与评论区同步
  var joinList, realName, name, attachment, attachmentsList, content, dic;
  var result = [];
  var sumSize = 0;
  var count = 0;
  var list = await getDiscussion(newDiscussionID);//post评论区的文档
  var total = list.length;


  attachmentsList = await getAttachment(getAttachmentID);//get附件的文档
  if (list.length != 0) {//检测评论区目标是否一条评论都没有
    joinList = list.join("\n");
  } else {
    joinList = "";
  }

  for (var j in list) {
    if ((list[j]).match("size")) {
      sumSize += Number(JSON.parse(list[j]).size);
    }
  }

  for (var i in attachmentsList) {

    var attachment = attachmentsList[i];
    var realName = attachment.name.split(".");
    var name = realName[0];


    if (joinList.match(attachment.url)) {//查重检测
      // console.log("跳过重复文件:"+attachment.name);
      continue;
    }

    var shortURL = await shortenURL(attachment.url);

    dic = {
      type: realName[1],
      name: name,
      shortURL: shortURL,
      name_trans: await googleTranslateByPost(name.toLowerCase()),
      size: attachment.size,
      uploaderURL: attachment.url
    };

    content = JSON.stringify(dic);


    postDiscussion(newDiscussionID, content);//上传到评论区

    addItem(dic);//上传到leancloud的数据储存

    var output = `${emoji(dic.type)} ${dic.name} | ${cutHTTP(shortURL)}`;//输出到控制台



    result.push(output);
  }

  var count = result.length;
  if (count != 0) {
    console.log("共增加" + count + "个新项目" + "，已上传 " + (total + count) + " 个文件，累计 " + KB2GB(sumSize) + " GB");
    console.log('\n' + result.join('\n') + '\n');
  } else {
    console.log("已上传 " + total + " 个文件，累计 " + KB2GB(sumSize) + " GB");
  }

  //newRevert(getAttachmentID,dataHistoryID);//更新完成后，马上清空「上传专用」文档，清零作用
}

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


async function download(url) {
  var resp = await axios({
    method: 'get',
    url: url,
    onDownloadProgress: function (progressEvent) {
      console.log(progressEvent);
      // 对原生进度事件的处理
    },
  })
  return resp;
}

async function upload() {

  var file = fs.createReadStream('demo.jpg');
  // console.log(file);
  var token = await getToken();
  // console.log(token);

  var form = new FormData();
  form.append('server', 'qiniu');
  form.append('type', 'attachments');
  form.append('accessToken', token);
  form.append('file', file);

  var formData = {
    'server': 'qiniu',
    'type': 'attachments',
    'accessToken': await getToken(),
    'file': form
  };
  axios({
    url: 'https://uploader.shimo.im/upload2',
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "br, gzip, deflate",
      "Accept-Language": "zh-cn",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Content-Type": "multipart/form-data",
      "Origin": "https://shimo.im",
      "Referer": "https://shimo.im/docs/nCDwJ8FpCjUfwCAk",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.1 Safari/605.1.15",
      "X-Requested-With": "XMLHttpRequest",
    },
    data: Qs.stringify(form)
  }).then(res => {
    console.log(res.response.data);
  }).catch(err => {
    console.log(err.response.data);
  });

}

async function getTokenRaw() {
  var options = {
    url: 'https://shimo.im/api/upload/token',
    method: 'post',
    headers: {
      Cookie: shimoCookie
    }
  }
  var resp = await axios(options);
  var token = resp.data.data.accessToken;
  console.log(token);
  return token;
}

async function getToken() {
  var resp = await getDiscussion('BIqrOzKiVEoPs8ke');
  return resp[0];
}


async function shimoSync() {
  update(newDiscussionID, getAttachmentID);
  if(!key){return};
  var result = await searchLC(key);
  console.log("找到了 " + result.length + " 个文件.");
  console.log('\n' + result.join('\n') + '\n');
}

void (async () => {

  await shimoSync();

  // download("http://t.cn/EG81H9v");

  // var token = await getTokenRaw();





  // var url = 'https://cdn.dribbble.com/users/61921/screenshots/3675278/colourful-boxes.png';
  // var blob = await download(url);

  // await upload();

  // googleTranslateByPost("hello");
  // postDiscussion(newDiscussionID, "123213213213");
  // shortenURL("https://www.kancloud.cn/yunye/axios/234845");
})();
