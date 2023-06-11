const { roles, users, user_assessments, academics, professional_infos, custom_attributes, school_inventories } = require("../../models");
const model = require('../../models');
const authService = require("../../services/auth.service");
const { to, ReE, ReS, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash, getUUID } = require('../../services/util.service');
var _ = require('underscore');
var ejs = require("ejs");
const fs = require("fs");
const mailer = require("../../helpers/mailer");
const readXlsxFile = require('read-excel-file/node')
const path = require("path");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

const validator = require('validator');
var moment = require("moment");
const { object } = require("underscore");
user_assessments.belongsTo(model.users, { foreignKey: 'user_id' });
user_assessments.belongsTo(model.professional_infos, {foreignKey: 'user_id', targetKey: 'user_id' });

const createUser = async function (req, res) {
  let err, roleData;
  let body = req.body;

  if ((_.isEmpty(body.personal_info.email) && _.isEmpty(body.personal_info.phone_no)) || (_.isUndefined(body.personal_info.email) && _.isUndefined(body.personal_info.phone_no))) {
    return ReE(res, "Email or Phone number is required", 422);
  }

  if (body.personal_info.email) {
    [err, userData] = await to(users.findOne({ where: { email: body.personal_info.email } }));
    if (userData != null) {
      return ReE(res, "User already exist with email.", 422);
    }
  } 
  
  if (body.personal_info.phone_no) {
    [err, userData] = await to(users.findOne({ where: { phone_no: body.personal_info.phone_no } }));
    if (userData != null) {
      return ReE(res, "User already exist with phone number.", 422);
    }
  }

  let uuiD = await authService.getUUID();
  let userPayload = {
    title: body && body.personal_info.title ? body.personal_info.title : null,
    first_name: body && body.personal_info.first_name ? body.personal_info.first_name : null,
    middle_name: body && body.personal_info.middle_name ? body.personal_info.middle_name : null,
    last_name: body && body.personal_info.last_name ? body.personal_info.last_name : null,
    email: body && body.personal_info.email ? body.personal_info.email : null,
    phone_no: body && body.personal_info.phone_no ? body.personal_info.phone_no : null,
    dob: body && body.personal_info.dob ? body.personal_info.dob : null,
    gender: body && body.personal_info.gender ? body.personal_info.gender : null,
    latitude: body && body.personal_info.latitude ? body.personal_info.latitude : null,
    longitude: body && body.personal_info.longitude ? body.personal_info.longitude : null,
    country_id: body && body.personal_info.countryId ? body.personal_info.country_id : null,
    state_id: body && body.personal_info.state_id ? body.personal_info.state_id : null,
    city_id: body && body.personal_info.city_id ? body.personal_info.city_id : null,
    district_id: body && body.personal_info.district_id ? body.personal_info.district_id : null,
    taluka_id: body && body.personal_info.taluka_id ? body.personal_info.taluka_id : null,
    address: body && body.personal_info.address ? body.personal_info.address : null,
    pincode: body && body.personal_info.pincode ? body.personal_info.pincode : null,
    status: 'PENDING',
    uuid: uuiD
  };


  // update into snakecase
  body.academics_info = body.academics_info.map(ele => {
    let obj = {};
    for (const val in ele) {
      obj[val] = ele[val];
    }
    return obj;
  });

  body.professional_info = body.professional_info.map(ele => {
    let obj = {};
    for (const val in ele) {
      obj[val] = ele[val];
    }
    return obj;
  });

  // academics section
  if (body.academics_info === undefined || body.academics_info.length == 0) {
    return ReE(res, "User academics at least one is required.", 422);
  }

  let academicsError = [];
  let requiredField = ["institution", "programme", "start_date", "field_of_study"];
  body.academics_info.forEach((ele, k) => {
    let diff = _.difference(requiredField, Object.keys(ele));
    console.log(diff);
    
    if (diff.length > 0) {
      academicsError.push(`academics[${k}] fields ${diff.join(',')} is required`);
    }
  });

  if (academicsError.length > 0) {
    return ReE(res, academicsError.join(", "), 422);
  }

  if (body.academics_info === undefined || body.academics_info.length == 0) {
    return ReE(res, "User academics at least one is required.", 422);
  }
  let professonalError = [];
  let professional_infos_required = ["experience_min", "experience_max", "start_date"];
  body.professional_info.forEach((ele, k) => {
    let diff = _.difference(professional_infos_required, Object.keys(ele));
    if (diff.length > 0) {
      professonalError.push(`professional infos[${k}] fields ${diff.join(',')} is required`);
    }
  });

  if (professonalError.length > 0) {
    return ReE(res, professonalError.join(", "), 422);
  }

  try {
    [err, user] = await to(users.create(userPayload));
    if (err) return ReE(res, err, 422);

    let academicsPayload = body.academics_info.map(ele => {
      ele.user_id = user.id;
      ele.extra_carricular_activities = ele.extra_carricular_activities != null && ele.extra_carricular_activities != undefined && ele.extra_carricular_activities != ''  ? ele.extra_carricular_activities.join(',') : null
      ele.achievements = ele.achievements != null && ele.achievements != undefined && ele.achievements != ''  ? ele.achievements.join(',') : null  
      return ele;
    });
    [err, academicsBulk] = await to(academics.bulkCreate(academicsPayload));
    if (err) return ReE(res, err, 422);

    let professional_infos_payload = body.professional_info.map(ele => {
      ele.user_id = user.id;
      return ele;
    });
    [err, professional_infos_bulk] = await to(professional_infos.bulkCreate(professional_infos_payload));
    if (err) return ReE(res, err, 422);

    return ReS(res, { data: user, academics: academicsBulk, professional_infos: professional_infos_bulk }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.createUser = createUser;

// update user
const updateUser = async function (req, res) {
  let err, userData, user;
  let body = req.body;

  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "User id required in params", 422);
  }

  [err, user] = await to(users.findOne({ where: { id: req.params.user_id } }));

  if (_.isEmpty(user)) {
    return ReE(res, "User not found", 404);
  }

  if (body.email && user.email !== body.email) {
    [err, userData] = await to(users.findOne({ where: { email: body.email } }));
    if (userData != null) {
      return ReE(res, "User already exist with email.", 422);
    }
  } else if (body.phone_no && user.phone_no !== body.phone_no) {
    [err, userData] = await to(users.findOne({ where: { phone_no: body.phone_no } }));
    if (userData != null) {
      return ReE(res, "User already exist with phone number.", 422);
    }
  }

  let userPayload = {};
  Object.keys(body).forEach(ele => {
    userPayload[ele] = body[ele];
  });

  try {
    [err, user] = await to(users.update(userPayload, { where: { id: req.params.user_id } }));
    if (err) return ReE(res, err, 422);
    [err, user] = await to(users.findOne({ where: { id: req.params.user_id } }));
    return ReS(res, { data: user }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.updateUser = updateUser;

const deleteUser = async function (req, res) {
  let err, user;
 
  if (req.params && (req.params.user_id == undefined || req.params.user_id =='')) {
    return ReE(res, "user id is required", 422);
  }
  try {
    [err, user] = await to(users.findOne({ where: { id: req.params.user_id } }));
    if (user == null) {
      return ReE(res, "user not found", 404);
    }
    user.destroy();
    [err, response] = await to(academics.destroy({where: { user_id: req.params.user_id }, force: true }));
    [err, response] = await to(professional_infos.destroy({where: { user_id: req.params.user_id }, force: true }));
    return ReS(res, { messsage: 'User has been deleted successfully.' }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.deleteUser = deleteUser;

// get all users 
const getAllUsers = async function (req, res) {
  let err, userData;
  try {
    let queryParams = {};
    let orData = [];
    console.log(req.query);

    if(req.query && req.query.filter) {
      Object.keys(req.query.filter).forEach(ele => {
        queryParams[ele] = req.query.filter[ele].toUpperCase();
      })
    }

    let searchArray = ['first_name', 'middle_name', 'last_name', 'email', 'phone_no', 'district_name', 'taluka_name', 'city_name', 'address']
    if(req.query && req.query.search) {
      searchArray.forEach(ele => {
        let obj = {};
        obj[ele] = { [Op.iLike]: `%${req.query.search}%`};
        orData.push(obj);
      })
    }

    if(orData.length > 0) {
      queryParams = {...queryParams,...{[Op.or]: orData}}
    } else {
      queryParams = {...queryParams }
    }

   // user_type
    let paginateData = {...requestQueryObject(req.query, queryParams)};
    console.log(paginateData);
    [err, userData] = await to(users.findAndCountAll(paginateData));
    if (err) return ReE(res, err, 422);
    
    if (userData) {
      return ReS(res, { data: userData }, 200);
    } else {
      return ReE(res, "No user data found", 404);
    }
  } catch (err) {
    console.log(err);
    return ReE(res, err, 422);
  }
}
module.exports.getAllUsers = getAllUsers;

// inviteUser OTP
const inviteUser = async function (req, res) {
  let err, user;
  [err, user] = await to(users.findOne({ where: { id: req.params.user_id } }));
  
  console.log(await getInviteHash());
  user.invite_code = await getInviteHash();
  user.invited_at = moment().format("YYYY-MM-DD HH:mm:ss");

  try {
    user.save();
    let parameters = { url: `${process.env.APP_URL}/#/account?activate=${user.invite_code}` };
    let html = ejs.render(
      fs.readFileSync(__dirname + `/../../views/verifyAccountTemplate.ejs`).toString(),
      parameters
    );
    var subject = "LMS Activate account link";
    let response = await mailer.send(user.email, subject, html);
    return ReS(res, { message: "Invite has been send user successfully" });
  } catch (err) {
    console.log(err);
    return ReE(
      res,
      "Something went wrong, please try again or please connect with Knoggles support team.",
      422
    );
  }

};
module.exports.inviteUser = inviteUser;

const accountVerify = async function (req, res) {
  let err, user;

  if(req.body && req.body.invite_code) {
    return ReE(res, "Invited code is required", 422);
  }

  [err, user] = await to(users.findOne({ where: { invite_code: req.body.invite_code }, attributes: ['invite_code'] }));
  if(user === null) {
    return ReE(res, "Invited code is invalid, please request knoggle support team", 422);
  }
  console.log(await getInviteHash());
  user.invite_code = null;
  user.status = 'ACTIVE';
  try {
    user.save();
    return ReS(res, { message: "Account has been verify successfully" });
  } catch (err) {
    console.log(err);
    return ReE(
      res,
      "Something went wrong, please try again or please connect with Knoggles support team.",
      422
    );
  }
};
module.exports.accountVerify = accountVerify;

getInviteHash = async () => {
  let hash = await randomHash(32, '#aA');
  [err, user] = await to(users.findOne({ where: { invite_code: hash }, attributes: ['invite_code'] }));
  if(user) {
    await getInviteHash();
  } else {
    return hash;
  }
}


const bulkDeleteUser = async function (req, res) {
  let err, response;
  if(req.query && req.query.ids == undefined) {
    return ReE(res, {message: "IDs is required for delete operations"}, 422);
  }
  try {
    [err, response] = await to(users.destroy({where: { id: { [Op.in] : req.query.ids.split(',')} } }));

    [err, response] = await to(academics.destroy({ where: { user_id: { [Op.in] : req.query.ids.split(',')} }, force: true }));
    [err, response] = await to(professional_infos.destroy({ where: { user_id: { [Op.in] : req.query.ids.split(',')} }, force: true }));
    
    if (err) {
      return ReE(res, err, 422);
    }
    return ReS(res, { data: "Row data has been deleted" }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.bulkDeleteUser = bulkDeleteUser


// ############################# user Import ###########################
const readNewExcelData = async () => {
  let newSchema = {
    'Personal Info': {
      prop: 'personal_info',
      type: {
        'Title': {
          prop: 'title',
          type: String,
          oneOf: ["Ms", "Mrs", "Mr"]
        },
        'Employee Code': {
          prop: 'employee_code',
          type: String
        },
        'First Name': {
          prop: 'first_name',
          type: String
        },
        'Middle Name': {
          prop: 'middle_name',
          type: String
        },
        'Last Name': {
          prop: 'last_name',
          type: String
        },
        'Email Address': {
          prop: 'email',
          type: String
        },
        'Mobile Number': {
          prop: 'phone_no',
          type: String
        },
      }
    },
    'Professional Information': {
      prop: 'professional_info',
      type: {
        'Role / Position': {
          prop: 'position',
          type: String,
        },
        'Employment Type': {
          prop: 'employee_type_id',
          type: String
        },
        'School / Institute': {
          prop: 'school_id',
          type: String
        },
        'Experience in Years': {
          prop: 'experience_year',
          type: Number
        },
        'Experience in Months': {
          prop: 'experience_month',
          type: Number
        },
        'Professional Start Date': {
          prop: 'start_date',
          type: Date
        },
        'Professional End Date': {
          prop: 'end_date',
          type: Date
        }
      }
    },
  }
  
  
  let newTeacherData = await readXlsxFile(fs.readFileSync( path.join(__dirname + "/../../public/assets/Vibgyor-Teachers-Data.xlsx")), { newSchema }, { dateFormat: 'yyyy-mm-dd' });
  
    // populate schools data
    let schoolNames = [];
    newTeacherData.forEach(ele => {
      schoolNames.push(ele[6]);
    })

  return [newTeacherData, schoolNames ];
}

const userImport = async function (req, res) {
  const schema = {
    'Personal Info': {
      prop: 'personal_info',
      type: {
        'Title': {
          prop: 'title',
          type: String,
          oneOf: ["Ms.", "Mrs.", "Mr."]
        },
        'Employee Code': {
          prop: 'employee_code',
          type: String
        },
        'First Name': {
          prop: 'first_name',
          type: String
        },
        'Middle Name': {
          prop: 'middle_name',
          type: String
        },
        'Last Name': {
          prop: 'last_name',
          type: String
        },
        'Email Address': {
          prop: 'email',
          type: String
        },
        'Mobile Number': {
          prop: 'phone_no',
          type: String
        },
        'Date of Birth': {
          prop: 'dob',
          type: Date
        },
        'Gender': {
          prop: 'gender',
          type: String,
          oneOf: ["Male", "Female"]
        },
        'Mobile Number': {
          prop: 'phone_no',
          type: String
        },
        'Address': {
          prop: 'address',
          type: String
        },
        'Country': {
          prop: 'country_id',
          type: String
        },
        'State': {
          prop: 'state_id',
          type: String
        },
        'City / Village': {
          prop: 'city_id',
          type: String
        },
        'Taluk / Tehsil': {
          prop: 'taluka_id',
          type: String
        },
        'District': {
          prop: 'district_id',
          type: String
        },
        'Pincode': {
          prop: 'pincode',
          type: String
        },
      }
    },
    'Academic Information': {
      prop: 'academics_info',
      type: {
        'School / College / University': {
          prop: 'institution',
          type: String,
        },
        'Degree / Diploma / Certification': {
          prop: 'programme',
          type: String
        },
        'Start Date': {
          prop: 'start_date',
          type: String
        },
        'End Date': {
          prop: 'end_date',
          type: String
        },
        'Field of Study': {
          prop: 'field_of_study',
          type: String
        },
        'Extra Curricular Activities': {
          prop: 'extra_carricular_activities',
          type: String
        },
        'Achievements': {
          prop: 'achievements',
          type: String
        },
        'Educational Certificate link': {
          prop: 'certificate_url',
          type: String
        },
      }
    },
    'Professional Information': {
      prop: 'professional_info',
      type: {
        'Role / Position': {
          prop: 'position',
          type: String,
        },
        'Employment Type': {
          prop: 'employee_type_id',
          type: String
        },
        'School / Institute': {
          prop: 'school_id',
          type: String
        },
        'Experience in Years': {
          prop: 'experience_year',
          type: Number
        },
        'Experience in Months': {
          prop: 'experience_month',
          type: Number
        },
        'Professional Start Date': {
          prop: 'start_date',
          type: Date
        },
        'Professional End Date': {
          prop: 'end_date',
          type: Date
        }
      }
    },
  }

  let employeeType = {
    "Permanent": 1,
    "Contractual": 2,
    "Probation": 3,
  };

  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + "/../../public/assets/final_teacher_onboarding_data.xlsx")), { schema }, { dateFormat: 'yyyy-mm-dd' }).then( async (rows, errors) => {

      if (rows.errors.length === 0 && rows.rows.length > 0){

        //============================= START: Hack for 11th June user loading =============
        let [newExcelRows, schoolIds] = await readNewExcelData();
        
        let oldTeachersData = {};
        rows.rows.map(ele => {
          let phone = ele.personal_info.phone_no;
          let pi = ele.personal_info;
          oldTeachersData[phone] = ele;
        });

        let newTeachersData = [];
        let obj = {};
        obj.old = [];
        obj.new = [];
        newExcelRows.map((ele, ei) => {
          let phone = ele[5];
      
          if(oldTeachersData[phone]) { 
            ele = oldTeachersData[phone];
            obj.old.push(phone);
          }
          else {
            obj.new.push(ele[5]);
            let labels = ['title', 'first_name', 'middle_name', 'last_name', 'email','phone_no', 'school_id' ];
            let teacherData = {};
            let pi = {};
            labels.forEach((val, index) => {
              pi[val] = ele[index];
            });
            pi['user_type'] = 'TEACHER';
            pi['country_id'] = 0;
            teacherData.personal_info = pi;
            let pro = {
              country_id : 0,
              state_id : 0,
              city_id : 0,
              district_id : 0,
              position: 'Subject Teacher',
              school_id : ele[6],
              experience_min: 1,
              experience_max: 2,
              start_date: new Date()
            }
            teacherData.professional_info = pro;
            // ["institution", "programme", "start_date", "field_of_study"]
            let ai = {
              institution: 'Not Specified',
              programme : 'Not Specified',
              start_date: '',
              field_of_stydy: "General"
            }
            teacherData.academics_info = ai;
            // newTeachersData.push(teacherData);
            if(ele[5] == '9148817181') {
              console.log("new teacherData for 9148817181", teacherData);
            }
            ele = teacherData;
          }
          ele.taluka_id = 0;
          newTeachersData.push(ele);
        });

        // console.log("all new records ", newTeachersData.length);
        // console.log("fetched data from old ", obj.old.length);
        // console.log("fetched data from new ", obj.new.length);
        // return '';
        
        let data = newTeachersData.map(ele => {
        //============================= END: Hack for 11th June user loading =============

        // let data = rows.rows.map(ele => {
          
          ele.personal_info.dob = moment(ele.personal_info.dob).format('YYYY-MM-DD');
          ele.personal_info.gender = ele.gender == 'Female' ? 'FEMALE' : "MALE";

          if(ele.academics_info) {
            ele.academics_info.start_date = ele && ele.academics_info && ele.academics_info.start_date != '' ? moment(ele.academics_info.start_date).format('YYYY-MM-DD') : null;
            ele.academics_info.end_date =  ele && ele.academics_info && ele.academics_info.end_date != '' ? moment(ele.academics_info.end_date).format('YYYY-MM-DD') : null;
          }
          
          console.log(ele.professional_info.start_date);
          ele.professional_info.start_date = ele.professional_info && ele.professional_info.start_date ? moment(ele.professional_info.start_date).format('YYYY-MM-DD') : null;
          if(ele.professional_info.end_date) {
            ele.professional_info.end_date = moment(ele.professional_info.end_date).format('YYYY-MM-DD');
          }

          if(ele.personal_info.title == 'Mr.') {
            ele.personal_info.title = 'Mr'
          }
          if(ele.personal_info.title == 'Mrs.') {
            ele.personal_info.title = 'Mrs'
          }
          if(ele.personal_info.title == 'Ms.') {
            ele.personal_info.title = 'Ms'
          }

          ele.professional_info.employee_type_id = employeeType[ele.professional_info.employee_type_id];

          return ele;
        });

        let countryData = [];
        data.forEach(ele => {
          countryData.push(ele.personal_info.country_id);
          countryData.push(ele.professional_info.country_id);
        });
        countryData = [...new Set(countryData)];

        let stateData = [];
        data.forEach(ele => {
          stateData.push(ele.personal_info.state_id);
          stateData.push(ele.professional_info.state_id);
        });
        stateData = [...new Set(stateData)];

        let cityData = [];
        data.forEach(ele => {
          cityData.push(ele.personal_info.city_id);
          cityData.push(ele.professional_info.city_id);
        });
        cityData = [...new Set(cityData)];


        let districtData = [];
        data.forEach(ele => {
          districtData.push(ele.district_id);
        });
        districtData = [...new Set(districtData)];


        let schoolsData = [];
        data.forEach(ele => {
          schoolsData.push(ele.professional_info.school_id);
        });
        schoolsData = [...new Set(schoolsData)];

        let talukaData = [];
        data.forEach(ele => {
          talukaData.push(ele.taluka_id);
        });
        talukaData = [...new Set(talukaData)];
        

        let stateReponse; let err; let cityReponse, districtResponse, talukaReponse, schoolsReponse;
        [err, countryReponse] = await to(model.countries.findAll({where: {country_name: { [Op.in]: countryData }}, raw: true }));
        let mapCountryId = {};
        if(countryReponse)
        countryReponse.forEach(ele => {
          mapCountryId[ele.country_name] = ele.id;
        });
        
        [err, stateReponse] = await to(model.states.findAll({where: {state_name: { [Op.in]: stateData }}, raw: true }));
        let mapStateId = {};
        if(stateReponse)
        stateReponse.forEach(ele => {
          mapStateId[ele.state_name] = ele.id;
        });

        [err, cityReponse] = await to(model.cities.findAll({where: { city_name: { [Op.in]: cityData }}, raw: true }));
        let mapCityId = {};
        if(cityReponse)
        cityReponse.forEach(ele => {
          if(ele.city_name){ 
            mapCityId[ele.city_name] = ele.id;
          }
        })
        console.log(districtData);
        districtData = districtData.filter(ele => ele != undefined);
        [err, districtResponse] = await to(model.districts.findAll({where: {district_name: { [Op.in]: districtData }}, raw: true }));
        let mapDistrictId = {};
        if(districtResponse)
        districtResponse.forEach(ele => {
          mapDistrictId[ele.district_name] = ele.id;
        });

        [err, talukaReponse] = await to(model.talukas.findAll({where: {taluka_name: { [Op.in]: talukaData }}, raw: true }));
        let mapTalukaId = {};
        if(talukaReponse)
        talukaReponse.forEach(ele => {
          mapTalukaId[ele.taluka_name] = ele.id;
        });

        [err, schoolsReponse] = await to(model.schools.findAll({where: {name: { [Op.in]: schoolsData }}, raw: true }));
        let mapSchoolId = {};
        if(schoolsReponse)
        schoolsReponse.forEach(ele => {
          mapSchoolId[ele.name] = ele.id;
        });

        // console.log(schoolsData);

        
        
        // let createBulkLevels = [];
        // data.forEach(ele => {
        //   createBulkLevels = [
        //   ...ele.professional_info.level_ids.split(',').map(e => { return e.trim() })
        //   , ...createBulkLevels];
        // });
        // createBulkLevels = [...new Set(createBulkLevels)];

        // let createBulkBoard = [];
        // data.forEach(ele => {
        //   createBulkBoard.push(ele.professional_info.board_id);
        // });
        // createBulkBoard = [...new Set(createBulkBoard)];

        // let gradeBulkIds = [];
        // data.forEach(ele => {
        //   gradeBulkIds = [...ele.professional_info.grade_ids.split(',').map(e => { return e.trim() }), ...gradeBulkIds];
        // });
        // gradeBulkIds = [...new Set(gradeBulkIds)];


        // let boardResponse; let gradeResponse; let levelResponse;
        // [err, levelResponse] = await to(model.levels.findAll({where: {name: { [Op.in]: createBulkLevels }}, raw: true }));
        // let maplevelId = {};
        // levelResponse.forEach(ele => {
        //   if(ele.name) { 
        //     maplevelId[ele.name] = ele.id;
        //   }
        // });
        
        // [err, boardResponse] = await to(model.boards.findAll({where: {name: { [Op.in]: createBulkBoard }}, raw: true }));
        // let mapBoardId = {};
        // boardResponse.forEach(ele => {
        //   if(ele.name) { 
        //     mapBoardId[ele.name] = ele.id;
        //   }
        // });

        // [err, gradeResponse] = await to(model.grades.findAll({where: { name: { [Op.in]: gradeBulkIds }}, raw: true }));
        // let mapGradeId = {};
        // gradeResponse.forEach(ele => {
        //   if(ele.name) { 
        //     mapGradeId[ele.name] = ele.id;
        //   }
        // })

        // console.log(mapCountryId, mapStateId, mapCityId, maplevelId, mapBoardId, mapGradeId);

        // ids mapping
        // console.log(mapSchoolId);
        data = data.map(ele => {
          ele.personal_info.user_type = 'TEACHER';
          ele.professional_info.school_id = mapSchoolId[ele.professional_info.school_id] ? mapSchoolId[ele.professional_info.school_id] : 0;

          ele.professional_info.experience_month = ele.professional_info.experience_month ? ele.professional_info.experience_month : 0;
          ele.professional_info.experience_year = ele.professional_info.experience_year ? ele.professional_info.experience_year : 0;

          ele.personal_info.country_id = 101;
          ele.personal_info.state_id = mapStateId[ele.personal_info.state_id] ?  mapStateId[ele.personal_info.state_id] : 0;
          ele.personal_info.city_id =  mapStateId[ele.personal_info.city_id] ?  mapStateId[ele.personal_info.city_id] : 0;
          ele.personal_info.district_id = mapStateId[ele.personal_info.district_id] ?  mapStateId[ele.personal_info.district_id] : 0;
          ele.personal_info.taluka_id =  mapStateId[ele.personal_info.taluka_id] ?  mapStateId[ele.personal_info.taluka_id] : 0;

          ele.professional_info = [ele.professional_info];
          if(ele.academics_info) {
            ele.academics_info = [ele.academics_info];
          }
          return ele;
        });
        let index = 0;

        // data.forEach(async element => {
        //   await uploadUser(element);
        // });
        await recursiveUserImport(data, index);
        
        return ReS(res, data, 200);
      } else {
        return ReE(res,"Somthing went wrong, please check with sheet data", 422);
      }
    });
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.userImport = userImport;

const recursiveUserImport = async function (data, index) {
  if(data[index]) {
    await uploadUser(data[index]);
    index = index+1;
    console.log("entry page", index);
    //await sleep(100);
    return await recursiveUserImport(data, index);
  } else {
    console.log("Reach final data ", index)
  }
}

const uploadUser = async function (body) {
  let uuiD = await authService.getUUID();
  
  let userPayload = {
    title: body && body.personal_info.title ? body.personal_info.title : null,
    first_name: body && body.personal_info.first_name ? body.personal_info.first_name : null,
    middle_name: body && body.personal_info.middle_name ? body.personal_info.middle_name : null,
    last_name: body && body.personal_info.last_name ? body.personal_info.last_name : null,
    email: body && body.personal_info.email ? body.personal_info.email : null,
    phone_no: body && body.personal_info.phone_no ? body.personal_info.phone_no : null,
    dob: body && body.personal_info.dob ? body.personal_info.dob : null,
    gender: body && body.personal_info.gender ? body.personal_info.gender : null,
    latitude: body && body.personal_info.latitude ? body.personal_info.latitude : null,
    longitude: body && body.personal_info.longitude ? body.personal_info.longitude : null,
    country_id: body && body.personal_info.countryId ? body.personal_info.country_id : null,
    state_id: body && body.personal_info.state_id ? body.personal_info.state_id : null,
    city_id: body && body.personal_info.city_id ? body.personal_info.city_id : null,
    district_id: body && body.personal_info.district_id ? body.personal_info.district_id : null,
    taluka_id: body && body.personal_info.taluka_id ? body.personal_info.taluka_id : null,
    address: body && body.personal_info.address ? body.personal_info.address : null,
    pincode: body && body.personal_info.pincode ? body.personal_info.pincode : null,
    user_type: body && body.personal_info.user_type ? body.personal_info.user_type : null,
    status: 'PENDING',
    uuid: uuiD
  };


  // update into snakecase
  body.academics_info = body.academics_info ? body.academics_info.map(ele => {
    let obj = {};
    for (const val in ele) {
      obj[val] = ele[val];
    }
    return obj;
  }) : [];

  body.professional_info = body.professional_info ? body.professional_info.map(ele => {
    let obj = {};
    for (const val in ele) {
      obj[val] = ele[val];
    }
    return obj;
  }) : [];

  [err, user] = await to(users.create(userPayload));
  if(user && user.id) {
    let academicsPayload = body.academics_info.map(ele => {
      ele.user_id = user.id;
      ele.extra_carricular_activities = ele.extra_carricular_activities != null && ele.extra_carricular_activities != undefined && ele.extra_carricular_activities != ''  ? ele.extra_carricular_activities.join(',') : null
      ele.achievements = ele.achievements != null && ele.achievements != undefined && ele.achievements != ''  ? ele.achievements.join(',') : null  
      return ele;
    });
    [err, academicsBulk] = await to(academics.bulkCreate(academicsPayload));
    
    let professional_infos_payload = body.professional_info.map(ele => {
      ele.user_id = user.id;
      return ele;
    }); 
    [err, professional_infos_bulk] = await to(professional_infos.bulkCreate(professional_infos_payload));
    return true;
  } else {
    const dirPath = path.join(__dirname+'/../../../userNotStore.json');
    var fileData = fs.readFileSync(dirPath);
    var json = JSON.parse(fileData);
    json.push(userPayload);
    fs.writeFileSync(dirPath, JSON.stringify(json))
    return true;
  }
}

const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};



const schoolsImport = async function (req, res) {
  const schema = {
    'school_name': {
      prop: 'name',
      type: String
    },
    'school_code': {
      prop: 'school_code',
      type: String
    },
    'address': {
      prop: 'address',
      type: String
    },
    'country': {
      prop: 'country_id',
      type: String
    },
    'state': {
      prop: 'state_id',
      type: String
    },
    'district': {
      prop: 'district_id',
      type: String
    },
    'taluka/tehsil': {
      prop: 'taluka_id',
      type: String
    },
    'city/village': {
      prop: 'city_id',
      type: String
    },
    'pincode': {
      prop: 'pincode',
      type: String
    },
    'email_address': {
      prop: 'email',
      type: String
    },
    contact_number: {
      prop: 'contact',
      type: String
    },
    website: {
      prop: 'website',
      type: String
    },
    cluster: {
      prop: 'cluster_id',
      type: String
    },
    brand: {
      prop: 'brand_id',
      type: String
    }
  }
  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + "/../../public/assets/school_data_sheet.xlsx")), { schema }).then( async (rows, errors) => {
      if (rows.errors.length === 0 && rows.rows.length > 0){
        let data = rows.rows.map(ele => {
          ele.country_id = 101;
          return ele;
        });

        let brandData = [];
        data.forEach(ele => {
          brandData.push(ele.brand_id);
        });
        brandData = [...new Set(brandData)];

        let stateData = [];
        data.forEach(ele => {
          stateData.push(ele.state_id);
        });
        stateData = [...new Set(stateData)];

        let districtData = [];
        data.forEach(ele => {
          districtData.push(ele.district_id);
        });
        districtData = [...new Set(districtData)];

        let talukaData = [];
        data.forEach(ele => {
          talukaData.push(ele.taluka_id);
        });
        talukaData = [...new Set(talukaData)];

        let cityData = [];
        data.forEach(ele => {
          cityData.push(ele.city_id);
        });
        cityData = [...new Set(cityData)];

        // let stateReponse; let err; let cityReponse;
       
        [err, stateReponse] = await to(model.states.findAll({where: {state_name: { [Op.in]: stateData }}, raw: true }));
        let mapStateId = {};
        stateReponse.forEach(ele => {
          mapStateId[ele.state_name] = ele.id;
        });


        [err, districtResponse] = await to(model.districts.findAll({where: {district_name: { [Op.in]: districtData }}, raw: true }));
        let mapDistrictId = {};
        districtResponse.forEach(ele => {
          mapDistrictId[ele.district_name] = ele.id;
        });

        [err, talukaReponse] = await to(model.talukas.findAll({where: {taluka_name: { [Op.in]: talukaData }}, raw: true }));
        let mapTalukaId = {};
        talukaReponse.forEach(ele => {
          mapTalukaId[ele.taluka_name] = ele.id;
        });

        [err, cityReponse] = await to(model.cities.findAll({where: { city_name: { [Op.in]: cityData }}, raw: true }));
        let mapCityId = {};
        cityReponse.forEach(ele => {
          if(ele.city_name) { 
            mapCityId[ele.city_name] = ele.id;
          }
        });


        [err, brandReponse] = await to(model.brands.findAll({where: { name: { [Op.in]: brandData }}, raw: true }));
        let mapBrandId = {};
        brandReponse.forEach(ele => {
          mapBrandId[ele.name] = ele.id;
        });

        console.log(districtData);
        
        
        data = data.map(ele => {
          ele.state_id = mapStateId[ele.state_id];
          ele.city_id =  mapCityId[ele.city_id] ? mapCityId[ele.city_id] : 0;
          ele.district_id =  mapDistrictId[ele.district_id] ? mapDistrictId[ele.district_id] : 0;
          ele.taluka_id =  mapTalukaId[ele.taluka_id] ? mapTalukaId[ele.taluka_id] : 0;
          ele.brand_id =  mapBrandId[ele.brand_id] ? mapBrandId[ele.brand_id] : 0;
          
          return ele;
        })

        if(req.query && req.query.generate) {
          [err, response] = await to(model.schools.bulkCreate(data));
        }

        return ReS(res, data, 200);
      } else {
        return ReE(res,"Somthing went wrong, please check with sheet data", 422);
      }
    });
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.schoolsImport = schoolsImport;

const schoolsInventoryImport = async function (req, res) {
  const schema = {
    'code': {
      prop: 'code',
      type: Number
    },
    'no_of_computer_labs': {
      prop: 'no_of_computer_labs',
      type: Number
    },
    'lab_school_hours_available': {
      prop: 'lab_school_hours_available',
      type: Number
    },
    'lab_after_school_hours_available': {
      prop: 'lab_after_school_hours_available',
      type: Number
    },
    'no_of_laptop_labs': {
      prop: 'no_of_laptop_labs',
      type: Number
    },
    'no_of_laptop_camera_labs': {
      prop: 'no_of_laptop_camera_labs',
      type: Number
    },
    'no_of_pc_labs': {
      prop: 'no_of_pc_labs',
      type: Number
    },
    'no_of_pc_camera_labs': {
      prop: 'no_of_pc_camera_labs',
      type: Number
    },
    'default_brawser': {
      prop: 'default_brawser',
      type: String
    },
    'internet_bandwidth': {
      prop: 'internet_bandwidth',
      type: String
    },
    ups_backup: {
      prop: 'ups_backup',
      type: String
    },
    duration_ups_backup: {
      prop: 'duration_ups_backup',
      type: String
    },
    dg_system: {
      prop: 'dg_system',
      type: String
    }
  }
  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + "/../../public/assets/inventory.xlsx")), { schema }).then( async (rows, errors) => {
      if (rows.errors.length === 0 && rows.rows.length > 0){
        let data = rows.rows.map(ele => {
          return ele;
        });

        data = data.map(ele => {
          let obj = {
            code: ele.code ? ele.code : 0 ,
            no_of_computer_labs: ele.no_of_computer_labs ? ele.no_of_computer_labs : 0,
            lab_school_hours_available: ele.lab_school_hours_available ? ele.lab_school_hours_available : 0,
            lab_after_school_hours_available: ele.lab_after_school_hours_available ? ele.lab_after_school_hours_available : 0,
            no_of_laptop_labs: ele.no_of_laptop_labs ? ele.no_of_laptop_labs : 0,
            no_of_laptop_camera_labs: ele.no_of_laptop_camera_labs ? ele.no_of_laptop_camera_labs : 0,
            no_of_pc_labs: ele.no_of_pc_labs ? ele.no_of_pc_labs : 0 ,
            no_of_pc_camera_labs: ele.no_of_pc_camera_labs ? ele.no_of_pc_camera_labs : 0 ,
            default_browser: ele.default_brawser ? ele.default_brawser : "Google Chrome" ,
            internet_bandwidth: ele.internet_bandwidth == 'More than 50 mbps' ? '50-100' : ( ele.internet_bandwidth == "41-50 mbps" ? '40-50' : '0-40' ) ,
            ups_backup: ele.ups_backup == 'Not Available' ? 'NOT_AVAILABLE' : 'AVAILABLE',
            duration_ups_backup: ele.duration_ups_backup ? parseFloat(ele.duration_ups_backup.replace('Hours', '').replace('Hour', '').trim()) : 0 ,
            dg_system: ele.dg_system == 'Not Available' ? 'NOT_AVAILABLE' : 'AVAILABLE',
          };
          return obj;
        })

        if(req.query && req.query.generate) {
          [err, response] = await to(model.school_inventories.bulkCreate(data));
        }

        return ReS(res, data, 200);
      } else {
        return ReE(res,"Somthing went wrong, please check with sheet data", 422);
      }
    });
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.schoolsInventoryImport = schoolsInventoryImport;



const getUsersProfileDetails = async function (req, res) {
  let err, professionalInfosData;
  if (_.isEmpty(req.params.details_type) || _.isUndefined(req.params.details_type)) {
    return ReE(res, "details type required in params", 422);
  }
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  }

  // if (req.params && req.params.academic_id == undefined) {
  //   return ReE(res, { message: "Academic id params is missing" }, 422);
  // }
  if (req.params && req.params.user_id == undefined) {
    return ReE(res, { message: "Academic id params is missing" }, 422);
  }

  let modelName = req.params.details_type;
  if (req.params.details_type == 'professional-infos') {
    modelName = professional_infos;
  } else {
    modelName = academics;
  }
  try {
    [err, userTypeData] = await to(modelName.findAll({ where: { user_id: req.params.user_id } }));
    if (err) return ReE(res, err, 422);
    if (userTypeData && userTypeData.length > 0) {
      return ReS(res, { data: userTypeData }, 200);
    } else {
      return ReE(res, "No data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUsersProfileDetails = getUsersProfileDetails;

const updateUserAcademicDetails = async function (req, res) {
  let err, academicData;
  let payload = req.body;
  if (_.isEmpty(req.params.academic_id) || _.isUndefined(req.params.academic_id)) {
    return ReE(res, "academic id required in params", 422);
  }
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  }
  try {
    [err, academicData] = await to(academics.findOne({ where: { id: req.params.academic_id } }));
    if (err) return ReE(res, err, 422);
    if (academicData == null) {
      return ReE(res, "No academic data found", 404);
    } else {
      if (academicData.user_id != req.params.user_id) {
        return ReE(res, "passing academic id not associate with user", 422);
      }
      academicData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: academicData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateUserAcademicDetails = updateUserAcademicDetails;

const updateProfessionalInfoDetails = async function (req, res) {
  let err, professionalInfoData;
  let payload = req.body;
  if (_.isEmpty(req.params.professional_info_id) || _.isUndefined(req.params.professional_info_id)) {
    return ReE(res, "professional info id required in params", 422);
  }
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  }
  try {
    [err, professionalInfoData] = await to(professional_infos.findOne({ where: { id: req.params.professional_info_id } }));
    if (err) return ReE(res, err, 422);
    if (professionalInfoData == null) {
      return ReE(res, "No professional info data found", 404);
    } else {
      if (professionalInfoData.user_id != req.params.user_id) {
        return ReE(res, "passing professional id not associate with user", 422);
      }
      professionalInfoData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: professionalInfoData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateProfessionalInfoDetails = updateProfessionalInfoDetails;

const getUsersAssessments = async function (req, res) {
  let err, userScreeningAssessmentData,userMainsAssessmentData;
  let screeningFilter = {assessment_id: req.params.assessment_id};
  let mainsFilter = {assessment_id: req.params.assessment_id};
  try {
    if(req.query.filter && req.query.filter.screening_status) { 
      screeningFilter.screening_status= req.query.filter.screening_status; 
    }
    if(req.query.filter && req.query.filter.mains_status) { 
      mainsFilter.mains_status = req.query.filter.screening_status ; 
    }

    let payload = { 
        attributes: ['id', "user_id", "screening_status"],
        where: screeningFilter,
        include: [
          { model: users, as: 'user', require: false, attributes:['first_name', 'email','profile_pic'] },
          { model: professional_infos, require:false, attributes: ['experience_month', 'experience_year'] }
        ],
        raw: true,
        nest: true
    };
    [err, userScreeningAssessmentData] = await to(user_assessments.findAll(payload));
    userScreeningAssessmentData = userScreeningAssessmentData == null ? [] : userScreeningAssessmentData;

    let payload2 = {...payload};
    payload2.attributes.pop();
    payload2.attributes.push('mains_status');
    payload2.where = mainsFilter;
    [err, userMainsAssessmentData] = await to(user_assessments.findAll(payload2));
    userMainsAssessmentData = userMainsAssessmentData == null ? [] : userMainsAssessmentData;   

    let finalResult = [...userScreeningAssessmentData, ...userMainsAssessmentData].map(obj => {
      // let obj = ele.get({plain: true});
      if(obj.user && obj.user.profile_pic == null) {
        obj.user.profile_pic = "https://knoggles-lms-assets.s3.ap-south-1.amazonaws.com/user.svg";
      }
      return obj;
    })

    // console.log(userAssessmentData);
    return ReS(res, { data: finalResult }, 200); 
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUsersAssessments = getUsersAssessments;