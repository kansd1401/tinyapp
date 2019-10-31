const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "kang.sanjeet1401@gmail.com", 
    password: "1"
  }
}

app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  urlDatabase[randomString] = { 'longURL': req.body.longURL, 'userId': req.cookies['user_id']};
  console.log(urlDatabase[randomString])
  let templateVars ={}
  templateVars = { shortURL: randomString, longURL: urlDatabase[randomString]['longURL'], username: users[req.cookies['user_id']]['email'] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.cookies['user_id']){
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  let logged = false
  for(let userId in users){
    const id = users[userId]
    if(id['email'] === req.body.email){
      if(id['password'] === req.body.password){
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
  if(req.cookies['user_id']){
    urlDatabase[req.params.shortURL] = req.body.longURL;
  }
  else {
    res.send('Error please login')
  }
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
  let url = urlDatabase[req.params.shortURL]['longURL']
  if(url[0] === 'h' && url[1] === 't' && url[2] === 't' && url[3] === 'p'){
    res.redirect(url);
  }else{
    res.redirect("http://"+url);
  }
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
    res.redirect('/login')
    }else{
    templateVars = { urls: urlsForUser(req.cookies['user_id']) ,username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    res.redirect('/login')
  }else{
    templateVars = {username: users[req.cookies['user_id']]['email']};
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars ={}
  if(req.cookies['user_id'] === undefined){
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] ,username: undefined};
    }else{
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] ,username: users[req.cookies['user_id']]['email']};
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

const urlsForUser = (user) => {
  let userUrls = {}
  for(let id in urlDatabase){
    if(urlDatabase[id]['userId'] === user){
      userUrls[id] = urlDatabase[id]['longURL']
    }
  }
  return userUrls
}

function generateRandomString() {
  return Math.random().toString(36).substring(7);
}