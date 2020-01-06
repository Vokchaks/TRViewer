//let request = require('request');
/*
request("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[post_per_page]=1", function(error, response, body){
    let bodyJson = JSON.parse(body);
    let randomQuote = bodyJson[0]["content"];
    document.getElementById("quote").innerHTML = randomQuote;
});

setInterval(function(){
    request("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[post_per_page]=1", function(error, response, body){
        let bodyJson = JSON.parse(body);
        let randomQuote = bodyJson[0]["content"];
        document.getElementById("quote").innerHTML = randomQuote;
    });
}, 5000);

*/

let $ = require('jquery');
var storage = require("./storage.js");

var lastWindowState = storage.get("lastWindowState");
if (lastWindowState.debug === null) {
    lastWindowState.debug = false;
}

var timerId;

var URL = storage.get("URL");
if (URL === null) {
    URL = "http://trcontr.mycomp.local:88/query/";
    storage.set("URL", URL);
}
var  __requestComplete = true;
var Global ={};
    Global.sn = 0;

function logDebbug(message) {
    if (lastWindowState.debug) { 
        console.log(message);
    }
}

function getMessage() {
    if (!__requestComplete)
        return;
    
    __requestComplete = false;
        
    var enddate = new Date();
    var begindate = new Date( enddate - (1000 * 60 * 10)); 
    var dateBegin = begindate.getFullYear() + ('0' + (begindate.getMonth() + 1)).slice(-2)  + ('0' + begindate.getDate()).slice(-2) +
        ('0' + begindate.getHours()).slice(-2) + ('0' + begindate.getMinutes()).slice(-2)  + ('0' + begindate.getSeconds()).slice(-2);	 
    //alert(dateBegin);
        
    var dateEnd = enddate.getFullYear() + ('0' + (enddate.getMonth() + 1)).slice(-2)  + ('0' + enddate.getDate()).slice(-2) +
        ('0' + enddate.getHours()).slice(-2) + ('0' + enddate.getMinutes()).slice(-2)  + ('0' + enddate.getSeconds()).slice(-2);	 
    //alert(dateEnd);		

    $.ajax({
        type: "GET",
        url: URL + "events?begin=" + dateBegin + "&end=" + dateEnd,
        username: "ADMIN",
        password: "admin",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        // async: false,
        success: function(msg){
            __requestComplete = true;
            update(msg);
        }
    });
}

function getParam(id, param) { // userid, param, result
    $.ajax({
        type: "GET",
        url: URL + "users?userid=" + id + "&details=1",
        username: "ADMIN",
        password: "admin",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        async: false,
        success: function(msg) {
            
            var messageUsers = msg.getElementsByTagName("users")[0];
            var messageParams = messageUsers.getElementsByTagName("param");

            
            
            for(var i=0; i < messageParams.length; ++i) {
                var id = messageParams[i].getAttribute('id');
                if(id == param) {
                    Global.position = messageParams[i].childNodes[0].nodeValue;
                    break;
                }
            }
            
            
            //$('#debug').empty();
            //$('#debug').prepend(Global.position);
            
        },
        error: function () {
            $('#debug').empty();
            $('#debug').prepend("ОШИБКА !!!");
        }
    });
}


function getPhoto(id) {
    $.ajax({
        type: "GET",
        url: URL + "photo?userid=" + id,
        username: "ADMIN",
        password: "admin",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        success: function(msg){
            $('#photo').empty();
            $('#photo').prepend('<img src=\"' + URL + 'photo?userid='+id+'\"  height=\"400\"></img>');	
        },
        error: function () {
            $('#photo').empty();
            $('#photo').prepend('НЕ ЗАЛИЛИ !!');
        }
    });
}



function update(msg){

    var user_id = "";
    var user_name = "";	
    
    
    logDebbug("msg: " + JSON.stringify(msg));
    var messageEvents = msg.getElementsByTagName("events")[0];
    logDebbug("mEs: " + JSON.stringify(messageEvents));
    var messageEvent = messageEvents.getElementsByTagName("event");
    logDebbug("mE: " + JSON.stringify(messageEvent));
    
    if(messageEvent.length > 0)

        var message = messageEvent[messageEvent.length - 1];
        if (message === undefined) {
            logDebbug("var message is undefined");
            return;
        }
        if( Global.sn == message.getElementsByTagName("sn")[0].childNodes[0].nodeValue ) {
            return;
        }
        $('#message').empty();
        for(var i=0; i < messageEvent.length; i++) {
            if (i < messageEvent.length - 5 )
                continue;
            var message = messageEvent[i];
            var time = message.getElementsByTagName("time")[0].childNodes[0].nodeValue;
            var msg_text = message.getElementsByTagName("msg_text")[0].childNodes[0].nodeValue;
            var dev_name = message.getElementsByTagName("dev_name")[0].childNodes[0].nodeValue;
            
            user_id = "";
            user_name = "";	
            Global.position = "";
            
            if (message.getElementsByTagName("user_id")[0].childNodes[0]) {
                user_name = message.getElementsByTagName("user_name")[0].childNodes[0].nodeValue;

                user_id = message.getElementsByTagName("user_id")[0].childNodes[0].nodeValue;	
                
                getParam(user_id, "position");
                if( i == (messageEvent.length -1)) {
                    $('#fio').empty();
                    $('#fio').prepend('<h3>' + user_name.split(' ', 3).join('<br>') + '</h3><br>' + Global.position + '<br>');
            
                }
            }
            Global.sn = message.getElementsByTagName("sn")[0].childNodes[0].nodeValue;
            $('#message').prepend('<tr><td>'+time+'</td><td>'+msg_text+'</td><td>'+dev_name+'</td><td>'+user_name+'</td><td>'+ Global.position+'</td></tr>');
        }
        if(user_id != "") {
            getPhoto(user_id);
            //$('#photo').empty();
            //$('#photo').prepend('<img src=\"http://trbase.mycomp.local:88/query/photo?userid='+user_id+'\" width="300" height="400"></img>');
            //getPosition(user_id);
        } else {
            $('#fio').empty();
            $('#fio').prepend("<h3>НЕИЗВЕСТНЫЙ<h3>");
            $('#photo').empty();
            $('#photo').prepend("<h3>ФОТО НЕТ!<h3>");					
        }
        //$('#message').prepend('<tbody>');
        //$('#message').prepend('<thead><tr><th>Time</th><th>Message</th><th>User Name</th><th>Position</th></tr></thead>');

}
/*
function startLog(){
    timerId = setInterval("getMessage();", 1500);
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
}
function stopLog(){
    clearInterval(timerId);	
    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}
*/
function getTime(){
    var tm = new Date();
    var dd = tm.getDate(); 
    var mm = (tm.getMonth() + 1);
    mm = checkTime(mm);
    var yy = tm.getFullYear();
    
    var h = tm.getHours();
    var m = tm.getMinutes();
    var s = tm.getSeconds();
    
    m = checkTime(m);
    // s = checkTime(s);
    document.getElementById('clock').innerHTML=h + ":" + m; // + ":" + s;
    document.getElementById('date').innerHTML=dd + "." + mm + "." + yy;
    
}

setInterval(function(){
  getTime();
  getMessage();
}, 2000);


function checkTime(i){
    if (i < 10){
        i="0" + i;
    }
    return i;
}
/*
function start() {
    startLog();
    startTime();
}
*/