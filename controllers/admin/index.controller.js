const { admins, users, roles, schools } = require("../../models");
const { to, ReE, ReS, toSnakeCase } = require('../../services/util.service');
const validator = require('validator');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
var _ = require('underscore');

admins.belongsTo(roles, { foreignKey: 'role_id' });
admins.belongsTo(schools, { foreignKey: 'school_ids' });

const create = async function (req, res) {
  let body = req.body;
  if (!body.first && !body.last) {
    return ReE(res, "Please enter an first name and last name");
  } else if (!body.email) {
    return ReE(res, "Please enter a email to register.");
  } else if (!body.password) {
    return ReE(res, "Please enter a password to register.");
  } else {
    let err, admin;

    [err, adminInfo] = await to(admins.findOne({ 
      where: { email: body.email },
     })); 

    if(adminInfo) {
      return ReE(res, { message: "admin user already exist" }, 422);
    }
   
    if (validator.isEmail(body.email)) {
      [err, admin] = await to(admins.create(body));
      console.log(err);
      if (err) return ReE(res, err, 422);
      return ReS(
        res,
        {
          message: "Successfully created new admin.",
          admin: admin.toWeb(),
          token: admin.getJWT()
        },
        201
      );
    } else {
      return ReE(res, { message: "please enter the valid email" }, 422);
    }
  }
};
module.exports.create = create;

const get = async function (req, res) {
  let admin = req.user;
  let adminData = admin.toWeb();
  [err, roleInfo] = await to(roles.findOne({ where: { id: adminData.role_id }, raw: true }));
  adminData.roles = roleInfo; 
  return ReS(res, { admin: adminData });
};
module.exports.get = get;


const login = async function (req, res) {
  let err, admin, adminInfo;
  let payload = req.body;
  [err, adminInfo] = await to(admins.findOne({ where: { email: payload.email } }));
  if (err) return ReE(res, err, 422);
  if (adminInfo == null) {
    return ReE(res, { message: "Admin user not found" }, 404);
  }
  [err, admin] = await to(adminInfo.comparePassword(payload.password));
  if(admin == null) {
    return ReE(res, { message: "Please enter the valid password" }, 404);
  }
  return ReS(res, { token: admin.getJWT(), admin: admin.toWeb() });
};
module.exports.login = login;

