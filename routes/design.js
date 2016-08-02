var express = require('express');
var router = express.Router();

/* GET design page. */
router.get('/', function(req, res, next) {
  res.render('design', { title: 'Jobbatical' });
});

module.exports = router;
