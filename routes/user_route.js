const express = require("express");
const userRoute = express();
const bodyParser = require("body-parser");
const userController = require("../controllers/user_controller");
const session = require("express-session");
const oneDay = 1000 * 60 * 60 * 24;

userRoute.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/user");

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));
userRoute.use((req, res, next) => {
  res.set("cache-Control", "no-store");
  next();
});





//-----------------------------------GET----------------------------------------------------------

userRoute.get("/", userController.loadHome);
userRoute.get("/logout", userController.userLogout);
userRoute.get("/verify", userController.verifyMail);
userRoute.get("/viewProducts", userController.viewProducts);
userRoute.get("/view-Men", userController.viewMen);
userRoute.get("/view-Women", userController.viewWomen);
userRoute.get("/view-wishlist",userController.viewWishlist);
userRoute.get("/view-cart",userController.viewCart);
userRoute.get("/view-orders", userController.viewOrders);
userRoute.get("/product-view", userController.productView);
userRoute.get('/place-order', userController.placeOrder);
userRoute.get("/order-placed", userController.orderPlaced);
userRoute.get("/view-order-products", userController.viewOrderProducts);
userRoute.get("/delete-address", userController.deleteAddress);
userRoute.get("/view-category", userController.viewCategory);







//-----------------------------------POST-----------------------------------------------------------

userRoute.post('/apply-coupon',userController.applyCoupon)
userRoute.post("/place-order", userController.postplaceOrder);
userRoute.post("/add-to-cart", userController.addtocart);
userRoute.post("/change-product-quantity",userController.changeProQnty);
userRoute.post("/verify-payment", userController.verifyPayment);
userRoute.post("/add-to-wishlist", userController.addtowishlist);
userRoute.post("/delete-wishlistitem", userController.deleteWishlistItem);
userRoute.post("/delete-cartitem", userController.deleteCartItem);








//---------------------------------GET and POST----------------------------------------------------

userRoute
  .route("/signup")
  .get(userController.loadSignup)
  .post(userController.insertUser);
userRoute
  .route("/login")
  .get(userController.loadLogin)
  .post(userController.verifyUser);
userRoute
  .route("/otpLogin")
  .get(userController.loadOTP)
  .post(userController.sendOTP);
userRoute
  .route("/verifyOTPpage")
  .get(userController.loadverifyOTP)
  .post(userController.verifyOTP);
userRoute
  .route("/view-profile")
  .get(userController.viewProfile)
  .post(userController.updateProfile);
userRoute
  .route("/add-address")
  .get(userController.viewAddAddress)
  .post(userController.addAddress);
userRoute
  .route("/reset")
  .get(userController.reset)
  .post(userController.postReset);
userRoute
  .route("/forget-password")
  .get(userController.forgetPasswordLoad)
  .post(userController.resetPassword);



module.exports = userRoute;
