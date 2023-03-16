const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
  
  },
  discount: {
    type: Number,
    required: true,
  },
  users: {
    type: [ObjectId],
    ref: "User",
    default: [],
  },
  maxUsers: {
    type: Number,
    
  },
  minAmount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Coupon", couponSchema);
