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

    console.log(url);
    //官网上说的post请求无效，一定要get请求才行
    request( url, (error, response, body) => {
      if(error)
        reject(error); //因为要await调用，所以都要resolve，不要reject
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

    //中文
    // let en_trans = await trans_strs(strs, 'en', 'zh');
    // let enfile =  path.resolve(filepath, '../xcstr-en-zh.strings');
    // write_lines(en_trans,enfile);

    //法语
    let fre_trans = await trans_strs(strs, 'en', 'fra');
    let frefile =  path.resolve(filepath, '../xcstr-en-fre.strings');
    write_lines(fre_trans,frefile);

    //西语
    let es_trans = await trans_strs(strs, 'en', 'spa');
    let esfile =  path.resolve(filepath, '../xcstr-en-es.strings');
    write_lines(es_trans,esfile);

    //德语
    let de_trans = await trans_strs(strs, 'en', 'de');
    let defile =  path.resolve(filepath, '../xcstr-en-de.strings');
    write_lines(de_trans,defile);

    //葡语
    let pt_trans = await trans_strs(strs, 'en', 'pt');
    let ptfile =  path.resolve(filepath, '../xcstr-en-pt.strings');
    write_lines(pt_trans,ptfile);

    //日语
    let jp_trans = await trans_strs(strs, 'en', 'jp');
    let jpfile =  path.resolve(filepath, '../xcstr-en-jp.strings');
    write_lines(jp_trans,jpfile);

    //韩语
    let ko_trans = await trans_strs(strs, 'en', 'kor');
    let kofile =  path.resolve(filepath, '../xcstr-en-ko.strings');
    write_lines(ko_trans,kofile);

    //阿拉伯语
    let ar_trans = await trans_strs(strs, 'en', 'ara');
    let arfile =  path.resolve(filepath, '../xcstr-en-ar.strings');
    write_lines(ar_trans,arfile);

    //意大利语
    let it_trans = await trans_strs(strs, 'en', 'it');
    let itfile =  path.resolve(filepath, '../xcstr-en-it.strings');
    write_lines(it_trans,itfile); 

    //俄语
    let ru_trans = await trans_strs(strs, 'en', 'ru');
    let rufile =  path.resolve(filepath, '../xcstr-en-ru.strings');
    write_lines(ru_trans,rufile); 

    //越南语
    let vi_trans = await trans_strs(strs, 'en', 'vie');
    let vifile =  path.resolve(filepath, '../xcstr-en-vi.strings');
    write_lines(vi_trans,vifile); 

    //泰语
    let th_trans = await trans_strs(strs, 'en', 'th');
    let thfile =  path.resolve(filepath, '../xcstr-en-th.strings');
    write_lines(th_trans,thfile); 

    //荷兰语
    let nl_trans = await trans_strs(strs, 'en', 'nl');
    let nlfile =  path.resolve(filepath, '../xcstr-en-nl.strings');
    write_lines(nl_trans,nlfile); 
  

}

async function trans_strs(strings, from, to) {

  let newstrs = [];
  for(let i=0; i<strings.length; i++) {
    let s = strings[i];
    if(s.charAt(0) == '\"') {
      let c = s.split("=")[0]; //对 "Hello" = "你好"; 这样数据做提取，提取 "="前的字符
      c = c.trim();
      c = c.substr(1,c.length-2); //去掉双引号

      let s0 = replace_formatted_string(c)
      let r = await trans(s0,from, to);
      r = JSON.parse(r)
      if(!r.error_code || r.error_code == 52000 ) //成功
       { 
          let trans = r.trans_result[0].dst;
          if(s0 != c)
            trans = resume_formatted_string(trans);

          let s1 = '\"' + c + '\" = \"' + trans + '\";';
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