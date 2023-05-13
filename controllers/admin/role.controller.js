const { roles } = require("../../models");
const { to, ReE, ReS, toSnakeCase } = require('../../services/util.service');
const validator = require('validator');
var moment = require("moment");

const createRole = async function (req, res) {
  let err, roleData;
  let payloadBody = req.body;
  let payload = {};
  for (const val in payloadBody) {
    payload[toSnakeCase(val)] = payloadBody[val];
  }
  if (!payload.name) {
    return ReE(res, "Please enter an name", 422);
  } else if (!payload.note) {
    return ReE(res, "Please enter a note.", 422);
  } else if (!payload.permission) {
    return ReE(res, "Please enter a permission.", 422);
  } else {
    try {
      if (payload.permission) {
        payload.permission = JSON.stringify(payload.permission)
      }
      [err, roleData] = await to(roles.create(payload));
      if (err) return ReE(res, err, 422);
      roleData.permission =  JSON.parse(roleData.permission);
      return ReS(res, { data: roleData }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
};
module.exports.createRole = createRole;

const getAllRoles = async function (req, res) {
  let err, roleData;
  try {
    if (req.query.compact) {
      console.log("test...................");
      [err, roleData] = await to(roles.findAll({
        attributes: ['id', 'name']
      }));
    } else {
      [err, roleData] = await to(roles.findAll({}));
    }
    if (err) return ReE(res, err, 422);
    if (roleData && roleData.length > 0) {
      return ReS(res, { data: roleData }, 200);
    } else {
      return ReE(res, "No roles data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllRoles = getAllRoles;

const getRole = async function (req, res) {
  let err, roleData;
  if (req.params && req.params.role_id == undefined) {
    return ReE(res, { message: "Role id params is missing" }, 422);
  }
  try {
    [err, roleData] = await to(roles.findOne({ where: { id: req.params.role_id } }));
    if (err) return ReE(res, err, 422);
    if (roleData !== null) {
      if (roleData.permission) {
        roleData.permission =  JSON.parse(roleData.permission);
      }
      return ReS(res, { data: roleData }, 200);
    } else {
      return ReE(res, "No role data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getRole = getRole;

const updateRole = async function (req, res) {
  let err, roleData;
  let payload = req.body;
  if (req.params && req.params.role_id == undefined) {
    return ReE(res, { message: "role id params is missing" }, 422);
  }
  try {
    if (payload.permission) {
      payload.permission = JSON.stringify(payload.permission)
    }
    [err, roleData] = await to(roles.findOne({ where: { id: req.params.role_id } }));
    if (err) return ReE(res, err, 422);
    if (roleData == null) {
      return ReE(res, "No role data found", 404);
    } else {
      roleData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: roleData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateRole = updateRole;

const deleteRole = async function (req, res) {
  let err, roleData;
  if (req.params && req.params.role_id == undefined) {
    return ReE(res, { message: "role id is missing" }, 422);
  }
  try {
    
    [err, roleData] = await to(roles.findOne({ where: { id: req.params.role_id } }));
    if (err) return ReE(res, err, 422);
    if (roleData == null) {
      return ReE(res, "No role data found", 404);
    } else {
      roleData.destroy();
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "Role deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteRole = deleteRole;