const express = require("express");
const router = express.Router();
const meta = require("./meta");
const admin = require("./admin");
// controllers
const HomeController = require("../controllers/home.controller");
const UserController = require("../controllers/user/user.controller");
const AssessmentController = require("../controllers/admin/assessment.controller");
const UserAssessmentController = require("../controllers/user/assessment.controller");
// custom middleware
const custom = require("./../middleware/custom");
const path = require("path");

var Passport = require('passport').Passport,
userPassport = new Passport();


const multer = require('multer');
const upload = multer();
const fs = require('fs');

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

// ********************* User ROUTES **************************
router.post("/auth/generate-otp", UserController.generateOtp);
router.post("/auth/validate-otp", UserController.verifyOtp);

router.post("/auth/login", UserController.login);
router.get("/auth/logout",userPassport.authenticate("jwt", { session: false }), UserController.logout);

router.get("/user", userPassport.authenticate("jwt", { session: false }), UserController.get);
router.put("/user/update",userPassport.authenticate("jwt", { session: false }), UserController.update); 
router.post("/user/otp/generate", userPassport.authenticate("jwt", { session: false }), UserController.generateUserOtp);
router.post("/user/otp/verify", userPassport.authenticate("jwt", { session: false }), UserController.verifyUserOtp);


// ********************* User Academics **************************
router.post("/users/academics",userPassport.authenticate("jwt", { session: false }), UserController.createAcademics);
router.post("/users/bulk/academics",userPassport.authenticate("jwt", { session: false }), UserController.createBulkAcademics);
router.get("/users/academics",userPassport.authenticate("jwt", { session: false }), UserController.getAllUserAcademics);
router.get("/users/academics/:academic_id",userPassport.authenticate("jwt", { session: false }), UserController.getUserAcademic);
router.put("/users/academics/:academic_id",userPassport.authenticate("jwt", { session: false }), UserController.updateUserAcademic);
router.delete("/users/academics/:academic_id",userPassport.authenticate("jwt", { session: false }), UserController.deleteUserAcademic);

// ********************* User Professional Info **************************
router.post("/users/professional-infos",userPassport.authenticate("jwt", { session: false }), UserController.createProfessionalInfos);
router.post("/users/bulk/professional-infos",userPassport.authenticate("jwt", { session: false }), UserController.createBulkProfessionalInfos);
router.get("/users/professional-infos",userPassport.authenticate("jwt", { session: false }), UserController.getAllProfessionalInfos);
router.get("/users/professional-infos/:professional_info_id",userPassport.authenticate("jwt", { session: false }), UserController.getProfessionalInfo);
router.put("/users/professional-infos/:professional_info_id",userPassport.authenticate("jwt", { session: false }), UserController.updateProfessionalInfo);
router.delete("/users/professional-infos/:professional_info_id",userPassport.authenticate("jwt", { session: false }), UserController.deleteProfessionalInfo);

// ********************* User Professional Info **************************
router.post("/users/teaching-interests",userPassport.authenticate("jwt", { session: false }), UserController.createUserTeachingInterest);
router.get("/users/teaching-interests",userPassport.authenticate("jwt", { session: false }), UserController.getUserTeachingInterest);
router.get("/users/teaching-interests-names",userPassport.authenticate("jwt", { session: false }), UserController.getUserTeachingInterestNames);




// ********************* user assessment **************************
router.get("/users/recommended-assessment",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getUserRecommendedAssessments);
router.get("/users/assessments",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getUserAssessments);

router.post("/users/communications", userPassport.authenticate("jwt", { session: false }), UserController.userCommunications);
router.get("/users/communications", userPassport.authenticate("jwt", { session: false }), UserController.getUserCommunications);



// ********************* Assessment **************************
router.get("/assessments/:assessment_id",userPassport.authenticate("jwt", { session: false }), AssessmentController.getUserAssessment);
router.get("/assessments/:assessment_id/:type/questions-list",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getScreeningTestDetails);
router.get("/assessments/:assessment_id/:type/question",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.userAssessmentQuestion);
router.post("/assessments/:assessment_id/:type/submit",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.testAnswersSubmit);

// **************************** User Assessment ***********************
router.post("/users/assessment_slot",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.userAssessmentSlot);
router.get("/users/assessment_slot",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getUserAssessmentSlot);


router.get("/users/mains/slots", userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getMainsSlot);
router.post("/users/s3/video", [userPassport.authenticate("jwt", { session: false }), upload.any()], UserAssessmentController.uploadVideoPacd);


router.post("/users/assessments/status",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.statusUserAssessment);
router.put("/users/assessments/:assessment_id/status",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.updateStatusUserAssessment);

router.post("/users/log/assessments/:assessment_id/:assessment_type",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.logAssessment);

router.get("/lobank/questions/:assessment_id",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getQuestionSet);
router.post("/lobank/questions/:assessment_id",userPassport.authenticate("jwt", { session: false }), UserAssessmentController.answerQuestionSet);


router.post("/s3/put-object-url", HomeController.getUserSignedUrl);
router.post("/s3/video/:user_id",upload.any(), HomeController.uploadVideo);
router.get("/result", UserAssessmentController.getAllAssessmentsResult);
router.get("/all/assessments/result", userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getAssessmentsFinalResult);
router.get("/assessments/result/screen", userPassport.authenticate("jwt", { session: false }), UserAssessmentController.getAssessmentResultScreenData);

//********* API DOCUMENTATION **********  
router.use("/docs/api.json",express.static(path.join(__dirname, "/../public/v1/documentation/api.json")));
router.use("/docs",express.static(path.join(__dirname, "/../public/v1/documentation/dist")));

router.use("/meta", meta);
router.use("/admin", admin);

module.exports = router;
