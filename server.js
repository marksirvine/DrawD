// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server: change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use.

// Variables for sql Database and filesystem
var fs = require("fs");
var sql = require("sqlite3");
var db = new sql.Database("data.db");
var nextId = 1;


var http = require("http");
var OK = 200, NotFound = 404, BadType = 415, Error = 500, TooLarge = 413;
var types, banned;
start(8080);

// Start the http service.  Accept only requests from localhost, for security.
function start(port) {
    types = defineTypes();
    banned = [];
    banUpperCase("./public/", "");
    var service = http.createServer(handle);
    service.listen(port, "localhost");
    var address = "http://localhost";
    if (port != 80) address = address + ":" + port + "/index.html";
    console.log("Server running at", address);
    //testSQL();
}

// Serve a request by delivering a file.
function handle(request, response) {
    //
    var url = request.url.toLowerCase();
    var type = findType(url);


    //DEBUGGING
    console.log(" ");
    console.log("Handing request - Method:", request.method);
    console.log("URL:", request.url);
    console.log("BODY:", request.body);

    //VALIDATION
    if (isBanned(url) || containsBannedSynonyms(url)) return fail(response, NotFound, "URL has been banned");
    // ENABLE THIS TO GET FULL URL VALIDATION
    //if (isValidURL(url)) return fail(response, NotFound, "URL is not valid");
    if (type == null) return fail(response, BadType, "File type unsupported");

    // HTTP Routing
    if (request.method == "GET") {
        // console.log("METHOD:GET REACHED");
        if (request.url === "/newFeedData.json") {
          handleGetNewestData(request, response, type);
        } else if (request.url === "/origionalData.json") {
          handleGetOrigionalData(request, response, type);
        } else {
           if (url.endsWith("/")) url = url + "index.html";
           var file = "./public" + url;
           fs.readFile(file, ready);
           function ready(err, content) { deliver(response, type, err, content); }
         }


    } else if (request.method == "PUT"){
        // console.log("METHOD:PUT REACHED");
         if (request.url === "/newImage.png") {
           // HANDLE IMAGE BEING SENT TO SERVER
           handleSaveImage(request, response);
        }
    } else if (request.method == "POST") {
       if (request.url === "/idFeedData.json") {
        handleGetSelectedData(request, response, type);
      } else if (request.url === "/idIncrementScore.json") {
       handleIncrementScore(request, response, type);
     } else if (request.url === "/idSaveComment.json") {
      handleSaveComment(request, response, type);
    } else if (request.url === "/idCommentsData.json") {
     handleGetComments(request, response, type);
   }
    }
}

function handleGetNewestData(request, response, type){
    var query = "SELECT * FROM userImages ORDER BY userImageID DESC LIMIT 1;";
    db.each(query, reply);
    function reply (err, row){
      console.log(row);
      deliver(response, type, err, JSON.stringify(row));
    }
}

function handleSaveComment(request, response, type){

    request.on('data', add);
    request.on('end', end);
    var body = "";
    function add(chunk) {
      body = body + chunk.toString();
      console.log(body);
    }

    function end() {
    var id = body.substr(0,body.indexOf('idEnd'));
    console.log(id);
    var comment = body.substr(body.indexOf('idEnd')+5);
    console.log(comment);
    var query = "insert into comments (userImageID, comment) values (" + id + ", '"+ comment + "');";
    console.log("running : "+query);
    db.run(query, reply);
    function reply (err){
      console.log("error = "+err);
      deliver(response, type, err, "");
    }
  }
}

function handleGetOrigionalData(request, response, type){
    var query = "SELECT * FROM origImages;";
    db.all(query, reply);
    function reply (err, rows){
      console.log(rows);
      deliver(response, type, err, JSON.stringify(rows));
    }
}

function handleGetSelectedData(request, response, type){
  // var requestBody = '';

  request.on('data', add);
  request.on('end', end);
  var body = "";
  function add(chunk) {
      body = body + chunk.toString();
      console.log(body);
  }

  function end() {

    var query = "SELECT * FROM userImages WHERE userImageID="+ body.toString()+";";
    db.each(query, reply);
    function reply (err, row){
      console.log(row);
      deliver(response, type, err, JSON.stringify(row));
    }
  }
}

