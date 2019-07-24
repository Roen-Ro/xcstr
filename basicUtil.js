#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String JS字符处理

var fs = require('fs');
var path = require('path')

function objectFromJsonFile(jsionFilePath) {

  return new Promise( (resolve, reject) => {

    fs.readFile(jsionFilePath, function(err,data){
      if(err)
          reject(err);
      else {
        var jsonStr = data.toString();//将二进制的数据转换为字符串
        var obj = JSON.parse(jsonStr);//将字符串转换为json对象
        resolve(obj);
      }
    });
  });
}

//dir 目录路径 recursive：bool是否递归遍历子目录 handle(error,file):每遍历到一个文件就会回调 done(error):遍历完所有就会回调
function enumerate_directory (dir, recursive, handle, done) {

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
            if(recursive) {
              enumerate_directory(file, recursive, handle, (err) => {
                next();
              } );
            }
            else {
              next();
            }
        } else {
          handle(null,file);
          next();
        }
      });
    })();
  });
};

//自动对参数做了urlencode
function urlform(obj) {
  let s = '';
  Object.keys(obj).forEach((key) => {
    s += ('&' + key + '=' + encodeURI(obj[key]));
  });
  if(s.length > 0)
    return s.substring(1);
  else
    return s;
}

String.prototype.stringtrimmedwithtags = function (beginTag,endTag) {

  let sIdx = -1;
  let eIdx = -1;
  let tmpStr = this.toString();

  while(1) {

    sIdx = tmpStr.indexOf(beginTag);
    eIdx = tmpStr.indexOf(endTag);
    let len = tmpStr.length;
    if(sIdx >= 0 && eIdx >= 0 && eIdx > sIdx) {
      var tmsStr1 = '';
      if(sIdx > 0)
        tmsStr1 = tmpStr.substring(0,sIdx);

      if(eIdx < len-1)
        tmsStr1 += tmpStr.substring(eIdx+1,len);

      tmpStr = tmsStr1;
    }
    else
      break;
  }
  return tmpStr;
}

String.prototype.replaceAll= function (a,b) {
  let tmpStr = this.toString();
  let eles = tmpStr.split(a);
  let retStr = eles[0];
  for(var i=1; i<eles.length; i++) {
    retStr += (b + eles[i]);
  }
  return retStr;
}

String.prototype.insertStr =  function(index, str) {   
  let tmpStr = this.toString();
  return tmpStr.slice(0, index) + str + tmpStr.slice(index);
}

exports.objectFromJsonFile = objectFromJsonFile;
exports.enumerate_directory = enumerate_directory;
exports.urlform = urlform;