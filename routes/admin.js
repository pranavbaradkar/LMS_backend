const express = require("express");
const router = express.Router();
var Passport = require('passport').Passport,
adminPassport = new Passport();
const AdminController = require("../controllers/admin/index.controller");
const MasterController = require("../controllers/admin/master.controller");
const AssessmentController = require("../controllers/admin/assessment.controller");

const DashboardController = require("../controllers/admin/dashboard.controller");
const UserAssessmentController = require("../controllers/user/assessment.controller");

const  QuestionController = require("../controllers/admin/question.controller");
const  UserController = require("../controllers/admin/user.controller");
const  CampaignController = require("../controllers/admin/campaign.controller");
const  RoleController = require("../controllers/admin/role.controller");
const  MetaController = require("../controllers/meta.controller");
require("../middleware/admin-auth")(adminPassport);

// ********************* ADMIN ROUTES **************************
router.get("/", adminPassport.authenticate("jwt", { session: false }), AdminController.get); // R
router.post("/", AdminController.create); 
router.post("/login", AdminController.login); 
router.put("/update",adminPassport.authenticate("jwt", { session: false }), AdminController.update); 

// ********************* Meta ROUTES **************************
router.post('/meta/:table', adminPassport.authenticate("jwt", { session: false }), MasterController.createMeta);
router.put('/meta/:table/:id', adminPassport.authenticate("jwt", { session: false }), MasterController.updateMeta);
router.delete('/meta/:table/:id', adminPassport.authenticate("jwt", { session: false }), MasterController.deleteMeta);
router.delete('/bulk/meta/:table', adminPassport.authenticate("jwt", { session: false }), MasterController.bulkDeleteMeta);

router.get('/exports/meta/:table', adminPassport.authenticate("jwt", { session: false }), MetaController.exportMeta);

// ********************* Assessment ROUTES **************************
router.get("/assessments/dashboard",adminPassport.authenticate("jwt", { session: false }), DashboardController.getDashboardData); 
router.post("/assessments",adminPassport.authenticate("jwt", { session: false }), AssessmentController.createAssessment); 
router.post("/assessments/:assessment_id/configurations/:assessment_type",adminPassport.authenticate("jwt", { session: false }), AssessmentController.createAssessmentConfiguration); 

router.get("/assessments/:assessment_id/configurations",adminPassport.authenticate("jwt", { session: false }), AssessmentController.getAssessmentConfiguration); 

router.get("/assessments/:assessment_id/configurations/:assessment_type/questions",adminPassport.authenticate("jwt", { session: false }), AssessmentController.getAssessmentConfigurationQuestions); 


router.get("/assessments",adminPassport.authenticate("jwt", { session: false }), AssessmentController.getAllAssessments); 
router.get("/assessments/:assessment_id",adminPassport.authenticate("jwt", { session: false }), AssessmentController.getAssessment);
router.get("/assessments/:assessment_id/configurations/:assessment_type/users",adminPassport.authenticate("jwt", { session: false }), AssessmentController.getAssessmentConfigurationUsers);
router.put("/update/assessments/:assessment_id",adminPassport.authenticate("jwt", { session: false }), AssessmentController.updateAssessment); 
router.delete("/delete/assessments/:assessment_id", adminPassport.authenticate("jwt", { session: false }), AssessmentController.deleteAssessment); 
router.delete("/bulk/assessments", adminPassport.authenticate("jwt", { session: false }), AssessmentController.deleteBulkAssessment); 


router.post("/assessments/inventory/block/:user_id", AssessmentController.blockSchoolInventory); 

//  ********************* User result **************************
router.get("/result/assessments/:assessment_id", adminPassport.authenticate("jwt", { session: false }), AssessmentController.userAssessmentsResult);

router.post("/result/user_assessments/:assessment_type", UserAssessmentController.recursiveResultSend);
router.post("/assessments/publish/result", adminPassport.authenticate("jwt", { session: false }), AssessmentController.setAssessmentAnalytics);

// ********************* QUESTION ROUTES **************************
router.post("/bypass/questions", QuestionController.createQuestion);

router.post("/questions",adminPassport.authenticate("jwt", { session: false }), QuestionController.createQuestion); 
router.get("/questions",adminPassport.authenticate("jwt", { session: false }), QuestionController.getAllQuestions); 
router.get("/questions/:question_id",adminPassport.authenticate("jwt", { session: false }), QuestionController.getQuestion);
router.put("/questions/:question_id",adminPassport.authenticate("jwt", { session: false }), QuestionController.updateQuestion); 
router.delete("/questions/:question_id", adminPassport.authenticate("jwt", { session: false }), QuestionController.deleteQuestion);
router.post("/questions/filter/:type",adminPassport.authenticate("jwt", { session: false }), QuestionController.getFilterQuestion);
router.post("/questions/import",adminPassport.authenticate("jwt", { session: false }), QuestionController.questionImport);
router.delete("/bulk/questions", adminPassport.authenticate("jwt", { session: false }), QuestionController.deleteBulkQuestion); 
router.post("/lo_bank/import",adminPassport.authenticate("jwt", { session: false }), QuestionController.loBankImport);
router.post("/psychometry/import",adminPassport.authenticate("jwt", { session: false }), QuestionController.importPsychometry);

