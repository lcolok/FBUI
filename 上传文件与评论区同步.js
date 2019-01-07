
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


async function update(newDiscussionID, getAttachmentID) {//更新上传专用的石墨文档的项目是否与评论区同步
  var joinList, realName, name, attachment, attachmentsList, content;
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



    attachment = attachmentsList[i];
    realName = attachment.name;
    name = realName.split(".");
    name.pop();
    name = name.join(".");//去掉后缀


    var name_trans = googleTranslateByPost(name.toLowerCase());
    var shortURL = shortenURL(input);
    content = JSON.stringify({ type: type, name: name, shortURL: shortURL, name_trans: name_trans, size: size });
    postDiscussion(newDiscussionID, content)



    //name = name.replace(/"/gm,/\"/);//斜杠问题的修正

  }

  if (count != 0) {
    console.log("共增加" + count + "个新项目" + "，已上传 " + (total + count) + " 个文件，累计 " + KB2GB(sumSize) + " GB");
  } else {
    console.log("已上传 " + total + " 个文件，累计 " + KB2GB(sumSize) + " GB");
  }
  //newRevert(getAttachmentID,dataHistoryID);//更新完成后，马上清空「上传专用」文档，清零作用
}

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
    url: 'https://shimo.im/smapi/files/K8CWmBMqMtYYpU1f/discussions?limit=99999999',
    headers: headers,
  })
  if (error) {
    return console.log("Discussion请求出错: " + err);
  }
  console.log("Discussion请求成功: " + resp);

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
    return console.log("Attachment请求出错: " + err);
  }
  console.log("Attachment请求成功 ");



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

  console.log(attachmentsList);

  return attachmentsList;
}


async function postDiscussion(fileID, content) {
  var list = await getDiscussion(fileID);
  joinList = list.join("\n");
  if (joinList.match(content)) {//查重检测
    return "same";
  }

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
  }
  console.log("Discussion请求成功: " + resp);



  resp = JSON.parse(resp);
  if (resp.code !== 0) {
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
  var clearHTTP = await cutHTTP(input);
  console.log(clearHTTP);
  return clearHTTP;
}

function cutHTTP(input){
  return input.replace(/[a-zA-z]+:\/\//g, ' ');
}

void (async () => {
  // update(newDiscussionID,getAttachmentID);
  // postDiscussion(newDiscussionID, "123213213213");
  shortenURL("https://www.kancloud.cn/yunye/axios/234845");
})();
