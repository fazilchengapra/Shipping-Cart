var express = require('express');
var router = express.Router();
var db=require('../config/connect')
var product=require('../helpers/product-helper')
var collection=require('../config/collection')
/* GET users listing. */
router.get('/', function(req, res, next) {
    product.getAllProduct().then((allProduct)=>{
        res.render('gest/gest-view',{gest:true,allProduct,useragent:req.useragent.isMobile}); 
      })
});

module.exports = router; 