var collection=require('../config/collection')
var db=require('../config/connect')
module.exports={
    getAllProduct:function(){
        return new Promise(async(resolve,reject)=>{
            let Product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(Product)
        })
    }
}