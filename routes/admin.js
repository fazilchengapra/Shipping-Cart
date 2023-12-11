var express = require('express');
const fileType = require('file-type');
const fs = require('fs');
var router = express.Router();
var helpers = require('../helpers/admin-helper');
var Producthelpers = require('../helpers/product-helper');
const { ConnectionPoolMonitoringEvent, RunCommandCursor } = require('mongodb');
const { Console } = require('console');
var Gdrive=require('../config/Gdrive')
var db=require('../config/connect')
var product=require('../helpers/product-helper')
var collection=require('../config/collection')


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggin) {
    product.getAllProduct().then((allProduct)=>{
      res.render('admin/admin', { admin: true, detials: req.session.admin.username,allProduct })
    })
  } else {
    res.render('admin/admin-signup')
  }
});

router.post('/', (req, res) => {
  if (req.body.password === req.body.confirmPassword) {
    delete req.body.confirmPassword
    helpers.doSignup(req.body).then((data) => {
      req.session.loggin = true
      req.session.admin = data
      console.log(req.session.admin)
      res.redirect('/admin')
    })
  } else {
    res.render('admin/admin-signup', { Error: 'Dont match confirm pass' })
  }
})

router.get('/login', (req, res) => {
  if (req.session.loggin) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login')
  }
})

router.post('/login', (req, res) => {
  helpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggin = true
      req.session.admin = response.admin
      res.redirect('/admin')
    } else {
      req.session.LoggErr = true
      res.render('admin/admin-login', { Err: 'EmailAddress or Password Incorrect' })
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/add-product', (req, res) => {
  if(req.session.loggin){
    res.render('admin/add-product', { admin: true,detials: req.session.admin.username})
  }else{
    res.redirect('/admin')
  }
})

router.post('/add-product',async(req, res) => {
  Image=req.files.image
  if (req.files.image) {
    await Image.mv('./'+Image.name)
    Gdrive.call(req.files.image).then((result)=>{
      if(result){
        if(result.status==200){
          fs.unlinkSync('./'+Image.name)
          // console.log(result.data.id)
          req.body.src='https://drive.google.com/uc?export=view&id='+result.data.id
          // console.log(req.body.src)
          db.get().collection(collection.PRODUCT_COLLECTION).insertOne(req.body).then((data)=>{
            console.log(data)
            res.redirect('/admin')
            console.log('uploaded succes') 
          })
        }
      }else{
        console.log('no data')
        res.redirect('/admin/add-product')
      }
    })
  }
    
})
module.exports = router;