function handleGetComments(request, response, type){
  // var requestBody = '';

  request.on('data', add);
  request.on('end', end);
  var body = "";
  function add(chunk) {
      body = body + chunk.toString();
      console.log(body);
  }

  function end() {

    var query = "SELECT * FROM comments WHERE userImageID="+ body.toString()+";";
    db.all(query, reply);
    function reply (err, rows){
      console.log(rows);
      deliver(response, type, err, JSON.stringify(rows));
    }
  }
}


function handleIncrementScore(request, response, type){
  // var requestBody = '';

  request.on('data', add);
  request.on('end', end);
  var body = "";
  function add(chunk) {
      body = body + chunk.toString();
      console.log(body);
  }

  function end() {

    var query = "SELECT * FROM userImages WHERE userImageID="+ body.toString()+";";
    db.each(query, reply);
    function reply (err, row){
      console.log(row);
      var score = row["score"];
      var updatedScore = row["score"] + 1;
      var query2 = "update userImages set score="+updatedScore.toString()+" where userImageID="+body.toString()+";";

      db.run(query2, reply2);
      function reply2 (err){
              deliver(response, type, err, "");
      }

    }
  }
}


function handleSaveImage (request, response){
  // var requestBody = '';

  request.on('data', add);
  request.on('end', end);
  var body = "";
  function add(chunk) {
      body = body + chunk.toString();
    }
  function end() {
    // WHEN IMAGE HAS FINISHED BEING UPLOADED
    var origNumber = body.substr(0,body.indexOf('origEnd'));
    var imageBase64body = body.substr(body.indexOf('origEnd')+7); // "tocirah sneab"

    var base64Data = imageBase64body.replace(/^data:image\/png;base64,/, "");

    var query = "insert into userImages (origImageID, location, score) values ("+origNumber.toString()+", 'userimages/new"+origNumber.toString()+".png', '0');"
    var query2 = "SELECT *FROM userImages ORDER BY userImageID DESC LIMIT 1"
    // IMAGE LOCATION NEEDS TO BE UPDATED
    db.run(query, next);
    function next(err) {
      db.each(query2, gotID);
      function gotID(err, row) {
      if (err) throw err;
      // console.log(this.lastID);
      var id = row["userImageID"];
      db.run("update userImages set location='userimages/userimage"+id+".png' where userImageID="+id+";");
      fs.writeFile("public/userimages/userimage"+id+".png",base64Data, 'base64', function(err) {
        if(err) {
          return console.log(err);
        }

        console.log("The file was saved!");


        deliverBlank(response);
      });
    }
  }
}
}


function getImage(){

  //db.all("select * from images", showSQL);
  db.each("select * from images where id=1", handleImage);
}


function handleImage(err, row) {
    if (err) throw err;
    console.log(row);
}

// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (url.startsWith(b)) {
          console.log(b);
          return true;
        }
    }
    return false;
}

// Forbid any resources which shouldn't be delivered to the browser.
function isValidURL(url) {
  var validUrl = require('valid-url');

  if (validUrl.isUri(url) || validUrl.isHttpsUri(url)){
      console.log('Looks like an URI');
      return true;
  } else {
      console.log('Not a URI');
      return false;
  }
}

function containsBannedSynonyms(url){
  url2 = decodeURIComponent(url);
  console.log(url2);
  if (url2.indexOf("..") > -1) {
    console.log('Warning: URL contains ..')
    return true;
  } else if (url2.indexOf("//") > -1) {
    console.log('Warning: URL contains //')
    return true;
  } else if (url2.indexOf("/./") > -1) {
    console.log('Warning: URL contains /./')
    return true;
  } else {
    return false;
  }
}

// Find the content type to respond with, or undefined.
function findType(url) {
    var dot = url.lastIndexOf(".");
    var extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {
    if (err) return fail(response, NotFound, "File not found");
    var typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}


function deliverBlank(response) {
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as xhtml ("application/xhtml+xml").  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: for a more complete list, install
// the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        nextImage : "/nextImage",
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
