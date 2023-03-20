const User = require("../models/user-model");
const Product = require("../models/product-model");
const Category = require("../models/category-model");
const Order = require("../models/order-model");
const Categories = require("../models/category-model");
const Coupon = require("../models/coupon-model");
const { ObjectId } = require("mongodb");
const excelJS = require("exceljs");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

const loadadminLogin = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      res.redirect("/admin/admin-dashboard");
    } else { 
      res.render("admin-login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminDashboard = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const placed = await Order.countDocuments({ status: "placed" });
      const pending = await Order.countDocuments({ status: "pending" });
      const users = await User.countDocuments();
      const products = await Product.countDocuments();
      const categories = await Categories.countDocuments();
      const orders = await Order.find().sort({ Date: -1 }).limit(3);
      let total = 0;
      total = await Order.aggregate([
        {
          $match: {
            status: "placed",
          },      
        },

        {
          $group: {
            _id: null,     
            total: { $sum: "$totalAmount" },
          },
        },
      ]).exec();

      var Total = total[0]?.total;
      console.log(Total); 
      console.log(pending);   
       
        
      res.render("admin-dashboard", {
        placed,
        pending,
        orders,
        categories,
        users,
        products,  
        Total,
      }); 
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminOrders = async (req, res) => {
  if (req.session.adminlogged) {
    const orders = await Order.find().sort({ Date: -1 });

    res.render("admin-orders", { orders });
  } else {
    res.redirect("/admin");
  }
};

const adminUsers = async (req, res) => {
  if (req.session.adminlogged) {
    const usersData = await User.find();
    res.render("admin-users", { users: usersData });
  } else {
    res.redirect("/admin");
  }
};
const adminProducts = async (req, res) => {
  if (req.session.adminlogged) {
    const productsData = await Product.find();
    res.render("admin-products", { products: productsData });
  } else {
    res.redirect("/admin");
  }
};
const adminReports = async (req, res) => {
  if (req.session.adminlogged) {
    res.render("admin-reports");
  } else {
    res.redirect("/admin");
  }
};

const admins = {
  email: "admin@gmail.com",
  password: "12345",
};

const verifyAdmin = async (req, res) => {
  try {
    if (
      req.body.email == admins.email &&
      req.body.password == admins.password
    ) {
      req.session.adminlogged = true;
      res.redirect("/admin/admin-dashboard");
    } else {
      res.render("admin-login", { message: "adminname or password incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  req.session.adminlogged = false;
  res.redirect("/admin");
};

const blockUser = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;
      const userData = await User.findOne({ _id: ObjectId(id) });
      if (userData.block === "true") {
        await User.updateOne({ _id: id }, { $set: { block: false } });
      } else {
        await User.updateOne({ _id: id }, { $set: { block: true } });
      }
      res.redirect("/admin/admin-users");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const categories = await Category.find();
      res.render("add-product", { categories });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const addNewProduct = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      await Category.find();
      const products = await Product.findOne({
        productname: req.body.proname,
      });

      if (products) {
        const categories = await Category.find();
        res.render("add-product", {
          categories,
          message: "Product already exists",
        });
      } else {
        const image = [];
        for (i = 0; i < req.files.length; i++) {
          image[i] = req.files[i].filename;
        }
        const product = new Product({
          productname: req.body.proname,
          image: image,
          category: req.body.procategory,
          price: req.body.proprice,
          stock: req.body.prostock,
          status: req.body.prostatus,
          description: req.body.prodes,
          discount: req.body.prodiscount,
        });
        await product.save();
        res.redirect("/admin/add-product");
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.body.id;
      const productData = await Product.findOne({ _id: ObjectId(id) });
      if (productData.deleted === "true") {
        await Product.updateOne({ _id: id }, { $set: { deleted: false } });
      } else {
        await Product.updateOne({ _id: id }, { $set: { deleted: true } });
      }

      res.json({ success: true });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;
      const productData = await Product.findById({ _id: id });
      const categories = await Category.find()

      if (productData) {
        res.render("edit-product", { product: productData , categories});
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      if (req.files) {
        const image = [];
        for (i = 0; i < req.files.length; i++) {
          image[i] = req.files[i].filename;
        }
        await Product.findByIdAndUpdate(
          { _id: req.body.productid },
          {
            $set: {
              productname: req.body.proname,
              category: req.body.procategory,
              price: req.body.proprice,
              stock: req.body.prostock,
              status: req.body.prostatus,
              description: req.body.prodes,
              image: image,
            },
          }
        );
      } else {
        await Product.findByIdAndUpdate(
          { _id: req.body.productid },
          {
            $set: {
              productname: req.body.proname,
              category: req.body.procategory,
              price: req.body.proprice,
              stock: req.body.prostock,
              status: req.body.prostatus,
              description: req.body.prodes,
            },
          }
        );
      }
      res.redirect("/admin/admin-products");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminCategory = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const catData = await Category.find();
      res.render("category", { catData });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const viewAddCat = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      res.render("add-category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const checkCat = await Category.findOne({ name: req.body.categoryname });
      if (checkCat) {
        res.render("add-category", { message: "Category already exists" });
      } else {
        const name = req.body.categoryname;
        const newCat = new Category({
          name: name,
        });

        newCat.save();
        res.redirect("/admin/admin-category");
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;
      await Category.deleteOne({ _id: id });
      res.redirect("/admin/admin-category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewEditCategory = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;

      const catData = await Category.findById({ _id: id });
      if (catData) {
        res.render("edit-category", { catData });
      } else {
        res.redirect("/admin/admin-category");
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;
      const checkCat = await Category.findOne({ name: req.body.categoryname });
      if (checkCat) {
      const catData = await Category.findById({ _id: id });

        res.render("edit-category", { message: "Category already exists",catData });
      } else {
        await Category.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              name: req.body.categoryname,
            },
          }
        );
      }
      res.redirect("/admin/admin-category");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orderDetails = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const orderId = req.query.id;
      const orderData = await Order.findOne({
        _id: ObjectId(orderId),
      }).populate("products.productId");

      const products = orderData.products;
      const userId = orderData.userId;
      const userData = await User.findOne({ _id: ObjectId(userId) });
      res.render("orderdetails", { products, userData, orderData });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const exportUsers = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("My Users");
      worksheet.columns = [
        { header: "S no.", key: "s_no" },
        { header: "Name", key: "username" },
        { header: "Email", key: "email" },
        { header: "Mobile No", key: "mobilenumber" },
        { header: "Gender", key: "gender" },
        { header: "Verified", key: "is_verified" },
        { header: "Block", key: "block" },

        { header: "Address", key: "address" },
      ];

      let counter = 1;
      const userData = await User.find();
      userData.forEach((user) => {
        user.s_no = counter;
        worksheet.addRow(user);
        counter++;
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
      return workbook.xlsx.write(res).then(() => {
        res.status(200);
      });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const exportOrders = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "S no.", key: "s_no" },
      { header: "UserId", key: "userId" },
      { header: "Delivery", key: "deliveryDetails" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Products", key: "products" },
      { header: "Amount", key: "totalAmount" },
      { header: "Date", key: "Date" },
      { header: "Status", key: "status" },
    ];

    let counter = 1;
    const OrderData = await Order.find();
    OrderData.forEach((order) => {
      order.s_no = counter;
      worksheet.addRow(order);
      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.log(error.message);
  }
};

const adminCoupon = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const coupons = await Coupon.find();
      res.render("admin-coupon", { coupons });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewAddCoupon = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      res.render("add-coupon");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const checkCode = await Coupon.findOne({ code: req.body.code });
      if (checkCode) {
        res.render("add-coupon", { message1: "Coupon already exists" });
      } else {
        const code = req.body.code;
        const newCoupon = new Coupon({
          code: code,
          discount: req.body.discount,
          maxUsers: req.body.maxuser,
          minAmount: req.body.minam,
        });
        newCoupon.save();
        res.redirect("/admin/admin-coupon");
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewEditCoupon = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const id = req.query.id;
      const couponData = await Coupon.findOne({ _id: ObjectId(id) });
      res.render("edit-coupon", { data: couponData });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editCoupon = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const checkCode = await Coupon.findOne({ code: req.body.code });
      if (checkCode) {
        const id = req.query.id;
        const couponData = await Coupon.findOne({ _id: ObjectId(id) });
        res.render("edit-coupon", {
          message1: "Coupon already exists",
          data:couponData,
        });
      } else {
        await Coupon.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              code: req.body.code,
              discount: req.body.discount,
              maxUsers: req.body.maxuser,
              minAmount: req.body.minam,
            },
          }
        );
      }
      res.redirect("/admin/admin-coupon");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const adminSales = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const allOrders = await Order.find({ status: "placed" }).sort({
        Date: -1,
      });
      res.render("admin-reports", { orders: allOrders });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const exportSales = async (req, res) => {
  try {
    if (req.session.adminlogged) {
      const orders = await Order.find({ status: "placed" }).sort({ Date: -1 });
      const data = {
        orders: orders,
      };
      const filePathName = path.resolve(
        __dirname,
        "../views/admin/htmltopdf.ejs"
      );
      const htmlString = fs.readFileSync(filePathName).toString();
      let options = {
        format: "Letter",
      };
      const ejsData = ejs.render(htmlString, data);
      pdf
        .create(ejsData, options)
        .toFile("salesReport.pdf", (err, response) => {
          if (err) {
            console.log(err);
          }
          console.log("file generated");

          const filePath = path.resolve(__dirname, '../salesReport.pdf')

          fs.readFile(filePath, (err, file) => {
            if (err) {
              console.log(err);
              return res.status(500).send('could not download file');
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment;filename="salesReport.pdf"');
            res.send(file);
          })
        });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadadminLogin,
  verifyAdmin,
  adminLogout,
  adminDashboard,
  adminOrders,
  adminUsers,
  adminProducts,
  adminReports,
  blockUser,
  addProduct,
  addNewProduct,
  deleteProduct,
  loadEditProduct,
  editProduct,
  adminCategory,
  addCategory,
  deleteCategory,
  viewAddCat,
  editCategory,
  viewEditCategory,
  orderDetails,
  exportUsers,
  exportOrders,
  adminCoupon,
  viewAddCoupon,
  addCoupon,
  viewEditCoupon,
  editCoupon,
  adminSales,
  exportSales,
};
