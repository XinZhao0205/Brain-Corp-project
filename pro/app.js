var express = require("express");
var app = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var config = require("./config.json");
var defaultConfig = config.development;

var path = {
    passwdPath: "file://" + defaultConfig.userPath,
    groupPath: "file://" + defaultConfig.groupPath,
    get passwd() {return this.passwdPath;},
    get group() {return this.groupPath;}
};

function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    var allText = "";
    
    rawFile.onreadystatechange = function ()
    {   
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200)
            {
                allText = rawFile.responseText;
            } else {
                allText = "error";
            }
        }
    }
    rawFile.send(null);
    
    return allText;
}

function User(name, uid, gid, comment, home, shell) {
  this.name = name;
  this.uid = uid;
  this.gid = gid;
  this.comment = comment;
  this.home = home;
  this.shell = shell
}

function Group(name, gid, members) {
    this.name = name;
    this.gid = gid;
    this.members = members;
}

function prepareUserData(path) {
    var bodyUser = readTextFile(path.passwd);
    
    var get_user = new Array();
    var user_map = new Map();
    
    var user = bodyUser.split('\n');
    user.pop();
    user.forEach(function(each, index, arr){
       user[index] = each.split(':'); 
    });
    user.forEach(function(each, index, arr){
       get_user.push(new User(user[index][0], parseInt(user[index][2]),parseInt(user[index][3]),user[index][4],user[index][5],user[index][6]));
       user_map.set(user[index][2], user[index][0]);
    });
    return [get_user, user_map];
}

function prepareGroupData(path) {
    var bodyGroups = readTextFile(path.group);
    var get_group = new Array() ;
    
     var group = bodyGroups.split('\n');
    group.pop();
    group.forEach(function(each, index, arr){
       group[index] = each.split(':'); 
    });
    group.forEach(function(each, index, arr){
        var mem = group[index][3].split(',');
       get_group.push(new Group(group[index][0], parseInt(group[index][2]), mem));
    });
    return get_group;
}

app.get("/users", function(req, res){
    
    var data= prepareUserData(path);
    var get_user = data[0];
    var user_map = data[1];
    
    var pool = get_user;
    
    if(! (Object.keys(req.query).length === 0)) {
        for(var prop in req.query) {
            var output = new Array();
            pool.forEach(function(element) {
                if(element[prop] == req.query[prop]) output.push(element);
            });
            pool = output;
        }
        
         res.render("users.ejs", {json_users: JSON.stringify(output)});
    } else {
        var json_users = JSON.stringify(get_user);
        
        res.render("users.ejs", {json_users: json_users});
    }
});

app.get("/groups", function(req, res){
    var get_group = prepareGroupData(path);
    var pool = get_group;
    if(! (Object.keys(req.query).length === 0)) {
        for(var prop in req.query) {
            var output = new Array();
            if(prop != "members") {
                pool.forEach(function(element) {
                    if(element[prop] == req.query[prop]) output.push(element);
                });
            } else {
                pool.forEach(function(element) {
                    var isSubset = true;
                    for(var mem in req.query[prop]) {
                         //console.log(req.query[prop][mem]);
                        if(element.members.indexOf(req.query[prop][mem]) == -1) isSubset = false;
                    }  
                    if(isSubset) output.push(element);
                });
               
            }
            pool = output;
        }
         res.render("users.ejs", {json_users: JSON.stringify(output)});
    } else {
        var json_groups = JSON.stringify(get_group);
        res.render("groups.ejs", {json_users: json_groups});
    }
});

app.get("/users/:uid", function(req, res){
    
    var data= prepareUserData(path);
    var get_user = data[0];
    var user_map = data[1];
    
    var found = get_user.some(function(element) {
       if(element.uid == req.params.uid) {
           res.render("user.ejs", {user: JSON.stringify(element)});
           return true;
       }
    });
    
    if(!found) return res.status(404).send('404_error');
});


app.get("/groups/:gid", function(req, res){
    var get_group=prepareGroupData(path);
    var found = get_group.some(function(element) {
       if(element.gid == req.params.gid) {
           res.render("group.ejs", {group: JSON.stringify(element)});
           return true;
       }
    });
    if(!found) return res.status(404).send('404_error');
});

app.get("/users/:uid/groups", function(req, res){
    var data= prepareUserData(path);
    var get_user = data[0];
    var user_map = data[1];
    var get_group=prepareGroupData(path);
    
    if(!user_map.has(req.params.uid)) return res.status(404).send('404_error');
    var name = user_map.get(req.params.uid);
    var user_groups = new Array();
    
    get_group.forEach(function(element, index, arr) {
        if(get_group[index].members.indexOf(name) > -1) user_groups.push(element);
    });
 
    return res.render("user_groups.ejs", {user_groups: JSON.stringify(user_groups)});
});

module.exports = app;

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The App Server Has Started!");
});