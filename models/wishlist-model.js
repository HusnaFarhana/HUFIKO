const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const wishlistSchema= new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    products:{
        type:[ObjectId],
        ref:'Product',
        default:[]
    }
})


module.exports=Wishlist=mongoose.model('wishlist',wishlistSchema)






