var fs = require('fs');
var basUtil = require('./basicUtil.js');
var path = require('path');
var request = require("request");
md5 = require('js-md5');

//http://api.fanyi.baidu.com/api/trans/product/apidoc#joinFile 百度翻译api

function readstringlinesfromfile(filepath) {
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
  let strs = await readstringlinesfromfile(filepath);
  console.log('总共读取到'+strs.length+'行字符串');

    //英语
    let en_trans = await trans_strs(strs, 'zh', 'en');
    let enfile =  path.resolve(filepath, '../xcstr-zh-en.strings');
    write_strings(en_trans,enfile);
/*
    //法语
    let fre_trans = await trans_strs(strs, 'zh', 'fra');
    let frefile =  path.resolve(filepath, '../xcstr-zh-fre.strings');
    write_strings(fre_trans,frefile);

    //西语
    let es_trans = await trans_strs(strs, 'zh', 'spa');
    let esfile =  path.resolve(filepath, '../xcstr-zh-es.strings');
    write_strings(es_trans,esfile);

    //德语
    let de_trans = await trans_strs(strs, 'zh', 'de');
    let defile =  path.resolve(filepath, '../xcstr-zh-de.strings');
    write_strings(de_trans,defile);

    //葡语
    let pt_trans = await trans_strs(strs, 'zh', 'pt');
    let ptfile =  path.resolve(filepath, '../xcstr-zh-pt.strings');
    write_strings(pt_trans,ptfile);

    //日语
    let jp_trans = await trans_strs(strs, 'zh', 'jp');
    let jpfile =  path.resolve(filepath, '../xcstr-zh-jp.strings');
    write_strings(jp_trans,jpfile);

    //韩语
    let ko_trans = await trans_strs(strs, 'zh', 'kor');
    let kofile =  path.resolve(filepath, '../xcstr-zh-ko.strings');
    write_strings(ko_trans,kofile);

    //阿拉伯语
    let ar_trans = await trans_strs(strs, 'zh', 'ara');
    let arfile =  path.resolve(filepath, '../xcstr-zh-ar.strings');
    write_strings(ar_trans,arfile);

    //意大利语
    let it_trans = await trans_strs(strs, 'zh', 'it');
    let itfile =  path.resolve(filepath, '../xcstr-zh-it.strings');
    write_strings(it_trans,itfile); 

    //俄语
    let ru_trans = await trans_strs(strs, 'zh', 'ru');
    let rufile =  path.resolve(filepath, '../xcstr-zh-ru.strings');
    write_strings(ru_trans,rufile); 

    //越南语
    let vi_trans = await trans_strs(strs, 'zh', 'vie');
    let vifile =  path.resolve(filepath, '../xcstr-zh-vi.strings');
    write_strings(vi_trans,vifile); 

    //泰语
    let th_trans = await trans_strs(strs, 'zh', 'th');
    let thfile =  path.resolve(filepath, '../xcstr-zh-th.strings');
    write_strings(th_trans,thfile); 

    //荷兰语
    let nl_trans = await trans_strs(strs, 'zh', 'nl');
    let nlfile =  path.resolve(filepath, '../xcstr-zh-nl.strings');
    write_strings(nl_trans,nlfile); 
  */

}

async function trans_strs(strings, from, to) {

  let newstrs = [];
  for(let i=0; i<strings.length; i++) {
    let s = strings[i];
    let c = s.substr(1, s.length-2); //双引号处理

    if(s.charAt(0) == '\"') {

      let s0 = replace_formatted_string(c)
      let r = await trans(s0,from, to);
      r = JSON.parse(r)
      if(!r.error_code || r.error_code == 52000 ) //成功
       { 
          let trans = r.trans_result[0].dst;
          if(s0 != c)
            trans = resume_formatted_string(trans);

          let s1 = s + ' = \"' + trans + '\";';
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


function write_strings(strings, _path) {
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
  "%@:MOXEN",
  "%s:MOHEX",
  "\\\":T-H-O-WZU ",
  "\\\':TH-O-W-ZU ",
  "\\n: S-P-R-T ",
  "\\r: S-P-T-R ",
  "\\t: S-T-R-R ",
  "\\:THEU-WZU "
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
  //  console.log('--' + str);
    s = s.replaceAll(sps[1],sps[0]);
  }
  return s;
}

module.exports.dotranswork = dotranswork; 
module.exports.readstringlinesfromfile = readstringlinesfromfile;