const update = async function (req, res) {
  let err, adminData;
  let payload = req.body;
  try {
    [err, adminData] = await to(admins.findOne({ where: { id: req.user.id } }));
    if (err) return ReE(res, err, 422);
    adminData.update(payload);
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: adminData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.update = update;

const createRoleUsers = async function (req, res) {
  let payload = req.body;
  // let payload = {};
  for (const val in payload) {
    payload[toSnakeCase(val)] = payload[val];
  }
  // payload.school_ids = payload.school_ids
  if (!payload.first) {
    return ReE(res, "Please enter an first name", 422);
  } else if (!payload.title) {
    return ReE(res, "Please select title", 422);
  } else if (!payload.email) {
    return ReE(res, "Please enter a email to register.", 422);
  } else if (!payload.password) {
    return ReE(res, "Please enter a password to register.", 422);
  } else if (!payload.role_id) {
    return ReE(res, "Please select title", 422);
  } else {
    let err, admin;
    [err, adminInfo] = await to(admins.findOne({ where: { email: payload.email } })); 
    if(adminInfo) {
      return ReE(res, { message: "admin user already exist" }, 422);
    }
    if (validator.isEmail(payload.email)) {
      [err, admin] = await to(admins.create(payload));
      console.log(err);
      if (err) return ReE(res, err, 422);
      return ReS(
        res,
        {
          data: admin.toWeb(),
        },
        201
      );
    } else {
      return ReE(res, { message: "please enter the valid email" }, 422);
    }
  }
};
module.exports.createRoleUsers = createRoleUsers;

const getAllRoleUsers = async function (req, res) {
  let err, userData;
  try {
    [err, userData] = await to(admins.findAll(
      {where: {role_type:'USER', is_deleted:false},
      include: [
        { model: roles, attributes: ['id', 'name'] },
        // {model: schools, attributes:['id','name']}
      ],
      order: [
        ['id', 'DESC'],
    ],
    }));
    // console.log("...................",pi);
    // if(userData){
    //   let pi =  userData.map(async (ele,index) =>{
    //     // console.log("''''''''''''''''''''''''",ele);
    //   if(ele.school_ids !== null){
    //     // console.log("......../////////////////////......",ele.school_ids);
    //     [err, findSchools] = await to(schools.findAll({
    //      where:{id: {[Op.in]: ele.school_ids}},
    //      attributes: ['name'],
    //      raw:true
    //     }));
    //     if (err) return ReE(res, err, 422);
    //     console.log("/////////////////////",findSchools);


    //     // if(findSchools.length > 0){
    //       // var ni = findSchools.map(ele => ele.name)
    //       // console.log("....................",ni);
    //     ele.school_ids = findSchools
    //     // }
    //   }
    //   return ele
    //   })
    // }
    if (userData) {
      await Promise.all(
        userData.map(async (ele) => {
          if (ele.school_ids !== null) {
            [err, findSchools] = await to(
              schools.findAll({
                where: { id: { [Op.in]: ele.school_ids } },
                attributes: ['name'],
                raw: true,
              })
            );
            if (err) return ReE(res, err, 422);
            ele.school_ids = findSchools.map((school) => school.name); 
          }
          return ele;
        })
      );
      userData = userData;
    }
    
    if (err) return ReE(res, err, 422);
    if (userData && userData.length > 0) {
      return ReS(res, { data: userData }, 200);
    } else {
      return ReE(res, "No roles data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllRoleUsers = getAllRoleUsers;

const getRoleUser = async function (req, res) {
  let err, roleUserData;
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "User id required in params", 422);
  }
  try {
    [err, roleUserData] = await to(admins.findOne({ 
      where: { id: req.params.user_id },
      include: [
        { model: roles, attributes: ['id', 'name'] },
      ],
     }));
    if (err) return ReE(res, err, 422);

     if(roleUserData &&roleUserData.school_ids){
       [err, findSchools] = await to(schools.findAll({
        where:{id: {[Op.in]: roleUserData.school_ids}},
        attributes: ['name']
       }));
       if (err) return ReE(res, err, 422);
       if(findSchools.length > 0){
         var ni = findSchools.map(ele => ele.name)
         roleUserData.school_ids = ni
       }
       if (err) return ReE(res, err, 422);
     }

    if (roleUserData !== null) {
      return ReS(res, { data: roleUserData }, 200);
    } else {
      return ReE(res, "No role data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getRoleUser = getRoleUser;

const updateRoleUser = async function (req, res) {
  let payloadBody = req.body;
  let payload = req.body;
  
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "User id required in params", 422);
  }
  [err, user] = await to(admins.findOne({ where: { id: req.params.user_id } }));
  if (_.isEmpty(user)) {
    return ReE(res, "User not found", 404);
  }
  console.log(user.email, payload.email);
  if (payload.email && user.email === payload.email) {
    [err, userData] = await to(admins.findOne({ where: { email: payload.email } }));
    if (userData != null) {
      return ReE(res, "User already exist with email.", 422);
    }
  } else {
    try {
      [err, user] = await to(admins.update(payload, { where: { id: req.params.user_id }, individualHooks: true }));
      if (err) return ReE(res, err, 422);
      [err, user] = await to(admins.findOne({ where: { id: req.params.user_id } }));
      return ReS(res, { data: user }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
}
module.exports.updateRoleUser = updateRoleUser;

const deleteRoleUser = async function (req, res) {
  let err, userData, userUpdate;
 
  if (req.params && (req.params.user_id == undefined || req.params.user_id =='')) {
    return ReE(res, "user id is required", 422);
  }
  try {
    [err, userData] = await to(admins.findOne({ where: { id: req.params.user_id } }));
    if (userData == null) {
      return ReE(res, "user not found", 404);
    }
    [err, userUpdate] = await to(admins.update({ is_deleted: true }, { where: { id: req.params.user_id } }));
    return ReS(res, { messsage: 'User has been deleted successfully.' }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.deleteRoleUser = deleteRoleUser;