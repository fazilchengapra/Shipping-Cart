var express = require('express');
const fileType = require('file-type');
const fs = require('fs');
var router = express.Router();
var helpers = require('../helpers/admin-helper');
var Producthelpers = require('../helpers/product-helper');
const { ConnectionPoolMonitoringEvent, RunCommandCursor } = require('mongodb');
const { Console, log } = require('console');
var Gdrive = require('../config/Gdrive')
var db = require('../config/connect')
var product = require('../helpers/product-helper')
var collection = require('../config/collection')
var mail_send = require('../config/send-mail');
const adminHelper = require('../helpers/admin-helper');

const status = {
  fileCreate: false,
  fileUpdate: false,
  fileDelete: false
}


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggin) {
    product.getAllProduct().then((allProduct) => {
      res.render('admin/admin', { admin: true, detials: req.session.admin.username, allProduct, useragent: req.useragent.isMobile })
    })
  } else {
    res.render('admin/admin-signup')
  }
});

router.post('/', (req, res) => {
  if (req.body.password === req.body.confirmPassword) {
    delete req.body.confirmPassword
    helpers.doLogin(req.body).then((response) => {
      if (response.status) {
        res.render('admin/admin-signup', { message: 'This Email Address is Used Another Person' })
      } else {
        req.session.admin = req.body
        delete req.body
        helpers.doOtp().then((result) => {
          if (result) {
            req.session.admin.otp = result
            mail_send.mail(req.session.admin).then((data) => {
              if (data) {
                res.render('otp', { signup: true })
              } else {
                res.redirect('/', { error: 'Email is incorrect' })
              }
            })
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
      // helpers.doOtp().then((result) => {
      //   req.session.admin.otp = result
      //   mail_send.mail(req.session.admin)
      //   // .then((data) => {
      //   //   if (data) {
      //   //     console.log('Email Success Fully Sended')
      //   //   } else {
      //   //     console.log('Email Not Sended')
      //   //   }
      //   // })
      // })
      req.session.admin = response.admin
      req.session.loggin = true
      res.redirect('/admin')
      // res.render('otp')
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
  if (req.files) {
    var Image = req.files.image
    await Image.mv('./' + Image.name)
    status.fileCreate = true
    Gdrive.call(req.files.image, status).then((result) => {
      if (result) {
        if (result.status == 200) {
          fs.unlinkSync('./' + Image.name)
          req.body.imageId = result.data.id
          req.body.src = 'https://drive.google.com/uc?export=view&id=' + result.data.id
          db.get().collection(collection.PRODUCT_COLLECTION).insertOne(req.body).then((data) => {
            res.redirect('/admin')
            status.fileCreate = false
          })
        }
      } else {
        res.redirect('/admin/add-product')
      }
    })
  } else {
    db.get().collection(collection.PRODUCT_COLLECTION).insertOne(req.body).then((data) => {
      res.redirect('/admin')
      status.fileCreate = false
    })
  }

})

router.post('/otp', (req, res) => {
  req.session.loggin = true
  res.redirect('/admin')
  // var otp = req.session.admin.otp;
  // if (otp == req.body.otp) {
  //   delete req.session.admin.otp
  //   // req.session.loggin = true
  //   res.redirect('/admin')
  // } else {
  //   res.render('otp', { message: 'Incorrect OTP' })
  // }
})
router.post('/signup-otp', (req, res) => {
  if (req.session.admin.otp == req.body.otp) {
    delete req.session.admin.otp
    helpers.doSignup(req.session.admin).then((data) => {
      req.session.loggin = true
      req.session.admin = data
      res.redirect('/admin')
    })
  } else {
    res.render('otp', { signup: true, message: 'You Entered OTP is not Correct' })
  }
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await adminHelper.getProductDetials(req.params.id)
  res.render('admin/edit-product', { product })
})

router.post('/edit-product/:proId', async (req, res) => {
  if (req.files) {
    var Image = req.files.image
    await Image.mv('./' + Image.name)
    if (req.body.imageId) {
      status.fileUpdate = true
      Gdrive.call(Image, status, req.body.imageId).then((data) => {
        if (data.status == 200) {
          helpers.updateProduct(req.body, req.params.proId).then((data) => {
            status.fileUpdate = false
            fs.unlinkSync('./' + Image.name)
            res.redirect('/admin')
          })
        }
      })

    } else {
      status.fileCreate = true
      Gdrive.call(req.files.image, status).then((data) => {
        fs.unlinkSync('./' + Image.name)
        req.body.imageId = data.data.id
        req.body.src = 'https://drive.google.com/uc?export=view&id=' + data.data.id
        helpers.updateProduct(req.body,req.params.proId).then((data)=>{
          res.redirect('/admin') 
        })
      })
    }
  } else {
    helpers.updateProduct(req.body, req.params.proId).then((data) => {
      res.redirect('/admin')
    })
  }
})

router.get('/remove-product/:id/:imageId', (req, res) => {
  Gdrive.call(req.params.imageId, status.fileDelete = true).then((result) => {
    if (result.status == 204) {
      helpers.doDeleteProduct(req.params.id).then((result) => {
        res.redirect('/admin')
      })
    }
  })
})
router.get('/remove-product/:id', (req, res) => {
  helpers.doDeleteProduct(req.params.id).then((result) => {
    res.redirect('/admin')
  })
})
module.exports = router; 