var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
  res.render('login', { title: 'Login', message: null });
});

router.post('/', (req, res) => {
  const { username, password } = req.body || {};
  if (username && password) {
    return res.render('login', { title: 'Login', message: `Hola, ${username}. (Login recibido - demo)` });
  }
  res.render('login', { title: 'Login', message: 'Rellena usuario y contraseña' });
});

module.exports = router;
