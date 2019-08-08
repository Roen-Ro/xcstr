var fs = require('fs');
var basUtil = require('./basicUtil.js');
var path = require('path');
var request = require("request");
md5 = require('js-md5');

//http://api.fanyi.baidu.com/api/trans/product/apidoc#joinFile 百度翻译api

function read_lines(filepath) {
  return new Promise( (resolve, reject) => {
    fs.readFile(filepath, function(err,data){
      if(err)
          reject(err);
      else {
        let filestr = data.toString();//将二进制的数据转换为字符串
        var str_arr = filestr.split('\n');//将字符串转换为json对象
        resolve(str_arr);
      }
    });
  });
}

var salt = 'HH';
var appd = '20190712000317144';
var appky = '5lLtp7bDi7gmgEmRkZFs';

function trans(query,from, to) {


  return new Promise((resolve, reject) => { 

    let sign = md5(appd+query+salt+appky);
    let reqparas = {
      appid: appd,
      from: from,
      to: to,
      q: query,
      salt: salt,
      sign: sign
    };

    let url = 'https://fanyi-api.baidu.com/api/trans/vip/translate' +'?' + basUtil.urlform(reqparas);

  //  console.log(url);
    console.log('Query: ' + query);
    //官网上说的post请求无效，一定要get请求才行
    request( url, (error, response, body) => {
      if(error)
        resolve(null); //因为要await调用，所以都要resolve，不要reject
      else {
        resolve(body);
      }
    });

  });
}

async function dotranswork(filepath) {

  //读取strings文件，按行分割成数组
  let strs = await read_lines(filepath);
  console.log('总共读取到'+strs.length+'行字符串');

    let srcLan = 'en';
    let dir =  path.resolve(filepath, '../');
   // await trans_lines_to_file(strs, srcLan, 'kor', dir); //韩语
   // await trans_lines_to_file(strs, srcLan, 'zh', dir); //中文
    // await trans_lines_to_file(strs, srcLan, 'fra', dir); //法语
    // await trans_lines_to_file(strs, srcLan, 'spa', dir); //西班牙语
    // await trans_lines_to_file(strs, srcLan, 'de', dir); //德语
    // await trans_lines_to_file(strs, srcLan, 'pt', dir); //葡语
    // await trans_lines_to_file(strs, srcLan, 'jp', dir); //日语
    // await trans_lines_to_file(strs, srcLan, 'ara', dir); //阿拉伯语
    // await trans_lines_to_file(strs, srcLan, 'it', dir); //意大利语
    // await trans_lines_to_file(strs, srcLan, 'ru', dir); //俄语
    // await trans_lines_to_file(strs, srcLan, 'vie', dir); //越南语
    // await trans_lines_to_file(strs, srcLan, 'th', dir); //泰语
    // await trans_lines_to_file(strs, srcLan, 'nl', dir); //荷兰语
    await trans_lines_to_file(strs, srcLan, 'dan', dir); //丹麦语
}

async function trans_lines_to_file(lines, from, to, savedirectory) {

  let trans = await trans_strs(lines, from, to);
  let file =  savedirectory + '/xcstr_' + from + '_' + to + '.strings';
    write_lines(trans,file); 
}

async function trans_strs(strings, from, to) {

  let newstrs = [];
  for(let i=0; i<strings.length; i++) {
    let s = strings[i];
    if(s.charAt(0) == '\"') {
      let splt = s.split("="); //对 "Hello" = "你好"; 这样数据做提取，提取 "="前的字符
      let c0 = splt[0];
      c0 = c0.trim();
      c0 = c0.substr(1,c0.length-2); //去掉双引号
      let c1 = c0;
      if(splt.length > 0) {
        c1 = splt[1];
        c1 = c1.trim();
        c1 = c1.substr(1,c1.length-3); //去掉双引号和后面的分号
      }

      let ts_str = c0;

      let s0 = replace_formatted_string(ts_str)
      let r = await trans(s0,from, to);
      r = JSON.parse(r)
      if(!r.error_code || r.error_code == 52000 ) //成功
       { 
          let trans = r.trans_result[0].dst;
          if(s0 != ts_str)
            trans = resume_formatted_string(trans);

          let s1 = '\"' + ts_str + '\" = \"' + trans + '\";';
          newstrs[i] = s1;
          console.log(s1);
      }
      else 
          newstrs[i] = '// ' + s + ' = \"Trans Failed XXX\";';
    }
    else
        newstrs[i] = s;
  }
  return newstrs;
}


function write_lines(strings, _path) {
  let s =  '';
  for(let i in strings) {
    s += (strings[i]+'\n');
  }
  fs.writeFile(_path,s,(error) => {
    console.log(_path +' is generated');
  })
}

var format_map = [
  "%d:103",
  "%ld:1003",
  "%lld:10003",
  "%zu:9731",
  "%u:8022",
  "%z:8427",
  "%f:72.6",
  "%.1f:182.6",
  "%.2f:1802.06",
  "%.3f:18002.006",
  "%@:M-O-X-E",
  "%s:M-O-H",
  "\\\": T-H-O-U ",
  "\\\': H-O-W-Z ",
  "\\n: S-P-R-T ",
  "\\r: S-P-T-R ",
  "\\t: S-T-R-R ",
  "\\: T-H-E-U-W-Z-U "
];

function replace_formatted_string(str) {
  let s = str;
  for(let i in format_map) {
    let sps = format_map[i].split(':');
    s = s.replaceAll(sps[0],sps[1]);
  }
  return s;
}

function resume_formatted_string (str) {
  let s = str;
  for(let i in format_map) {
    let sps = format_map[i].split(':');
 //   console.log('--' + str);
    s = s.replaceAll(sps[1].trim(),sps[0]);
    s = s.replaceAll(sps[1].trim().toLowerCase(),sps[0]); //有的时候翻译后会被转换成小写
  }
  return s;
}

module.exports.dotranswork = dotranswork; 
module.exports.read_lines = read_lines;
module.exports.write_lines = write_lines;
module.exports.trans = trans;