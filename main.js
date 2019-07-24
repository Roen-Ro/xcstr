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
var baidutrans = require('./baidutrans.js');

//提取出来的string
var all_founds = [];

console.log('inputed parameters are: '+ inputPara);

var cmd = inputPara[2];

 if(cmd == '-ze') {
    let dir = inputPara[3];
    basUtil.enumerate_directory(dir, true, (err, file) => {
        findChineseString(file);
    }, (err) => {
      if(!err) {
        console.log('-----extracted ' + all_founds.length + ' strings----')
        console.log('generating localized string file...');
        let localized_str = '//This file is auto generated by xcstr.\n// author:Roen (zxllf23@163.com) https://github.com/Roen-Ro \n'
         let str_set = new Set(all_founds);
         str_set.forEach( (item, i) => {
          localized_str += '\n';
          localized_str += item.substring(1);
         });
         
         let desPath = dir + '/localizedstring_zh_xcstr.strings';
         fs.writeFile(desPath,localized_str, (err) => {
          if(err)
            console.error(err.message);
          else {
            console.log('string file is generated at: ' + desPath);
          }

         });
         
      }
      else 
        console.error(err.message);
    
    });
}
else if(cmd == '-ts') {
  let filepath = inputPara[3];
  baidutrans.dotranswork(filepath);
}
else {
    console.log('available commands: ');
    console.log('-ze directory 查找directory .m .h .mm  文件中的中文，并替换成NSLocalizedString()，所有中文字符也会输出到localizedstring_zh_xcstr.strings');
    console.log('-ts stringfile 调用翻译api，将strings文件的内容翻译成多语言, 每种翻译生成在不同的文件中 ');
}



  var nslocalizedString = 'NSLocalizedString(';
  var loalizedstringMacro = 'LSTRING(';
  var prefix3 = 'imageNamed:';

  
  function findChineseString (_path) {

        if(_path.endsWith('.m') || _path.endsWith('.h') || _path.endsWith('.mm')) {
          console.log('analysis file: ' + _path);
          
          let data =  fs.readFileSync(_path);
          let info = handleFileData(data);
          if(info.matches.length > 0) {
            console.log('founds chinese strings: ' + info.matches);
            all_founds = all_founds.concat(info.matches);
          }
          if(info.modified) {
            fs.writeFileSync(_path,info.modified);
            console.log('modified: ', path.basename(_path));
          }
    }
  }

  /* 返回
  {
    matches:[]; //提取到匹配的字符 可能为空
    modified: "xxxxx" //修改后的内容 nullable
  }
  */
  function handleFileData(data) {

    let chinese_pattern =  /@"[^"]*[\u4E00-\u9FA5]+[^"\n]*?"/g;
    let text = data.toString();//将二进制的数据转换为字符串
    let founds = [];
    let retObj = {};
       
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
        founds.push(s);
      }

      retObj.matches = founds;

      if(rewritefile) {
        retObj.modified = text;
      //  // var fname = path.basename(_path,'.m');
      //   var destPath = _path;//path.resolve(_path,'../'+fname+'_revert.m');
      //   fs.writeFile(destPath,text, (error) => {

      //   });
      }

      return retObj;
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


//----- 一次性使用----
async function replacechinesewithengllish (stringfile, prjDir) {

 let textes = await baidutrans.readstringlinesfromfile(stringfile)

 for(let i in textes) {
  let l = textes[i];
  
 }
 

}