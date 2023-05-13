const express = require("express");
const router = express.Router();
var Passport = require('passport').Passport,
adminPassport = new Passport();
const AdminController = require("../controllers/admin/index.controller");
const MasterController = require("../controllers/admin/master.controller");

const DashboardController = require("../controllers/admin/dashboard.controller");
const  UserController = require("../controllers/admin/user.controller");
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
router.post("/users",adminPassport.authenticate("jwt", { session: false }), UserController.createUser);
router.put("/users/:user_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateUser);


router.delete("/bulk/users", adminPassport.authenticate("jwt", { session: false }), UserController.bulkDeleteUser);


router.delete("/users/:user_id", adminPassport.authenticate("jwt", { session: false }), UserController.deleteUser);
router.get("/users/list",adminPassport.authenticate("jwt", { session: false }), UserController.getAllUsers);
router.post("/users/invite/:user_id", adminPassport.authenticate("jwt", { session: false }), UserController.inviteUser);
router.get("/users/:user_id/:details_type",adminPassport.authenticate("jwt", { session: false }), UserController.getUsersProfileDetails);
router.put("/users/:user_id/academics/:academic_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateUserAcademicDetails);
router.put("/users/:user_id/professional-infos/:professional_info_id",adminPassport.authenticate("jwt", { session: false }), UserController.updateProfessionalInfoDetails);

// ********************* User Import **************************
router.post("/users/import", adminPassport.authenticate("jwt", { session: false }), UserController.userImport);

module.exports = router;

