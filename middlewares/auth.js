const isLogin = async (req, res,next) => {
    try {
        if (req.session.userlogged) { }
        else {
            res.redirect('/')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.userlogged) {
          res.redirect('/')
        } else {
            
        }
        next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
    isLogin,
    isLogout
}