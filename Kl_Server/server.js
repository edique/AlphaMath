var http = require('http');


http.createServer((req, res) => {
  if (req.method == 'POST') {// 处理普通post请求
    api.post(req, res);
  } else {// 处理普通get请求
    api.get(req, res);
  }
}).listen(3000);

console.log('[Server Info] Start server at http://localhost:3000/');