const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {getUserByEmail, urlsForUser, generateRandomString} = require('./helpers');
app.use(cookieSession({
  name: 'session',
  keys: ['qwerty'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const urlDatabase = {};
const users = {};

app.post("/urls", (req, res) => {
  if (req.session.userId) {
    let randStr = generateRandomString();
    urlDatabase[randStr] = { 'longURL': req.body.longURL, 'userId': req.session.userId};
    let templateVars = { shortURL: randStr, longURL: urlDatabase[randStr]['longURL'], username: users[req.session.userId]['email'] };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send('LOG IN MY BOI');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId) {
    if (req.session.userId === urlDatabase[req.params.shortURL]['userId']) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(401).send('Ooh baby what is you doing (You cannot delete a usl that you did not submit');

    }
  } else {
    res.status(401).send('LOG IN MY BOI');
  }
});

app.post("/login", (req, res) => {
  let id = getUserByEmail(req.body.email,users);
  if (id) {
    if (bcrypt.compareSync(req.body.password, users[id]['password'])) {
      req.session.userId = id;
      res.redirect("/urls");
    } else {
      res.status(401).send('Invalid password');
    }
  } else {
    res.status(401).send('Invalid email');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    if (req.session.userId === urlDatabase[req.params.shortURL]['userId']) {
      urlDatabase[req.params.shortURL]['longURL'] = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(401).send('THIS IS ILLEGAL');
    }
  } else {
    res.status(401).send('LOG IN MY BOI');
  }
});

app.post("/register", (req, res) =>{
  const id = generateRandomString();
  if (req.body.email === undefined || req.body.password === undefined) {
    res.status(406).send("Please fill the information");
  }
  if (getUserByEmail(req.body.email,users)) {
    res.status(409).send('Error Account already exists for this email.');
  } else {
    users[id] = {'id': id,'email': req.body.email,'password': bcrypt.hashSync(req.body.password,10)};
    req.session.userId = id;
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let url = urlDatabase[req.params.shortURL]['longURL'];
    if (url[0] === 'h' && url[1] === 't' && url[2] === 't' && url[3] === 'p') {
      res.redirect(url);
    } else {
      res.redirect("http://" + url);
    }
  } else {
    res.status(404).send('Url does not exist');
  }
});

app.get("/login", (req, res) => {
  if (req.session.userId) res.redirect('/urls');
  else {
    let templateVars = { urls: urlDatabase ,username: undefined};
    res.render("urls_login",templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.userId) res.redirect('/urls');
  else {
    let templateVars = { urls: urlDatabase ,username: undefined};
    res.render("urls_register",templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (req.session.userId === undefined) {
    res.status(401).send('Please log in');
  } else {
    let templateVars = { urls: urlsForUser(req.session.userId,urlDatabase) ,username: users[req.session.userId]['email']};
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect('/login');
  } else {
    let templateVars = {username: users[req.session.userId]['email']};
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (req.session.userId) {
      if (urlDatabase[req.params.shortURL]['userId'] === req.session.userId) {
        let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] ,username: users[req.session.userId]['email']};
        res.render("urls_show", templateVars);
      } else {
        res.status(401).send('Unauthorized');
      }
    } else {
      res.redirect('/login');
    }
  } else {
    res.status(401).send('Url does not exist');
  }
});

app.get("/", (req, res) => {
  if (req.session.userId) res.redirect('/urls');
  else res.redirect("/login");
});

app.listen(PORT, () => {
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
