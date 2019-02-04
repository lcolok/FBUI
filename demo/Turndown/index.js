const TurndownService = require('turndown');
const request = require('request');
const axios = require('axios');
const JSDOM = require('jsdom').JSDOM;
const Readability = require("./Readability");
const fs = require("fs");
const cheerio = require('cheerio');

var read = require('node-readability');


var url = "https://www.jianshu.com/p/629a81b4e013";

/* axios.get(url).then(function (resp) {
    // console.log(resp.data);
    var doc = new JSDOM(resp.data);
    let reader = new Readability(doc.window.document);
    let article = reader.parse();
    // console.log(article);
    fs.writeFile('demo/Turndown/demo.html', article.content, (err) => {
        if (err) throw err;
        console.log('html已保存');
    });
    importMD(article);
}) */


read(url, function (err, article, meta) {
    // console.log(article.html);

    var $ = cheerio.load(article.html);
    article.realTitle = $("title").text();//通过这种方式获得的标题才是最准确的标题

    fs.writeFile('demo/Turndown/demo.html', article.content, (err) => {
        if (err) throw err;
        console.log('html已保存');
    });
    importMD(article);
    /*     // Main Article
        console.log(article.content);
        // Title
        console.log(article.title);
    
        // HTML Source Code
        console.log(article.html);
        // DOM
        console.log(article.document);
    
        // Response Object from Request Lib
        console.log(meta);
    
        // Close article to clean up jsdom and prevent leaks */
    article.close();
});

async function importMD(article) {

    var content = article.content.toString();

    content = content.replace(/data-src/gm, 'src');//微信公众号的文章图片的src会写成data-src,因此turndown并不能识别这个label,进而会错误地砍掉图片部分

    var turndownService = new TurndownService();

    var markdown = turndownService.turndown(content);


    // console.log(markdown);

    var data = markdown;

    // var data = await fs.readFileSync('demo/Turndown/石墨测试.md', 'utf8', (err, data) => {
    //     if (err) throw err;
    //     console.log(data);
    //   });

    const r = request.post({
        url: 'https://shimo.im/lizard-api/files/import',
        gzip: true,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "br, gzip, deflate",
            "Accept-Language": "zh-cn",
            "Authorization": "Bearer 62cbbe058449d3db514c7aece09afe0c13d0e501ed07624478704405d6cef617200823a164c086b87153edbba7acabcbc78c475c53a19a89df10cc2f872855a8",
            "Connection": "keep-alive",
            "Content-Type": "multipart/form-data; charset=utf-8; boundary=RNFetchBlob-2139620256",
            "Cookie": "sensorsdata2015jssdkcross=%22%7B%7D%22",
            "Expect": "100-continue",
            "Host": "shimo.im",
            "User-Agent": "shimo/6042 CFNetwork/976 Darwin/18.2.0",
        }
    }, function optionalCallback(err, response, body) {
        // console.log(response.headers);
        console.log(`https://shimo.im` + JSON.parse(body).url);
    });
    const form = r.form();
    form.append('file', data, 'filename.md');//一定要保持md这个后缀,才能被识别
    form.append('name', article.realTitle);
    form.append('type', 'newdoc');
    form.append('parentId', 'SX3sphXKfvofOdRb');//文件夹ID


    // form.append('file', fs.createReadStream('demo/demo.jpg'), {filename: 'unicycle.jpg'});//这个可以强制改名字

}


async function RNimportMD(article) {

    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(article.content)

    // console.log(markdown);
    RNFetchBlob.fetch('POST', 'https://shimo.im/lizard-api/files/import', {
        Authorization: "Bearer 62cbbe058449d3db514c7aece09afe0c13d0e501ed07624478704405d6cef617200823a164c086b87153edbba7acabcbc78c475c53a19a89df10cc2f872855a8",
        otherHeader: "foo",
        'Content-Type': 'multipart/form-data',
    },
        {
            name: article.title,
            parentId: 'SX3sphXKfvofOdRb',
            type: 'newdoc',
            file: JSON.stringify({
                data: markdown,
                type: 'text/markdown'
            })
        },
    ).then((resp) => {
        console.log(resp);
    }).catch((err) => {
        // ...
    })
}
