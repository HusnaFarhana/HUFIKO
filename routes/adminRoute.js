const express = require('express')
const adminRoute = express()
const bodyParser = require('body-parser')
const adminController = require('../controllers/adminController')
const session = require("express-session");
const multer = require('multer')
const oneDay = 1000 * 60 * 60 * 24;
const path = require('path')


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/product-images'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})


const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/webp" 
      
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg .webp format allowed!"));
    }
  },
});
// const multipleUpload = upload.fields([{ name: "proimage", maxCount:3 }]);

adminRoute.use(session({
    secret: "thisismysecret",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));


adminRoute.set('view engine', 'ejs')
adminRoute.set('views', './views/admin')

adminRoute.use(express.static('public'));
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));
adminRoute.use((req, res, next) => {
    res.set('cache-Control', 'no-store')
    next()
})-


//-----------------------------------GET----------------------------------------------------------
  
adminRoute.get('/admin-dashboard',adminController.adminDashboard)
adminRoute.get('/admin-orders',adminController.adminOrders)
adminRoute.get('/admin-users',adminController.adminUsers)
adminRoute.get('/admin-products',adminController.adminProducts)
adminRoute.get('/admin-logout',adminController.adminLogout)
adminRoute.get("/admin-category", adminController.adminCategory);
adminRoute.get("/add-category", adminController.viewAddCat);
adminRoute.get("/delete-category", adminController.deleteCategory);
adminRoute.get("/edit-category", adminController.viewEditCategory);
adminRoute.get("/order-details", adminController.orderDetails);
adminRoute.get("/export-users", adminController.exportUsers);
adminRoute.get("/export-orders", adminController.exportOrders);
adminRoute.get("/admin-sales", adminController.adminSales);
adminRoute.get("/export-sales",adminController.exportSales);
adminRoute.get("/admin-coupon", adminController.adminCoupon);
adminRoute.get("/block", adminController.blockUser);
adminRoute.get("/unblock", adminController.blockUser);





//-----------------------------------POST-----------------------------------------------------------

adminRoute.post("/add-category", adminController.addCategory);
adminRoute.post("/delete-product", adminController.deleteProduct);
adminRoute.post("/edit-category", adminController.editCategory);





//---------------------------------GET and POST----------------------------------------------------

adminRoute
  .route('/')
  .get(adminController.loadadminLogin)
  .post(adminController.verifyAdmin)
adminRoute
  .route('/add-product')
  .get(adminController.addProduct)
  .post(upload.array('proimage', 2),adminController.addNewProduct)
adminRoute
  .route('/edit-product')
  .get(adminController.loadEditProduct)
  .post(upload.array('proimage',2),adminController.editProduct)
adminRoute
  .route('/add-coupon')
  .get(adminController.viewAddCoupon)
  .post(adminController.addCoupon)
adminRoute
  .route('/edit-coupon')
  .get(adminController.viewEditCoupon)
  .post(adminController.editCoupon)


module.exports = adminRoute