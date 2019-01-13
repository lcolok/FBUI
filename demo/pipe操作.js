var request = require('request');
var axios = require('axios');
var fs = require('fs');


async function getToken() {
    var resp = await getDiscussion('BIqrOzKiVEoPs8ke');
    return resp[0];
}

var shimoCookie = "shimo_sid=s:UmcqxgbtanN5R-yaheURrLnKpXDD9xlg.jn9p7u5voFG4bsuGZkiBvbURLOACUeoRMrARh3+B5Qs;";

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

    const [resp, error] = await axios({
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

void (async () => {
    var token = await getToken();
    console.log(token);
    var resp = await request.post('https://uploader.shimo.im/upload2', {
        form: {
            'server': 'qiniu',
            'type': 'attachments',
            'accessToken': token,
            'file': "hahhaah"
        }
    });

    console.log(resp);
})