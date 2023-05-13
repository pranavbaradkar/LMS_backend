const express = require("express");
const router = express.Router();

const admin = require("./admin");
// controllers
const UserController = require("../controllers/user/user.controller");
const HomeController = require("../controllers/home.controller");
// custom middleware
const custom = require("./../middleware/custom");
const path = require("path");

var Passport = require('passport').Passport,
userPassport = new Passport();

require("./../middleware/passport")(userPassport);

/* GET home page. */
router.get("/", function(req, res, next) {
  res.json({
    status: "success",
    message: "Parcel Pending API",
    data: { version_number: "v1.0.0" }
  });
});
router.get("/dash",userPassport.authenticate("jwt", { session: false }),HomeController.Dashboard);
router.post("/account/verify", HomeController.accountVerify);


// ********************* User Authentication ROUTES **************************
router.post("/auth/generate-otp", UserController.generateOtp);
router.post("/auth/validate-otp", UserController.verifyOtp);

router.post("/auth/login", UserController.login);
router.get("/user", userPassport.authenticate("jwt", { session: false }), UserController.get);
router.put("/user/update",userPassport.authenticate("jwt", { session: false }), UserController.update); 
router.post("/user/otp/generate", userPassport.authenticate("jwt", { session: false }), UserController.generateUserOtp);
router.post("/user/otp/verify", userPassport.authenticate("jwt", { session: false }), UserController.verifyUserOtp);

//********* API DOCUMENTATION **********  
router.use("/docs/api.json",express.static(path.join(__dirname, "/../public/v1/documentation/api.json")));
router.use("/docs",express.static(path.join(__dirname, "/../public/v1/documentation/dist")));

router.use("/admin", admin);
module.exports = router;
