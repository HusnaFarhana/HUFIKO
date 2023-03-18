const User = require("../models/user-model");
const Product = require("../models/product-model");
const Cart = require("../models/cart-model");
const Wishlist = require("../models/wishlist-model");
const Category = require("../models/category-model");
const Order = require("../models/order-model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { log } = require("console");
const randomstring = require("randomstring");
const Coupon = require("../models/coupon-model");
const instance = new Razorpay({
  key_id: "rzp_test_uMmtCx7BlPzTfd",
  key_secret: "oUuPVJbRDxl7t2HLGn4J6SiJ",
});

// To encrypt password-------------------------------------------------

const securepassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// To send the verification mail----------------------------------------

const sendVerifyMail = async (username, email, _id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PSWD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "for verification mail",
      html:
        "<p>Hi " +
        username +
        ', please click here to <a href="http://hufiko.store/verify?id=' +
        _id +
        '"> verify </a> </p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

// To load the signup page for user----------------------------------------

const loadSignup = async (req, res) => {
  try {
    if (req.session.userlogged) {
      res.redirect("/");
    } else {
      res.render("user-signup");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// To create a new user and insert to database-----------------------------

const insertUser = async (req, res) => {
  try {
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      res.render("user-signup", { message1: "Email is already registered" });
    } else {
      const spassword = await securepassword(req.body.password);
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        mobilenumber: req.body.mobilenumber,
        gender: req.body.gender,
        dob: req.body.dob,
        password: spassword,
        is_admin: 0,
      });
      const userData = await user.save();
      if (userData) {
        sendVerifyMail(req.body.username, req.body.email, userData._id);
        res.render("user-signup", {
          message:
            "Your registration has been successful, Please verify your mail",
        });
      } else {
        res.render("user-signup", {
          message: "Your registration has been failed",
        });
      }
    }
  } catch (error) {
    res.render('404',{message:"Error Found"})
  }
};

// To load the login page for user-----------------------------------------

const loadLogin = async (req, res) => {
  try {
    if (req.session.userlogged) {
      res.redirect("/");
    } else {
      res.render("user-login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// To verify the user details in login form--------------------------------

const verifyUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordmatch = await bcrypt.compare(password, userData.password);

      if (passwordmatch) {
        if (userData.is_verified === "0") {
          res.render("user-login", { message: "please verify mail" });
        } else {
          if (userData.block === "false") {
            req.session.userid = userData._id;
            req.session.userlogged = true;
          }

          if (req.session.userlogged == true) {
          } else {
            res.render("user-login", { message: "Invalid User" });
          }
          res.redirect("/");
        }
      } else {
        res.render("user-login", { message: "Email and password incorrect" });
      }
    } else {
      res.render("user-login", { message: "Email and password incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// To load the home page for the user -------------------------------------

const loadHome = async (req, res) => {
  try {
    const cate = await Category.find();
    let log;
    const productData = await Product.find().limit(4);
    const newProducts = await Product.find().sort({createdAt:-1}).limit(4);
    const newProducts2 = await Product.find()
          .sort({ createdAt: 1 })
          .limit(4);

    if (req.session.userlogged == true) {
      log = "logedin";
    } else {
      log = "loggedout";
    } 
    console.log("home loaded");
    res.render("user-home", {
      abc: log,
      product: productData,
      user: req.session.userid, 
      cat: cate,
      newProducts: newProducts,
      newProducts2       
    });
  } catch (error) {
    console.log(error.message);
  }
};

// To log out the user ----------------------------------------------------

const userLogout = async (req, res) => {
  try {
    if (req.session.userlogged) {
      req.session.userlogged = false;
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// To verify the user's email----------------------------------------------

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );

    res.render("email-verified");
  } catch (error) {
    console.log(error);
  }
};

// To load the OTP page for user-------------------------------------------

const loadOTP = async (req, res) => {
  try {
    if (req.session.userlogged) {
      res.redirect("/");
    } else {
      res.render("loginotp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// To load the page where the user can verify their OTP--------------------

const loadverifyOTP = async (req, res) => {
  try {
    if (req.session.userlogged) {
      res.redirect("/");
    } else {
      res.render("verifyotppage");
    }
  } catch (error) {
    console.log(error.message);
  }
};

let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

// To send the OTP created to the users mail-------------------------------
const sendOTP = async (req, res) => {
  const email = req.body.email;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "Amdazzlin01@gmail.com",
        pass: "nrpwenypdsjihpru",
      },
    });

    console.log(otp);

    const mailOptions = {
      from: "Amdazzlin01@gmail.com",
      to: email,
      subject: "for verification mail",
      html: "<p>Hi, your otp is</p>" + otp,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("otp has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
  res.redirect("/verifyotppage");
};

// To verify the otp provided by the user----------------------------------

const verifyOTP = async (req, res) => {
  if (req.body.otp == otp) {
    req.session.userlogged = true;
    res.redirect("/");
  } else {
    res.render("verifyotppage", { message: "Invalid OTP" });
  }
};

//To view all the products available---------------------------------------

const viewProducts = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const cate = await Category.find();
    let log;
    if (req.session.userlogged) {
      log = "loggedin";
    } else {
      log = "loggedout";
    }
    const productData = await Product.find({
      deleted: "false",
      productname: { $regex: ".*" + search + ".*", $options: "i" },
    });
    const newProducts = await Product.find().sort({ createdAt: -1 }).limit(4);
    const newProducts2 = await Product.find().sort({ createdAt: 1 }).limit(4);

    res.render("view-products", { product: productData, abc: log, cate ,newProducts,newProducts2});
  } catch (error) {
    console.log(error.message);
  }
};

// Function for the user to view their profile ----------------------------
const viewProfile = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const cate = await Category.find();
      const userData = await User.findById({ _id: req.session.userid });
      res.render("view-profile", { user: userData, cate });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Function for the user to view their wishlist----------------------------

const viewWishlist = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const cate = await Category.find();
      const id = req.session.userid;
      const userWishlist = await Wishlist.findOne({ user: id }).populate(
        "products"
      );

      if (userWishlist) {
        if (userWishlist.products.length > 0) {
          const products = userWishlist.products;

          res.render("view-wishlist", { products, cate });
        } else {
          res.render("wishlist-empty", { cate });
        }
      } else {
        res.render("wishlist-empty", { cate });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewCart = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const cate = await Category.find();
      const id = req.session.userid;
      let total = 0;
      const userCart = await Cart.findOne({ user: id }).populate(
        "products.productId"
      );
      if (userCart) {
        if (userCart.products.length > 0) {
          const products = userCart.products;
          total = await Cart.aggregate([
            {
              $match: { user: ObjectId(id) },
            },
            {
              $unwind: "$products",
            },
            {
              $project: {
                price: "$products.productPrice",
                quantity: "$products.quantity",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$quantity", "$price"] } },
              },
            },
          ]).exec();

          var Total = total[0].total;
          res.render("view-cart", { products, userid: id, Total, cate });
        } else {
          res.render("cart-empty", { cate });
        }
      } else {
        res.render("cart-empty", { cate });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const viewOrders = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const cate = await Category.find();
      const userid = req.session.userid;
      const orders = await Order.find({ userId: userid }).sort({ Date: -1 }).exec();

      console.log(orders);
      res.render("view-orders", { orders, cate });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editProfile = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const cate = await Category.find();
      const id = req.query.id;
      const userData = await User.findById({ _id: id });
      if (userData) {
        res.render("edit-profile", { user: userData, cate });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.body.userid },
      {
        $set: {
          username: req.body.username,
          mobilenumber: req.body.mobilenumber,
          gender: req.body.gender,
          dob: req.body.dob,
        },
      }
    );
    res.redirect("/view-profile");
  } catch (error) {
    console.log(error.message);
  }
};


const addtocart = async (req, res) => {
  try {
    const proid = req.body.id;
    const productt = await Product.findById({ _id: proid });
    const price = productt.price;

    if (req.session.userlogged) {
      const userid = req.session.userid;
      const userCart = await Cart.findOne({ user: ObjectId(userid) });
      if (userCart) {
        const proExist = await userCart.products.findIndex(
          (product) => product.productId == proid
        );

        if (proExist != -1) {
          await Cart.updateOne(
            { user: userid, "products.productId": proid },
            { $inc: { "products.$.quantity": 1 } }
          );
        } else {
          await Cart.findOneAndUpdate(
            { user: ObjectId(userid) },
            { $push: { products: { productId: proid, productPrice: price } } }
          );
          console.log("added to cart");
        }
      } else {
        const newCart = new Cart({
          user: userid,
          products: [{ productId: proid, productPrice: price }],
        });
        newCart.save();
        console.log("new cart created");
      }
    } else {
      console.log("elseworking");
      res.render("pleaselogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addtowishlist = async (req, res) => {
  try {
    const proid = req.body.id;
    console.log(proid);
    if (req.session.userlogged) {
      const userid = req.session.userid;
      const userWishList = await Wishlist.findOne({ user: ObjectId(userid) });
      if (userWishList) {
        const wishlist = await Wishlist.findOne({
          user: ObjectId(userid),
          products: ObjectId(proid),
        });
        if (wishlist) {
        } else {
          await Wishlist.findOneAndUpdate(
            { user: ObjectId(userid) },
            { $push: { products: proid } }
          );
        }
        console.log("added to wishlist");
      } else {
        const newWishlist = new Wishlist({
          user: userid,
          products: [proid],
        });
        newWishlist.save();
      }
      console.log("added to new wishlist");
    } else {
      res.render("pleaselogin");
    }

    const Check = await Product.find({ _id: proid, category: "Women" });
    if (Check) {
      res.redirect("/view-women");
    } else {
      res.redirect("/view-men");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const productView = async (req, res) => {
  try {
    const cate = await Category.find();
    const product = await Product.findById(req.query.id);

    let log;
    if (req.session.userlogged) {
      log = "loggedin";
    } else {
      log = "loggedout";
    }
    res.render("single", { product, abc: log, cate });
  } catch (error) {
    console.log("error");
  }
};
const viewCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.query.id);
    const newProducts = await Product.find().sort({ createdAt: -1 }).limit(4);
    const newProducts2 = await Product.find().sort({ createdAt: 1 }).limit(4);
    const category = cat.name;
    const cate = await Category.find();
    const product = await Product.find({ category: category });
    let log;
    if (req.session.userlogged == true) {
      log = "logedin";
    } else {
      log = "loggedout";
    }
    console.log("category loaded");   
    res.render("view-products", {
      product,
      cate,
      newProducts,
      newProducts2,     
      abc: log,
    }); 
    
  
  } catch (error) {
    console.log(error.message);
  }
     
}   
      
const deleteWishlistItem = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const userId = req.session.userid;
      const proId = req.body.id;
      await Wishlist.updateOne(
        { user: ObjectId(userId) },
        { $pull: { products: proId } }
      );
      res.json({ success: true });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const userId = req.session.userid;
      const proId = req.body.id;
      console.log(proId);
      await Cart.updateOne(
        { user: ObjectId(userId) },
        { $pull: { products: { productId: ObjectId(proId) } } }
      );
      res.json({ success: true });
      res.redirect("/view-cart");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const changeProQnty = async (req, res) => {
  try {
    const userid = req.body.user;
    const proid = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    if (req.session.userlogged) {
      await Cart.updateOne(
        { user: userid, "products.productId": proid },
        { $inc: { "products.$.quantity": count } }
      );
      res.json({ success: true });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const cate = await Category.find();
    if (req.session.userlogged) {
      const userid = req.session.userid;

      const total = await Cart.aggregate([
        {
          $match: { user: ObjectId(userid) },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            price: "$products.productPrice",
            quantity: "$products.quantity",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ]).exec();
      var Total = total[0].total;
      const addresses = await User.aggregate([
        {
          $match: { _id: ObjectId(userid) },
        },
        {
          $unwind: "$address",
        },
        {
          $project: {
            _id: 0,
            address: 1,
          },
        },
      ]);
      res.render("placeorder", { Total, userid, addresses, cate });
      console.log(addresses[1].address.name);
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/')
  }
};

const orderPlaced = async (req, res) => {
  try {
    const cate = await Category.find();
    if (req.session.userlogged) {
      res.render("order-placed", { cate });
    } else {
      res.redirect('/')
    }
  } catch (error) {
    console.log(error.message);
    res.redirect('/')
  }
};
const viewOrderProducts = async (req, res) => {
  try {
    const cate = await Category.find();
    const orderId = req.query.id;
    console.log("order id : " + orderId);
    const orderData = await Order.findOne({ _id: ObjectId(orderId) }).populate(
      "products.productId"
    );
    console.log(orderData);
    const products = orderData.products;
    res.render("view-order-products", { products, cate, orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const viewAddAddress = async (req, res) => {
  try {
    const cate = await Category.find();
    if (req.session.userlogged) {
      res.render("add-address", { cate });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addAddress = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const userid = req.query.id;
      console.log(userid);
      await User.findByIdAndUpdate(
        { _id: ObjectId(userid) },
        {
          $push: {
            address: {
              name: req.body.name,
              district: req.body.district,
              state: req.body.state,
              pin: req.body.pin,
              phone: req.body.phone,
            },
          },
        }
      );
      res.redirect("/place-order");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const userid = req.session.userid;

      const id = req.query.id;
      console.log(id);
      await User.updateOne(
        { _id: userid },
        { $pull: { address: { _id: id } } }
      );
      res.redirect("place-order");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const postplaceOrder = async (req, res) => {
  try {
    if (req.session.userlogged) {
      const gtotal = req.body.amount;
      const address = req.body.address;
      const paymod = req.body.paymod;

      const userid = req.session.userid;
      const cart = await Cart.findOne({ user: userid });
      const products = cart.products;

      const status = paymod === "COD" ? "placed" : "pending";
      const newOrder = new Order({
        deliveryDetails: address,
        userId: ObjectId(userid),
        paymentMethod: paymod,
        products: products,
        totalAmount: gtotal,
        Date: new Date(),
        status: status,
      });
      newOrder.save();
      const orderid = newOrder._id;
      const totalAmount = newOrder.totalAmount;
      await Cart.deleteOne({ user: userid });
      if (status === "placed") {
        res.json({ codSuccess: true });
      } else {
        console.log("entered razorpay");
        var options = {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: "" + orderid,
        };
        instance.orders.create(options, function (err, order) {
          res.json({ order });
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.render('404')
    res.redirect('/')
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const details = req.body;
    const secret = "oUuPVJbRDxl7t2HLGn4J6SiJ";
    const crypto = require("crypto");
    console.log("here is verifypayment");
    const hmac_sha256 = (data, secret) => {
      return crypto.createHmac("sha256", secret).update(data).digest("hex");
    };

    const generated_signature = hmac_sha256(
      details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'],
      secret
    );

    console.log(details['order[receipt]']);
      console.log("here it isss"+details["payment[razorpay_payment_id]"]);
    if (generated_signature == details['payment[razorpay_signature]']) {
      await Order.findByIdAndUpdate(
        { _id: details['order[receipt]'] },
        { $set: { status: "placed" } }
      );
      await Order.findByIdAndUpdate(
        { _id: details["order[receipt]"] },
        { $set: { paymentId: details["payment[razorpay_payment_id]"] } }
      );
      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove({ _id: details["order[receipt]"] });
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const changePaymentStat = async (req, res) => {
  try {
    await Order.updateOne(
      { _id: ObjectId() },
      {
        $set: {
          status: "placed",
        },
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

const reset = async (req, res) => {
  try {
    res.render("reset");
  } catch (error) {
    console.log(error.message);
  }
};

const postReset = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === "0") {
        res.render("reset", { message: "Please verify your mail." });
      } else {
        const randomString = randomstring.generate();
        await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetMail(userData.username, userData.email, randomString);
        res.render("reset", { message: "Check mail to reset password" });
      }
    } else {
      res.render("reset", { message: "Invalid user name" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const sendResetMail = async (username, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "Amdazzlin01@gmail.com",
        pass: "nrpwenypdsjihpru",
      },
    });
    const mailOptions = {
      from: "Amdazzlin01@gmail.com",
      to: email,
      subject: "for reset password",
      html:
        "<p>Hi " +
        username +
        ', please click here to <a href="http://127.0.0.1:3000/forget-password?token=' +
        token +
        '"> Reset </a> your password </p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "Token is invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const userId = req.body.user_id;
    console.log(password, userId);
    const secure_password = await securepassword(password);
    await User.findByIdAndUpdate(
      { _id: ObjectId(userId) },
      { $set: { password: secure_password, token: "" } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const code = req.body.code;
    const total = req.body.total;
    const userid = req.session.userid;

    const checkCode = await Coupon.findOne({ code: code });

    if (checkCode) {
      if (checkCode.users.length < checkCode.maxUsers) {
        if (total >= checkCode.minAmount) {
          await Coupon.updateOne({ code: code }, { $push: { users: userid } });
          const grandTotal = total - checkCode.discount;
          res.json({ success: true, grandTotal: grandTotal });
        }
      } else {
        res.json({success:false})
      }
    } else {
      res.json({ success: false });

    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadSignup,
  insertUser,
  loadLogin,
  verifyUser,
  loadHome,
  userLogout,
  verifyMail,
  loadOTP,
  sendOTP,
  verifyOTP,
  loadverifyOTP,
  viewProducts,
  viewProfile,
  viewWishlist,
  viewCart,
  viewOrders,
  editProfile,
  updateProfile,
  addtocart,
  productView,
  addtowishlist,
  deleteWishlistItem,
  deleteCartItem,
  changeProQnty,
  placeOrder,
  postplaceOrder,
  orderPlaced,
  viewOrderProducts,
  viewAddAddress,
  addAddress,
  deleteAddress,
  verifyPayment,
  changePaymentStat,
  reset,
  postReset,
  sendResetMail,
  forgetPasswordLoad,
  resetPassword,
  applyCoupon,
  viewCategory,
};
