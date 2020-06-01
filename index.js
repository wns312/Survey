'use strict;'
const express = require('express')
const bodyParser= require('body-parser')
const oracledb = require('oracledb')
const userData = require('./model/dbconfig')
const app = express()
const port = 3500

app.set('view engine', 'ejs')
app.use(express.static(__dirname+'/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', function(req,res) {
    res.render('home/survey')
})

app.post('/result', function(req,res) {
    let sql = "INSERT INTO survey VALUES('"+req.body.gender+"', '"+req.body.animal+"')"; // 쿼리문에 ;붙이지 않는다.
    
    oracledb.getConnection(userData,
        function(err, connection) {
            if(err) { console.log(err); return; }
            else{ console.log('정상적으로 연결되었음'); }
            executeInput(sql, connection)
            res.render('home/middle')
        }
    )
})

app.get('/result', function (req, res) {
    let sql = `SELECT DISTINCT 
    (SELECT COUNT(*) FROM survey WHERE gender='남자' AND animal='호랑이') male1,
    (SELECT COUNT(*) FROM survey WHERE gender='남자' AND animal='코끼리') male2,
    (SELECT COUNT(*) FROM survey WHERE gender='여자' AND animal='호랑이') female1,
    (SELECT COUNT(*) FROM survey WHERE gender='여자' AND animal='코끼리') female2
    FROM survey`;

    oracledb.getConnection(userData,
        function(err, connection) {
            if(err) { console.log(err); return; }
            else{ console.log('정상적으로 연결되었음'); }
            executeSelect(res, sql, connection)
        }
    )
})

app.listen(port, ()=>{
    console.log('http://localhost:'+port);
})

function executeInput(sql, connection) {
    connection.execute(sql,function(err, result){
        if(err){console.log(err); connectionClose(connection); return;}
        
        if(result.rowsAffected==1){
            console.log("입력성공");
            connection.commit(function(err){ // 커밋을 안하면 적용이 안된다.
            if(err){console.log(err);return;}
            connectionClose(connection);
            })
        }
    })
}

function executeSelect(res, sql, connection){
    connection.execute(sql,(err, result)=>{
        if(err){console.log(err); connectionClose(connection);}
        else{
            connectionClose(connection);
            res.render('home/result', 
            {
                male1 : result.rows[0][0], 
                male2 : result.rows[0][1], 
                female1 : result.rows[0][2], 
                female2 : result.rows[0][3]
            })
        }
    })
}

function connectionClose(connection) {
    connection.close(
        function(err) {
            if (err) { console.error(err.message); }
            console.log('정상적으로 종료되었음');
        }
    );
}




