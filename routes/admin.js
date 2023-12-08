var express = require('express');
var router = express.Router();
var helpers = require('../helpers/admin-helper');
const { ConnectionPoolMonitoringEvent, RunCommandCursor } = require('mongodb');

/* GET users listing. */
router.get('/', function (req, res, next) {
  if(req.session.loggin){
    res.render('admin/admin',{admin:true,detials:req.session.admin.username})
  }else{
    res.render('admin/admin-signup')
  }
});

router.post('/', (req, res) => {
  if (req.body.password === req.body.confirmPassword) {
    delete req.body.confirmPassword
    helpers.doSignup(req.body).then((data) => {
      req.session.loggin=true
      req.session.admin=data
      console.log(req.session.admin)
      res.redirect('/admin')
    })
  }else{
    res.render('admin/admin-signup',{Error:'Dont match confirm pass'})
  }
})

router.get('/login',(req,res)=>{
  if(req.session.loggin){
    res.redirect('/admin')
  }else{
    res.render('admin/admin-login')
  }
})

router.post('/login',(req,res)=>{
  helpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggin=true
      req.session.admin=response.admin
      res.redirect('/admin')
    }else{
      req.session.LoggErr=true
      res.render('admin/admin-login',{Err:'EmailAddress or Password Incorrect'})
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;