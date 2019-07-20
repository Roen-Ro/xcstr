#!/usr/bin/env node

/**
 * Module dependencies.
 */
//https://www.cnblogs.com/mengff/p/9753867.html //路径path处理


process.env.NODE_ENV = 'development';//部署的时候设置成 production

var inputPara = process.argv;//输入的参数 数组，注意参数是从第3个元素开始的（index为2），第一个元素为node执行器目录地址，第二个为js执行文件地址

var fs = require('fs');
var basUtil = require('./basicUtil.js');
var path = require('path');

console.log('inputed parameters are: '+ inputPara);

var cmd = inputPara[2];

 if(cmd == '-rpzhstr') {
    let dir = inputPara[3];
    enumerate_directory(dir, true, (err, file) => {
        console.log(file);
    });
}
else {
    console.log('available commands: ');
    console.log('-rpzhstr 查找.m .h  文件中的中文，并替换成NSLocalizedString()，所有中文字符也会输出到zh_localize.string');
}

function enumerate_directory (dir, recursive, handle) {

    fs.readdir(dir, function(err, list) {
      if (err) return handle(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return;
        file = dir + '/' + file;
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
              if(recursive) {
                enumerate_directory(file, recursive, handle);
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

  
  function findChineseString (path) {

        if(path.endsWith('.m') || path.endsWith('.h')) {

            fs.readFile(path, function(err,data){
                if(!err){
                    let text = data.toString();//将二进制的数据转换为字符串
                }    
        });
    }
  }

