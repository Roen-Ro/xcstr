var fs = require('fs');
var basUtil = require('./basicUtil.js');
var path = require('path');
var request = require("request");
md5 = require('js-md5');

//http://api.fanyi.baidu.com/api/trans/product/apidoc#joinFile 百度翻译api

function readstringfromfile(filepath) {
  return new Promise( (resolve, reject) => {
    fs.readFile(filepath, function(err,data){
      if(err)
          reject(err);
      else {
        let jsonStr = data.toString();//将二进制的数据转换为字符串
        var str_arr = jsonStr.split('\n');//将字符串转换为json对象
        resolve(str_arr);
      }
    });
  });
}

var salt = 'HH';
var appid = '20190712000317144';
var appkey = '5lLtp7bDi7gmgEmRkZFs';

function trans(query,from, to) {

  let sign = md5(appid+query+salt+appkey);
  let reqparas = {
    appid: appid,
    from: from,
    to: to,
    q: query,
    salt: salt,
    sign: sign
  };

  return new Promise((resolve, reject) => { 

    request({
      url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
      method: "POST",
      json: true,
      body: JSON.stringify(reqparas)
    }, (error, response, body) => {
      if(error)
        reject(error); //因为要await调用，所以都要resolve，不要reject
      else {
        resolve(body);
      }
    });

  });


}

async function dotest(filepath) {

  console.log('xxxx');
  let strs = await readstringfromfile(filepath);
  console.log(strs.length);

  for (let s of strs) {
    if(s.charAt(0) == '\"') {
      let r = await trans(s,'zh','en');
      console.log(s +' res: ' + JSON.stringify(r));
    }
    
  }

  //  strs.forEach( (s, i) => {
  //   if(s.charAt(0) == '\"') {
  //     //awaite 不起作用
  //     let r = await trans(s,'zh','en');
  //     console.log(r);
  //   }
  //  });
}

module.exports.dotest = dotest;