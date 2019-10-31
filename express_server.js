const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const {getUserByEmail, urlsForUser, generateRandomString} = require('./helpers')
app.use(cookieSession({
  name: 'session',
  keys: ['qwerty'],
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
};

const users = { 
}

app.post("/urls", (req, res) => {
  let randStr = generateRandomString()
  urlDatabase[randStr] = { 'longURL': req.body.longURL, 'userId': req.session.userId};
  let templateVars = { shortURL: randStr, longURL: urlDatabase[randStr]['longURL'], username: users[req.session.userId]['email'] };
  res.redirect('/urls/'+randStr)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.userId){
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  let id = getUserByEmail(req.body.email,users)
  if(id){
    if(bcrypt.compareSync(req.body.password, users[id]['password'])){
      req.session.userId= id
      res.redirect("/urls")
    }else{
        res.send('Error 404: Invalid password')
    }
  }else {
    res.send('Error 404: Invalid email')
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/"+req.params.shortURL)
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.session.userId){
    urlDatabase[req.params.shortURL] = req.body.longURL;
  }
  else {
    res.send('Error please login')
  }
  res.redirect("/urls/"+req.params.shortURL)
});

app.post("/register", (req, res) =>{
  const id = generateRandomString();
  if(getUserByEmail(req.body.email,users)){
    res.send('Error Account already exists for this email.')
  }else{
    users[id]={'id': id,'email': req.body.email,'password': bcrypt.hashSync(req.body.password,10)}
    console.log(users[id])
    req.session.userId = id
    res.redirect('/urls')
  }
});

app.get("/u/:shortURL", (req, res) => {
  let url = urlDatabase[req.params.shortURL]['longURL']
  if(url[0] === 'h' && url[1] === 't' && url[2] === 't' && url[3] === 'p'){
    res.redirect(url);
  }else{
    res.redirect("http://"+url);
  }
});

app.get("/login", (req, res) => {
  let name = req.session.userId;
  let email = '';
  if(name === undefined) email = undefined;
  else email = users[name]['email'];
  templateVars = { urls: urlDatabase ,username: email}
  res.render("urls_login",templateVars);
});

app.get("/register", (req, res) => {
  let name = req.session.userId;
  let email = '';
  if(name === undefined) email = undefined;
  else email = users[name]['email'];
  templateVars = { urls: urlDatabase ,username: email };
  res.render("urls_register",templateVars);
});

app.get("/urls", (req, res) => {
  if(req.session.userId === undefined){
    res.redirect('/login')
  }else{
    let templateVars = { urls: urlsForUser(req.session.userId,urlDatabase) ,username: users[req.session.userId]['email']};
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if(req.session.userId === undefined){
    res.redirect('/login')
  }else{
    let templateVars = {username: users[req.session.userId]['email']};
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let name = req.session.userId;
  let email = '';
  if(name === undefined) email = undefined;
  else email = users[name]['email'];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] ,username: email}
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("urls/new");
});

app.listen(PORT, () => {
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
