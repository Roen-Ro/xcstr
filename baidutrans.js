var fs = require('fs');
var basUtil = require('./basicUtil.js');
var path = require('path');
var request = require("request");
md5 = require('js-md5');

//http://api.fanyi.baidu.com/api/trans/product/apidoc#joinFile 百度翻译api

function trans(query,from, to, callback) {

  let salt = 'HH';
  let appid = '20190712000317144';
  let appkey = '5lLtp7bDi7gmgEmRkZFs';
  let sign = md5(appid+query+salt+appkey);
  let reqparas = {
    appid: appid,
    from: from,
    to: to,
    q: query,
    salt: salt,
    sign: sign
  };

  console.log(JSON.stringify(reqparas)+'\n');

  request({
    url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    method: "POST",
    json: true,
    body: JSON.stringify(reqparas)
  }, callback);
}

function dotest() {
  trans('apple','en','zh', (error, response, body) => {
    if(error)
      console.error(error.message);
    else {
    //  console.log('RESPONSE: '+ JSON.stringify(response) +'\n');
      console.log('body: ' + JSON.stringify(body));
    }
  });
}

module.exports.dotest = dotest;