// ********************* Roles ROUTES **************************
router.post("/roles",adminPassport.authenticate("jwt", { session: false }), RoleController.createRole); 
router.get("/roles",adminPassport.authenticate("jwt", { session: false }), RoleController.getAllRoles); 
router.get("/roles/:role_id",adminPassport.authenticate("jwt", { session: false }), RoleController.getRole);
router.put("/roles/:role_id",adminPassport.authenticate("jwt", { session: false }), RoleController.updateRole); 
router.delete("/roles/:role_id", adminPassport.authenticate("jwt", { session: false }), RoleController.deleteRole);

// ********************* Roles Users ROUTES **************************
router.post("/role/users",adminPassport.authenticate("jwt", { session: false }), AdminController.createRoleUsers);
router.get("/role/users",adminPassport.authenticate("jwt", { session: false }), AdminController.getAllRoleUsers); 
router.get("/role/users/:user_id",adminPassport.authenticate("jwt", { session: false }), AdminController.getRoleUser);
router.put("/role/users/:user_id",adminPassport.authenticate("jwt", { session: false }), AdminController.updateRoleUser); 
router.delete("/role/users/:user_id", adminPassport.authenticate("jwt", { session: false }), AdminController.deleteRoleUser);

// ********************* Standard user ROUTES **************************
router.get("/users/recommendation",adminPassport.authenticate("jwt", { session: false }), UserController.getUserRecommendation);
router.get("/users/details/:user_id",adminPassport.authenticate("jwt", { session: false }), UserController.getUserDetails);
router.post("/users",adminPassport.authenticate("jwt", { session: false }), UserController.createUser);
router.put("/users/:user_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateUser);

router.delete("/bulk/users", adminPassport.authenticate("jwt", { session: false }), UserController.bulkDeleteUser);


router.delete("/users/:user_id", adminPassport.authenticate("jwt", { session: false }), UserController.deleteUser);
router.get("/users/list",adminPassport.authenticate("jwt", { session: false }), UserController.getAllUsers);
router.get("/users/assessments/:assessment_id",adminPassport.authenticate("jwt", { session: false }), UserController.getUsersAssessments);
router.post("/users/invite/:user_id", adminPassport.authenticate("jwt", { session: false }), UserController.inviteUser);
router.get("/users/:user_id/:details_type",adminPassport.authenticate("jwt", { session: false }), UserController.getUsersProfileDetails);
router.put("/users/:user_id/academics/:academic_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateUserAcademicDetails);
router.put("/users/:user_id/professional-infos/:professional_info_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateProfessionalInfoDetails);
router.post("/user/:user_id/interview",adminPassport.authenticate("jwt", { session: false }), UserController.userInterviewFeedback);
router.get("/user/:user_id/interview/:assessment_id",adminPassport.authenticate("jwt", { session: false }), UserController.getUserInterview);

// ********************* CAMPAIGN **************************
router.post("/campaigns", adminPassport.authenticate("jwt", { session: false }), CampaignController.createCampaigns);
router.get("/campaigns", adminPassport.authenticate("jwt", { session: false }), CampaignController.getAllUserCampaigns);


router.get("/campaigns/dashboard", adminPassport.authenticate("jwt", { session: false }), DashboardController.getCampaignDashboard);
router.post("/campaigns/assessments", adminPassport.authenticate("jwt", { session: false }), CampaignController.getCampaignAssessment);


router.get("/campaigns/:campaign_id", adminPassport.authenticate("jwt", { session: false }), CampaignController.getUserCampaign);
router.put("/campaigns/:campaign_id", adminPassport.authenticate("jwt", { session: false }), CampaignController.updateUserCampaign);
router.delete("/campaigns/:campaign_id", adminPassport.authenticate("jwt", { session: false }), CampaignController.deleteUserCampaign);

// ********************* User Import **************************
router.post("/users/import", adminPassport.authenticate("jwt", { session: false }), UserController.userImport);
router.post("/users/pref_import", adminPassport.authenticate("jwt", { session: false }), UserController.updateUserPreference);
router.post("/schools/import", adminPassport.authenticate("jwt", { session: false }), UserController.schoolsImport);
router.post("/schools/inventory/import", adminPassport.authenticate("jwt", { session: false }), UserController.schoolsInventoryImport);


// ********************* District import **************************
router.post('/locations/district/import', adminPassport.authenticate("jwt", { session: false }), MasterController.locationDistrictMasterImport);
router.post('/locations/taluka/import', adminPassport.authenticate("jwt", { session: false }), MasterController.locationTalukasMasterImport);
router.post('/locations/cities/import', adminPassport.authenticate("jwt", { session: false }), MasterController.locationTalukasCitiesMasterImport);

module.exports = router;

