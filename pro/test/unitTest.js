var request = require("supertest");
var expect = require("chai").expect;
var rewire = require("rewire");
var app = rewire("../app");
var config = require("../config.json");

var testConfig = config.testing;

describe("App", function() {
     
           
    describe("Users API", function() {
      beforeEach(function() {
            this.path = {
                passwdPath: "file://" + testConfig.userPath,
                groupPath: "file://" + testConfig.groupPath,
                get passwd() {return this.passwdPath;},
                get group() {return this.groupPath;}
            };
                      
            console.log(this.path);   
         
         
          app.__set__("path", this.path);
          
          
           
      }); 

       
       it("GETS all users", function(done) {
           request(app).get("/users").expect(200).end(done);
       });
       
       it("GETS users/:uid", function(done) {
           request(app).get("/users/0").expect(200).end(done);
       });
       
       it("GETS users/:uid not in users", function(done) {
           request(app).get("/users/11").expect(404).end(done);
       });
       
       it("GETS users/:uid/groups", function(done) {
           request(app).get("/users/0/groups").expect(200).end(done);
       });
       
       it("GETS users/:uid/groups not in users", function(done) {
           request(app).get("/users/1/groups").expect(404).end(done);
       });
       
       
       it("GETS all groups", function(done) {
           request(app).get("/groups").expect(200).end(done);
       });
       
       it("GETS groups/:gid", function(done) {
           request(app).get("/groups/250").expect(200).end(done);
       });
       
       it("GETS groups/:gid not in groups", function(done) {
           request(app).get("/groups/1").expect(404).end(done);
       });
       
    });
});