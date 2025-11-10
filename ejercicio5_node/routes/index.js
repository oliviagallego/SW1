var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  const items = ['petricor', 'serendipia', 'histriónico', 'estrambótico', 'melifluo', 'onírico'];
  const images = [
    { alt: 'Gato', url: 'https://pixnio.com/free-images/2017/09/26/2017-09-26-07-22-55.jpg' },
    { alt: 'Perro', url: 'https://www.dzoom.org.es/wp-content/uploads/2021/02/fotos-perros-14.jpg' },
  ];
  res.render('index', { title: 'Inicio', items, images });
});

module.exports = router;
