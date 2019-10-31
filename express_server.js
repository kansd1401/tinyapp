const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { shortURL: randomString, longURL: urlDatabase[randomString], username: undefined };
  }else{
    templateVars = { shortURL: randomString, longURL: urlDatabase[randomString], username: users[req.cookies['user_id']]['email'] };
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  let logged = false
  for(let userId in users){
    const id = users[userId]
    if(id['email'] === req.body.email){
      if(id['password'] === req.body.password){
        console.log('got here',id)
        res.cookie('user_id',id['id'])
        res.redirect("/urls")
        logged =true
      }else{
        res.send('Error 404: Invalid password')
      }
    }
  }
  if(!logged){
    res.send('Error 404: Invalid email')
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/"+req.params.shortURL)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/"+req.params.shortURL)
});

app.post("/register",(req,res) =>{
  const id = generateRandomString();
  for(let userId in users){
    if(users[userId]['email']=== req.body.email){
      res.send('Error Account already exists for this email.')
    }
  }
  users[id]={'id': id,'email': req.body.email,'password': req.body.password}
  res.cookie('user_id',id)
  res.redirect('/urls')
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/login", (req, res) => {let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { urls: urlDatabase ,username: undefined};
  }else{
    templateVars = { urls: urlDatabase ,username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_login",templateVars);
});

app.get("/register", (req, res) => {
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { urls: urlDatabase ,username: undefined};
  }else{
    templateVars = { urls: urlDatabase ,username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_register",templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { urls: urlDatabase ,username: undefined};
  }else{
    templateVars = { urls: urlDatabase ,username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars ={}

  if(req.cookies['user_id'] === undefined){
    templateVars = { username: undefined};
  }else{
    templateVars = {username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,username: undefined};
    }else{
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("urls/new");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

function generateRandomString() {
  return Math.random().toString(36).substring(7);
}