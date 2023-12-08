var bcrypt=require('bcrypt')
var db=require('../config/connect')
var collection=require('../config/collection')

module.exports={
    doSignup:(data)=>{
        return new Promise(async(resolve,reject)=>{
            data.password= await bcrypt.hash(data.password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(data).then((data)=>{
                resolve(data)
            })
        })
    },
    doLogin:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            var admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:data.email})
            if(admin){
                bcrypt.compare(data.password,admin.password).then((result)=>{
                    if(result){
                        response.admin=admin
                        response.status=true
                        resolve(response)
                        console.log('Login Succesfully')
                    }else{
                        resolve({status:false})
                        console.log('Login Error')
                    }
                })
            }else{
                resolve({status:false})
                console.log('Login Error') 
            }
        })
    }
}