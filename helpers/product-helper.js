const { resolve, reject } = require('promise')
var collection=require('../config/collection')
var db=require('../config/connect')
const { ObjectId } = require('mongodb')
module.exports={
    getAllProduct:function(){
        return new Promise(async(resolve,reject)=>{
            let Product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(Product)
        })
    },
    getOneProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(productId)}).then((response)=>{
                resolve(response)
            })
        })
    }
}