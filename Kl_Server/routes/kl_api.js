var mysql = require('mysql');
var pool  = mysql.createPool({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'knowledge'
});

function query(pool, sql, values, callback){
    pool.getConnection(function(err, connection) {
        console.log(values);
    // Use the connection
    connection.query(sql, values, function (error, results, fields) {
    // And done with the connection.
        connection.release();

    // Handle error after the release.
        if (error) throw error;
        else callback(results);
    // Don't use the connection here, it has been returned to the pool.
        });
    });
}

function getBookChapter(course_id, callback){
    var sql = "select b.bookname, ch.bookid, ch.chapterid, ch.chaptername from chapter ch, book b where b.courseid = ? and ch.bookid = b.bookid order by chapterid asc";
    var values = [];
    values.push(course_id);

    query(pool, sql, values, callback);
}

function getChapterKp(chapter_id, callback){
    var sql = "select * from kptable where chapterid = ?";
    var values = [];
    values.push(chapter_id);
    
    query(pool, sql, values, callback);
}

function modifyKp(form, callback){
    var sql = "update kptable set ";
    var values = [];
    for(var key in form){
        if(key == 'kpid' || key == 'key')
            continue;
        sql += key + '= ?, ';
        values.push(form[key]);
    }
    values.push(form.kpid);
    sql = sql.substr(0, sql.length - 2) + " where kpid = ?";
    console.log(sql + ' ' + values);
    
    query(pool, sql, values, callback);
}

function addKp(chapterid, form, callback){
    console.log(chapterid);
    // if(typeof form.kpindex === "string"){
    //     form.kpindex = parseInt(form.kpindex);
    // }
    var sql = 'CALL InsertKp(?, ?, ?, ?, @kpid)';
    var values = [];
    values.push(chapterid);
    values.push(form.kpindex);
    values.push(form.kpname);
    values.push(form.description);

    query(pool, sql, values, callback);
}

function deleteKp(kpid, callback){

    var sql = 'CALL DeleteKp(?)';
    query(pool, sql, [kpid], callback);
}

module.exports = function(app){
//处理GET请求
//http://127.0.0.1:3000/hello/?name=wujintao&email=cino.wu@gmail.com 
app.get('/klmanager/getChapterKp', function(req, res){  
    console.log(req.query.chapter_id);

    getChapterKp(req.query.chapter_id, function(results){
        res.send(results);
    });
    
});

app.get('/klmanager/getBookChapter', function(req, res){  
    console.log(req.query.course_id);

    getBookChapter(req.query.course_id, function(results){
        console.log(results);
        var rep = [];
        for(var i = 0; i < results.length; i++){
            var chapter = results[i];
            var m = true;
            console.log(rep);
            for(var j = 0; j < rep.length; j++){
                var book = rep[j];
                if(book.bookid == chapter.bookid){
                    book.chapters.push({chapterid: chapter.chapterid, chaptername: chapter.chaptername});
                    m = false;
                    break;
                }
            }
            //插入新的bookid
            if(m){
                var book = {bookid: chapter.bookid, bookname: chapter.bookname, chapters: [{
                    chapterid: chapter.chapterid, 
                    chaptername: chapter.chaptername
                }]};
                rep.push(book);
            }
        }
        
        res.send(rep);
    });
    
});
//以上表示凡是url能够匹配/hello/*的GET请求，服务器都将向客户端发送字符串“Hello World"  

app.post('/klmanager/add', function(req, res) {
    console.log(req.body);
    if (req.body.chapterid) {
    	console.log(req.body.chapterid);
        //能正确解析 json 格式的post参数
        addKp(req.body.chapterid, req.body.form, function(results){
            var row = results[0];
            console.log(row[0].kp_id);
            res.send({"status": "success", "kpid": row[0].kp_id});
        });
    }
});

app.post('/klmanager/delete', function(req, res) {
    if (req.body.kpid) {
    	console.log(req.body.kpid);
    	deleteKp(req.body.kpid, function(results){
            console.log(results);
            res.send({"status": "delete success"});
        });
    }
});

app.post('/klmanager/modify', function(req, res) {
    console.log(req.body);
    if (req.body.kpid) {
        console.log(req.body.kpid);

        modifyKp(req.body, function(results){
            res.send({"status": "modify success"});
        });
    }
});


}
//app.get('/', function(req, res){  
// res.render('index', {  
//    title: 'Express'  
//  });  
//});  
//上面的代码意思是，get请求根目录则调用views文件夹中的index模板，并且传入参数title为“Express”，这个title就可以在模板文件中直接使用