# Brain-Corp-project
In this project, I have two steps:

First, install some dependencies which are express, xmlhttprequest, chai, ejs, mocha, rewire, supertest. You can see them in the package.json file

Second, get into the file of pro and command “mocha” in the terminal is for test the project.
command "node app.js" is for running the service,if you want to get any information just change it on the url

Let me introduce the function of some files:
package.json has some dependencies we need to use
config.json is configuration file to find the path of test file and default file
app.js is the main part of this project.
views folder has several .ejs files for showing result on the dashboard
test folder has unitTest.js for testing, for other two file, I just randomly write a simply test, you can build your won test file, just make sure change the path in the config.json 