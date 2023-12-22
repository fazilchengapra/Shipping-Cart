var express = require('express');
const fileType = require('file-type');
const fs = require('fs');
var router = express.Router();
var helpers = require('../helpers/admin-helper');
var Producthelpers = require('../helpers/product-helper');
const { ConnectionPoolMonitoringEvent, RunCommandCursor } = require('mongodb');
const { Console } = require('console');
var Gdrive = require('../config/Gdrive')
var db = require('../config/connect')
var product = require('../helpers/product-helper')
var collection = require('../config/collection')
var mail_send = require('../config/send-mail')



/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggin) {
    product.getAllProduct().then((allProduct) => {
      console.log(req.useragent.isMobile)
      res.render('admin/admin', { admin: true, detials: req.session.admin.username, allProduct, useragent: req.useragent.isMobile })
    })
  } else {
    res.render('admin/admin-signup')
  }
});

router.post('/', (req, res) => {
  if (req.body.password === req.body.confirmPassword) {
    delete req.body.confirmPassword
    console.log(req.body)
    req.session.admin = req.body
    delete req.body
    helpers.doOtp().then((result) => {
      if (result) {
        req.session.admin.otp=result
        mail_send.mail(req.session.admin).then((data) => {
          if (data) {
            res.render('otp', { signup: true })
          } else {
            res.redirect('/', { error: 'Email is incorrect' })
          }
        })
      }
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
      helpers.doOtp().then((result) => {
        req.session.admin.otp = result
        //console.log('OPT : ' + result)
        mail_send.mail(req.session.admin).then((data) => {
          if (data) {
            console.log('Email Success Fully Sended')
          } else {
            console.log('Email Not Sended')
          }
        })
      })
      req.session.admin = response.admin
      res.render('otp')
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
  if (req.session.loggin) {
    res.render('admin/add-product', { admin: true, detials: req.session.admin.username })
  } else {
    res.redirect('/admin')
  }
})

router.post('/add-product', async (req, res) => {
  Image = req.files.image
  if (req.files.image) {
    await Image.mv('./' + Image.name)
    Gdrive.call(req.files.image).then((result) => {
      if (result) {
        if (result.status == 200) {
          fs.unlinkSync('./' + Image.name)
          // console.log(result.data.id)
          req.body.src = 'https://drive.google.com/uc?export=view&id=' + result.data.id
          // console.log(req.body.src)
          db.get().collection(collection.PRODUCT_COLLECTION).insertOne(req.body).then((data) => {
            console.log(data)
            res.redirect('/admin')
            console.log('uploaded succes')
          })
        }
      } else {
        console.log('no data')
        res.redirect('/admin/add-product')
      }
    })
  }

})

router.post('/otp', (req, res) => {
  var otp = req.session.admin.otp;
  if (otp == req.body.otp) {
    delete req.session.admin.otp
    req.session.loggin = true
    res.redirect('/admin')
  } else {
    res.render('otp', { message: 'Incorrect OTP' })
  }
})
router.post('/signup-otp', (req, res) => {
  if(req.session.admin.otp==req.body.otp){
    delete req.session.admin.otp
    helpers.doSignup(req.session.admin).then((data) => {
      req.session.loggin = true
      req.session.admin = data
      console.log(req.session.admin)
      res.redirect('/admin')
    })
  }else{
    res.render('otp',{signup:true,message:'You Entered OTP is not Correct'})
  }
})
module.exports = router;