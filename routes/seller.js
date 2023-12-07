var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
    res.render('seller/seller',{seller:true,message:'<p>This Page Is Empty </P>'})
})

module.exports = router;