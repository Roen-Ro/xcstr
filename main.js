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

//提取出来的string
var found_string = [];

console.log('inputed parameters are: '+ inputPara);

var cmd = inputPara[2];

 if(cmd == '-rpzhstr') {
    let dir = inputPara[3];
    enumerate_directory(dir, true, (err, file) => {
        findChineseString(file);
    }, (err) => {
      console.log('finished enumerate...');
    });
}
else {
    console.log('available commands: ');
    console.log('-rpzhstr 查找.m .h  文件中的中文，并替换成NSLocalizedString()，所有中文字符也会输出到zh_localize.string');
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

  var nslocalizedString = 'NSLocalizedString(';
  var loalizedstringMacro = 'LSTRING(';
  var prefix3 = 'imageNamed:';

  
  function findChineseString (_path) {

        if(_path.endsWith('.m') || _path.endsWith('.h')) {
     //     console.log(path);
            fs.readFile(_path, function(err,data){
                if(!err) {

                  let chinese_pattern =  /@"[^"]*[\u4E00-\u9FA5]+[^"\n]*?"/g;
                  let text = data.toString();//将二进制的数据转换为字符串
                     
                  let rewritefile = false;
                    while(strs = chinese_pattern.exec(text)){
                     //  console.log(strs[0] + 'lastIndex: '+chinese_pattern.lastIndex)
                     let s = strs[0];
                     let idx = chinese_pattern.lastIndex;
                     if(stringBeforeIndexMatch(text,chinese_pattern.lastIndex-s.length,'imageNamed:'))
                        continue;

                      if(stringBeforeIndexMatch(text,chinese_pattern.lastIndex-s.length,nslocalizedString)) {
                        //NSLocalizedString(....);只提取不做处理
                      }
                      else if(stringBeforeIndexMatch(text,chinese_pattern.lastIndex-s.length,loalizedstringMacro)) {
                        //LSTRING(....);只提取不做处理
                      }
                      else {
                        text = text.insertStr(idx-s.length,nslocalizedString);
                        text = text.insertStr(idx+nslocalizedString.length,',nil)');
                        chinese_pattern.lastIndex += (nslocalizedString.length + 5);
                        rewritefile = true;
                      }
                      found_string.push(s);
                    }

                    if(rewritefile) {
                      var fname = path.basename(_path,'.m');
                      var destPath = path.resolve(_path,'../'+fname+'_revert.m');
                      fs.writeFile(destPath,text, (error) => {
                        
                      });
                    }
                }    
        });
    }
  }

function stringBeforeIndexMatch(content,index,match) {
  let len = match.length;
  if(index < len)
    return false;

  let s = content.substr(index-len,len);
  if(s == match)
    return true;
  else
    return false;

}
