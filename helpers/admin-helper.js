var bcrypt = require('bcrypt')
var db = require('../config/connect')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const { resolve, reject } = require('promise')
const { response } = require('express')

module.exports = {
    doSignup: (data) => {
        return new Promise(async (resolve, reject) => {
            data.password = await bcrypt.hash(data.password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(data)
            resolve(data)
        })
    },
    doLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            var admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: data.email })
            if (admin) {
                bcrypt.compare(data.password, admin.password).then((result) => {
                    if (result) {
                        response.admin = admin
                        response.status = true
                        resolve(response)
                        // console.log('Login Succesfully')
                    } else {
                        resolve({ status: false })
                        // console.log('Login Error')
                    }
                })
            } else {
                resolve({ status: false })
                // console.log('Login Error')
            }
        })
    },
    doOtp: () => {
        return new Promise((resolve, reject) => {
            resolve(Math.floor(1000 + Math.random() * 9000).toString())
        })
    },
    doDeleteProduct:(proid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: new objectId(proid)}).then((response)=>{
                resolve(response)
            }) 
        })
    },
    getProductDetials:(proid)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new objectId(proid)}).then((result)=>{
                resolve(result)
            })
        })
    },
    updateProduct:(data,proId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proId)},{
                $set:{
                    Name:data.Name,
                    Catogary:data.Catogary,
                    Discription:data.Discription,
                    imageId:data.imageId,
                    src:data.src,
                    First_price:data.First_price,
                    Last_price:data.Last_price
                }
            }).then((result)=>{
                resolve(result)
            })
        })
    }
}