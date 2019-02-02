var request = require('request');
var axios = require('axios');
const Qs = require("qs");
var fs = require('fs');

const shimoCookie = "shimo_sid=s:UmcqxgbtanN5R-yaheURrLnKpXDD9xlg.jn9p7u5voFG4bsuGZkiBvbURLOACUeoRMrARh3+B5Qs;";

const headers = {
    "Accept": "*/*",
    "Accept-Encoding": "br, gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Referer": "https://shimo.im/docs/K8CWmBMqMtYYpU1f",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.1 Safari/605.1.15",
    "X-CSRF-Token": "JDvV3azC-fmyRaI4kR98csJiXEhmprm78WMw",
    "Cookie": shimoCookie + "_csrf=q4MNRquXrxATGBLCwExHVcIs;"
}

async function getToken() {
    var resp = await getDiscussion('BIqrOzKiVEoPs8ke');
    return resp[0];
}

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


async function getDiscussion(fileID) {
    var content, list;
    var contentList = [];


    const [resp, error] = await http({
        method: "get",
        url: `https://shimo.im/smapi/files/${fileID}/discussions?limit=99999999`,
        headers: headers,
    })
    if (error) {
        return console.log("getDiscussion请求出错: " + error);
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

async function uploadShimo(src) {
    var token = await getToken();
    console.log("拿到石墨评论中的Token:  " + token);

    var data = fs.createReadStream(src);
    var size = fs.lstatSync(src).size;
    console.info(size);

    const r = request.post({
        url: 'https://uploader.shimo.im/upload2',
        // header: headers,
    }, function optionalCallback(err, httpResponse, body) {
        console.log(body);
    })
    const form = r.form();
    form.append('server', 'qiniu');
    form.append('type', 'attachments');
    form.append('accessToken', token);
    // form.append('file', fs.createReadStream('demo/demo.jpg'), {filename: 'unicycle.jpg'});//这个可以强制改名字
    form.append('file', data);
    
    var start = new Date();
    var interval = setInterval(() => {

        var uploaded = r.req.connection._bytesDispatched;
        var mb = uploaded/(1024*1024);
        var percent = (uploaded / size * 100).toFixed(0);
        if (percent == 100) {
            clearInterval(interval);
        }

        prev = percent;
        var end = new Date();
        var duration = (end-start)/1000;
        var speed = mb/duration;
        console.log(`Uploaded: ${mb.toFixed(2)} MB; Progress: ${percent}%; Upload_Speed: ${speed.toFixed(2)} MB/s`);

    }, 500);

}

function download(url) {
    var file = request
        .get(url)
        .on('error', function (err) {
            console.log(err)
        }).pipe(fs.createWriteStream(`/Users/seisakubu/Downloads/demo.mov`))
}

void (async () => {
    uploadShimo('demo/カサネテク- 女孩聯誼必勝招式歌曲 (完美版中文字幕)Full Ver..mp4');
    // download('https://t.cn/E5knY0Y');

})();