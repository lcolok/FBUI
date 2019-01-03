const axios = require("axios");
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

void (async () => {
  var url = "https://t.cn/Ez4uZ7O";
  var resp = await expand(url);
  
  console.log(resp);
  var longURL = await expand(resp);
  console.log(longURL);
})()

async function expand(url) {
  const [res, error] = await http({
    method: "get",
    url: url,
  })
  if (error) {
    return error.response.headers.location
  };
}

module.exports = {
  http
}
