// mini-projet-vulnerable/app.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const app = express();
const csrf = require('csurf');
const csrfProtection = csrf();


app.use(csrfProtection);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'notsecure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // mettre true si HTTPS
    sameSite: 'strict'
  }
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let users = [
  { id: 1, username: 'alice', password: '1234' },
  { id: 2, username: 'bob', password: 'abcd' }
];

let messages = [];

// Page de login
app.get('/', (req, res) => {
  res.render('login');
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username == username && u.password == password);
  if (user) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.send('Login failed');
  }
});


app.get('/contact', (req, res) => {
  res.render('contact', { messages });
});

app.post('/contact', (req, res) => {
  let message = req.body.message;
  // Nettoyer le message
  message = sanitizeHtml(message, {
    allowedTags: [], // aucun HTML autorisé
    allowedAttributes: {}
  });
  messages.push(message);
  res.redirect('/contact');
});



app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = req.session.user; // on ignore ?id
  res.render('dashboard', { user });
});



app.get('/edit-profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('edit', { csrfToken: req.csrfToken() });
});


app.post('/edit-profile', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const user = users.find(u => u.id === req.session.user.id);
  user.username = req.body.username;
  res.redirect('/dashboard');
});

// Server
app.listen(3000, () => {
  console.log('Mini-projet vulnérable en cours sur http://localhost:3000');
});
