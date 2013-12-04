var async = require('async');
var http = require('http');
var fs = require('fs');
var path = require('path');

/******************* ==== 配置信息 ===== ******************/
// 测试地址
var OPTIONS = {
  hostname: 'www.466.com',
  port: 80,
  path: '/'
};
// 测试结果存放路径
var temp_files_path = '/Users/lvyuang/temp/fs';
// 测试文件命名规则
var temp_files_name = 'request.{id}.{time}.html';
// 并发数
var con_count = 50;
/********************************************************/

var repeat = 0;
var index = 0;
var id_counter = 0;

function write(id, data, time) {
  var file_path = path.join(temp_files_path, temp_files_name.replace('{id}', id).replace('{time}', time));

  function zero(str) {
    if (typeof(str) !== 'string') {
      str = String(str);
    }

    while (str.length < 4) {
      str = str + ' ';
    }

    return str;
  }
  
  fs.appendFile(file_path, data, {
    'encoding': 'utf-8',
    'flag': 'a'
  }, function (err) {
    if (err) {
      console.log('##', 'err:', err, 'id:', id, 'time:', time);
    }
    else {
      console.log('## id: ' + zero(id) + ' time:', time);
    }
  });
}

function r(next) {
    var id = id_counter++;
    var data = '';
    var options = OPTIONS;
    var time = new Date();

    var req = http.request(options, function(res) {
      console.log('Request:', id);

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function (a,b,c) {
        write(id, data, ((new Date()) - time));
        next(null);
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    req.end();
}

function concurrency() {
    console.log('Sending requests...');

    async.parallel((function () {
        var list = [];

        for (var i = 0; i < con_count; i++) {
            list.push(r);
        }

        return list;
    })(), function (err, result) {
        if (index < repeat) {
            index++;
            concurrency();
        }
        else {
            console.log('completed;');
        }
    });
}

concurrency();