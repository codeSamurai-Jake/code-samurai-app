//EXpress Config
var express = require('express'),
    app = express(),
    loki = require('lokijs'),
    session = require('express-session'),
    bodyParser = require('body-parser');

//DB config
var db = new loki('trending.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true,
    autosaveInterval: 4000
});
var User;
var Item;

function databaseInitialize() {
    User = db.getCollection("users");
    Item = db.getCollection("items");
    if (User === null) {
        User = db.addCollection("users");
        User.insert({username:'admin',password:'admin'});
        User.insert({username:'user',password:'user'});
        User.insert({username:'hi',password:'hi'});
    }
    if (Item === null) {
        Item = db.addCollection('items');
    }
    console.log(User);
}

//EJS
var port = process.env.PORT || 7000;
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({key: 'sid',secret: 'srt', resave: false, saveUninitialized: false}));
app.listen(port);

// This is example of logging message in the console (black screen)
console.log('Trending app started on http://localhost:'+port);

// --------------------------------------------------
// --------- start of helper functions --------------
// --------------------------------------------------

// function to match username and password
function userPasswordMatch (userName, password) {
    var loginUser = User.findOne({username:userName,password:password});
    if (loginUser != null) return true;
    else return false;
}

// delete and sort based on name
function deleteAndSort (itemName, itemValue) {
    var myItem = Item.chain().find({[itemName]:itemValue}).remove();
    var allItems = Item.chain().find().simplesort('likes').data().reverse();
    return (allItems);
}

// save all information on add page
function saveFormAndReturnAllItems (form) {
    Item.insert(form);
    var allItem = Item.find();
    console.log (allItem);
    return allItem;
}

// like and sort based on name
function likeAndSort (itemName, itemValue) {
    var myItem = Item.find({[itemName]:itemValue});
    if (myItem[0].likes == '' || myItem[0].likes == null)
        myItem[0].likes = 1;
    else
        myItem[0].likes += 1;
    Item.update(myItem);
    console.log(myItem[0]);
    var allItems = Item.chain().find().simplesort('likes').data().reverse();
    return (allItems);
}

function date11(){
    n =  new Date();
    y = n.getFullYear();
    m = n.getMonth() + 1;
    d = n.getDate();

    return m + "/" + d + "/" + y;
}

function deleteAll(){
    var myItems = Item.chain().find().remove();
}
// ---------- do not change above unless you know what you are doing :) -----------
// ---------- use the helper functions above as and when you need them ------------
// ---------- your code starts below this comment ---------------------------------




// load login page
app.get('/', function (request, response) {
    response.render('index', {message: null});
});


// when the link Add New Item is clicked - links or <a> tags always send "get" not "post"
app.get('/additem', function (request, response) {
    response.render('addpage',{loginName:request.session.user});
});



// click Welcome on login page
app.post('/login', function (request, response) {
    var loginName = request.body.loginName;
    var password = request.body.password;

    // save login name in session so it's available later
    request.session.user = loginName;
    var valid = userPasswordMatch(loginName,password);
    //hint: check is password is good or not, if not load same page with error as below
    if(valid){
        response.render('listpage', {items: Item.find()});
    }else{
        response.render('index', {message: "Invalid user name or password"});
    }
});



// when save button is clicked on add page
app.post('/saveitem', function (request, response) {

    console.log(request.body);
    var items = saveFormAndReturnAllItems(request.body);
    var date = date11();
    var likes = 0;
/*    var gameName = request.body.name;
    var gameDev = request.body.developer;
    var gameLink = request.body.link;
    var gameLink = request.body.link;
    var gamePrice = request.body.price;
    var gameAddedBy = request.body.addedBy;*/
    // hint #1: find the helper function that will help save the information first
    // hint #2: make sure to send the list of items to the list page
    console.log(items);
    response.render('listpage',{ items:items , date:date});
});

