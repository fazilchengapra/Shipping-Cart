var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/user',{message:'<p>This Page Is Empty </P>'});
});

module.exports = router;