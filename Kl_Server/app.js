var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes/kl_api.js');   
var app = express(); 

//app.use(bodyParser.raw);
app.use(bodyParser.json());  //body-parser 解析json格式数据
//app.use(bodyParser.urlencoded({ extended: false }))

//跨域设置
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
    else  next();
});

routes(app);

//现在可以绑定和监听端口了，调用app.listen()方法，接收同样的参数，比如：  
app.listen(3000);
console.log('Listening on port 3000'); 