const mongoose = require('mongoose')
const productSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true,
    },
    image: {
      type: Array,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    deleted: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema)