var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('gest/gest-view',{gest:true,message:'<p>This Page Is Empty </P>'});
});

module.exports = router;