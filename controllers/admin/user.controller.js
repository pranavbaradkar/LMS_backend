const { interviewers, roles,subjects, boards, schools, levels, user_teaching_interests, users, demovideo_details, user_interviews, user_interview_feedbacks, user_assessments, assessment_results, academics, professional_infos, custom_attributes, school_inventories, user_recommendations, assessment_configurations } = require("../../models");
const model = require('../../models');
const authService = require("../../services/auth.service");
const { to, ReE, ReS, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash, getUUID } = require('../../services/util.service');
var _ = require('underscore');
var ejs = require("ejs");
const fs = require("fs");
const mailer = require("../../helpers/mailer");
const readXlsxFile = require('read-excel-file/node')
const path = require("path");
const pdf = require('html-pdf');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

const validator = require('validator');
var moment = require("moment");
const { object } = require("underscore");

schools.hasMany(interviewers,{ foreignKey: 'school_id'});
user_interviews.hasOne(user_interview_feedbacks, { foreignKey: 'user_id', sourceKey: 'user_id',  as: 'interview_feedback' });
user_interview_feedbacks.belongsTo(user_interviews , { foreignKey: 'user_id', targetKey: 'user_id'} );
user_interviews.belongsTo(user_teaching_interests, {foreignKey: 'user_id', targetKey: 'user_id', as:'teaching_interests'});
user_interviews.belongsTo(users, {foreignKey: 'user_id'});
user_interviews.belongsTo(interviewers, {sourceKey: "interviewer_id" });

user_assessments.hasOne(assessment_configurations, {  sourceKey: 'assessment_id', foreignKey: "assessment_id" });
assessment_configurations.belongsTo(levels, { foreignKey: 'level_id' });

model.users.hasMany(model.user_assessments, {foreignKey: 'user_id', targetKey: 'user_id'});
user_assessments.belongsTo(model.users, { foreignKey: 'user_id' });

user_teaching_interests.belongsTo(model.users, { foreignKey: 'user_id' });
users.hasOne(model.user_teaching_interests, { foreignKey: 'user_id', as:'teaching_interests' });
users.hasOne(model.user_interviews, { foreignKey: 'user_id', as:'interview' });
demovideo_details.belongsTo(model.users,  { foreignKey: 'user_id' });
users.hasMany(model.demovideo_details, { foreignKey: 'user_id', as:'demo_video' });

user_recommendations.belongsTo(model.users, { foreignKey: 'user_id' });

user_assessments.belongsTo(model.professional_infos, {foreignKey: 'user_id', targetKey: 'user_id' });

model.users.hasMany(model.assessment_results, { foreignKey: 'user_id' });

model.assessment_results.belongsTo(model.assessments, { foreignKey: 'assessment_id' });
model.demovideo_details.belongsTo(model.assessments, { foreignKey: 'assessment_id' });



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

const updateUserPreference = async (req, res) => {
  let [excel] = await readNewExcelData();
  let userMobileMap = {};
  let subjectsArray = new Set();
  let levelsArray = new Set();
  let schoolsArray = new Set();
  let usersArray = new Set();
  excel.shift();
  excel.forEach(ele => {
    let phone = ele[5];
    for(i=9;i<12;i++) { if(ele[i]) { subjectsArray.add(ele[i]); }  }
    levelsArray.add(ele[7]);
    schoolsArray.add(ele[6]);
    if(ele[5])
      usersArray.add(String(ele[5]));

    userMobileMap[phone] = {
      "level_ids": [ele[7]],
      // "teaching_type": ele[8],
      "subject_ids": [ele[9],ele[10],ele[11]],
      "school_ids" : [ele[6]]
    };
  });

    // console.log("subjects Array", Array.from(subjectsArray));
    // console.log("Levels Array", Array.from(levelsArray));
    // console.log("Schools Array", Array.from(schoolsArray));
    
    [err, subjectsData] = await to(subjects.findAll({ where: { name: { [Op.in]: Array.from(subjectsArray) }}, raw: true }));
    let subjectMap = {};
    subjectsData.forEach(sub => { subjectMap[sub.name] = sub.id; });

    [err, levelsData] = await to(levels.findAll({ where: { name: { [Op.in]: Array.from(levelsArray) }}, raw: true }));
    let levelMap = {};
    levelsData.forEach(sub => { levelMap[sub.name] = sub.id; });

    [err, schoolsData] = await to(schools.findAll({ where: { name: { [Op.in]: Array.from(schoolsArray) }}, raw: true }));
    let schoolMap = {};
    schoolsData.forEach(sub => { schoolMap[sub.name] = sub.id; });

    [err, usersData] = await to(users.findAll({ where: { phone_no: { [Op.in]: Array.from(usersArray) }}, raw: true, attributes: ['id', 'phone_no'] }));
    let userMap = {};
    if(err) return ReE(res, err, 422);

    usersData.forEach(sub => { userMap[sub.phone_no] = sub.id; });


  // console.log("subjects map ", subjectMap);
  // console.log("levels map ", levelMap);
  // console.log("schools map ", schoolMap);
  // console.log("users map ", userMap);

  let bulkPayload = [];
  excel.forEach(ele => {
    let phone = ele[5];
    let user_id = userMap[phone];
    let subjectIds = new Set();
    for(i=9;i<12;i++) { if(ele[i]) { 
      if(subjectMap[ele[i]])
        subjectIds.add(subjectMap[ele[i]]); 
    }}
    let data = {
      user_id     : user_id,
      level_ids   : [levelMap[ele[7]]],//JSON.stringify(levelMap[ele[7]]),
      subject_ids : Array.from(subjectIds),//JSON.stringify(),
      school_ids  : [schoolMap[ele[6]]] //JSON.stringify(schoolMap[ele[6]])
    }
    if(user_id)
      bulkPayload.push(data);
  });

  console.log("bulkPayload[4]", bulkPayload.length);
  for(i=30;i<50;i++) {
    console.log("bulkPayload[i]", bulkPayload[i]);

  }
  // 355
  [err, bulkInsertData] = await to(user_teaching_interests.bulkCreate(bulkPayload));
  if(err) return ReE(res, err,422);

    return ReS(res, { data: "success"}, 200);
}
module.exports.updateUserPreference =updateUserPreference;

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

const getUserDetails = async (req, res)=> {
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  }
  try {
    let err, userDetails;
    // console.log("the user id ", req.params.user_id);
    [err, userDetails] = await to(users.findOne({
      where: { id: req.params.user_id },
      attributes: ["id", "profile_pic", "title", "first_name", "middle_name", "last_name", "email", "user_type", "is_email_verified", "country_code", "phone_no", "is_phone_verified", "dob", "gender", "employee_code"],
      include:[
        { 
          model: user_teaching_interests, 
          as: 'teaching_interests', 
          attributes:["id", "level_ids","school_ids","board_ids","subject_ids"],
        },
        { 
          model: assessment_results, 
          attributes: ["id", "assessment_id", "percentile", "type", "result", "skill_scores", "subject_scores","total_scored", "total", "skill_total"],
          include: [
            { 
              model: model.assessments,
              attributes: ["name"]
            } 
          ]

        },
        { 
          model: demovideo_details, as: 'demo_video', attributes:['id','assessment_id', 'video_link', 'demo_topic', 'demo_description', 'scores', 'status'],
          include: [
            { 
              model: model.assessments,
              attributes: ["name"]
            } 
          ]
        },
        { 
          model: user_interviews, 
          as:'interview', 
          attributes:["id", "mode", "room_no", "status", "interview_notes", "interview_remark"],
          require: false,
          include:[
            { 
              model: user_interview_feedbacks, 
              as: 'interview_feedback',
              attributes: ["about_candidate","candidate_past","ctc_current","ctc_expected","teaching_grades","teaching_boards","confidence_score","appearence_score","interview_notes","overall_rating","offer_selection"],
              require: false,
            },

            {
              model: interviewers,
              require: false
            }
          ]
        },
      ]
    }));
    if(err) return ReE(res, err, 422);

    if(!userDetails) { return ReE(res, `User not found with id ${req.params.user_id}`, ); }

    let levelData = [];
    let subjectData = [];
    let schoolData = [];
    let objData = userDetails.get({plain: true});
    if(objData.demo_video && objData.demo_video.length) {
      // console.log("the demovideo",objData.demo_video);
      objData.demo_video.map(row => {
        // console.log("the row value ", row);
        if(row.status == 'RECOMMENDED') { row.status = 'AGREE'; }
        if(row.status == 'NOT_RECOMMENDED') { row.status = 'DISAGREE'; }
      });
    }
    if(objData && objData.teaching_interests) {
        // console.log("the ids obj ", interestIds);
      [err, levelData] = await to(levels.findAll({ where: {id: objData.teaching_interests.level_ids }, attributes: ['id','name'], raw: true }));
      [err, schoolData] = await to(schools.findAll({ where: {id: objData.teaching_interests.school_ids }, attributes: ['id','name'], raw: true }));
      [err, subjectData] = await to(subjects.findAll({ where: {id: objData.teaching_interests.subject_ids }, attributes: ['id','name'], raw: true }));
      objData.levelData = levelData.map(ele => { return ele.name });
      objData.schoolData = schoolData.map(ele => { return ele.name });;
      objData.subjectData = subjectData.map(ele => { return ele.name });;
    }
    
    return ReS(res, {data : objData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getUserDetails = getUserDetails;

const getUserRecommendation = async (req, res) => {
try {
  let err, userData;
  try {
    let queryParams = {};
    let orData = [];
    console.log(req.query);

    if(req.query && req.query.filter) {
      Object.keys(req.query.filter).forEach(ele => {
        let excludeKey = ['user_type'];
        if(excludeKey.indexOf(ele) == -1) {
          queryParams[ele] = req.query.filter[ele].toUpperCase();
        }
      })
    }

    let searchArray = ['email', 'phone_no']
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

    let userFilter = {}
    if(req.query && req.query.filter && req.query.filter.user_type) {
      userFilter.user_type = req.query.filter.user_type;
    }


    let userAttributes = ['first_name', 'email','phone_no', 'user_type'];
    let userDetails = { 
      model: users, 
      as: 'user',
      where: userFilter,
      attributes: userAttributes,
      include: [{ 
        model: user_assessments, 
        require: false,
        attributes: ['assessment_id', 'user_id', 'status', 'type'],
        include: [
          {
            model: assessment_configurations,
            require: false,
            attributes: ['level_id'],
            include: [{
              model: levels,
              attributes: ['name'],
              require: false
            }]
          }
        ],
        where: { status: { [Op.in] : ['FINISHED', 'PASSED', 'FAILED'] }, type: 'MAINS' }
      }]
    };

    paginateData.order = [[`updated_at`, 'desc']];
     if(req.query && req.query.orderBy && userAttributes.indexOf(req.query.orderBy) >= 0) {

      let sortBy = req.query && req.query.sortBy ? req.query.sortBy : 'desc';
      paginateData.order = [[{model : users}, `${req.query.orderBy}`, sortBy]];
      // userDetails.separate = false;
      // delete paginateData.order;
    }

    paginateData.include = [
      userDetails
    ];

    paginateData.distinct = true;

    console.log(paginateData);

    [err, userData] = await to(user_recommendations.findAndCountAll(paginateData));
    if (err) return ReE(res, err, 422);
    
    if (userData) {
      userData.rows = userData.rows.map(ele => {
        let obj = ele.get({plain: true})
        //console.log(obj);
        if(obj.user && obj.user.user_assessments) {
       
         let levels = obj.user.user_assessments.map(e => {
          //console.log(JSON.stringify(obj.user.user_assessments));
            return e.assessment_configuration ? e.assessment_configuration.level.name  : null;
          });
         obj.levels = [...new Set(levels)];
        }
         return obj;
      })
      return ReS(res, { data: userData }, 200);
    } else {
      return ReE(res, "No user data found", 404);
    }
  } catch (err) {
    console.log(err);
    return ReE(res, err, 422);
  }
} catch (err) {
  return ReE(res, err, 422);
}
}
module.exports.getUserRecommendation = getUserRecommendation;

const userInterviewFeedback = async (req, res) => {
let err, interviewData;
let payload = req.body;
if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
  return ReE(res, "user id required in params", 422);
} 
try {
  payload.user_id = req.params.user_id;
  [err, interviewData] = await to(user_interview_feedbacks.update(payload, { 
    where: { user_id: req.params.user_id }
  }));
  if(err) return ReE(res, err, 422);

  if(interviewData && interviewData.length == 1 && interviewData[0] == 0) {
    // console.log("neee dto create new");
      [err, interviewData] = await to(user_interview_feedbacks.create(payload));
      if(err) return ReE(res, err, 422);
  }

  [err, interviewData] = await to(user_interview_feedbacks.findOne({
    where: { user_id: req.params.user_id },
    include: [
      {
        model: user_interviews, 
        attributes: ['id', 'recommended_level', 'interviewer_id', 'status', 'interview_remark', 'interview_notes'],
        include: [
          {model: interviewers}
        ]
      }
    ]
  })); 
  if(err) return ReE(res, err, 422);
  if(interviewData) {
    // set the interview_slot of interviewer to null
    let interviewer = interviewData.user_interview.interviewer;
    interviewer.interview_slot = null;
    interviewer.save();
    // console.log("The interviewer data ",JSON.parse(JSON.stringify(interviewData.user_interview.interviewer)));
  }
    // console.log("The interview data ",JSON.parse(JSON.stringify(interviewData)));

  let urPayload = {};
  urPayload.interview_score = payload.overall_rating;
  urPayload.interview_score_total = 10;
  urPayload.status = (payload.offer_selection && payload.offer_selection == 'YES') ? 'SELECTED' : 'NOT_SELECTED';
  [err, interviewData] = await to(user_recommendations.update(urPayload, {where: {user_id: req.params.user_id } }));
  if(err) return ReE(res, err, 422);

  //send mail to school hr
  let subject = "Interview Feedback";
  let email_to = "kanhailal2010@gmail.com";
  // await sendMailToHr(subject, email_to);

  // generate pdf
  let pdfData = { 
    school_name: 'Vibgyor Dadar',
    scores: '80/100',
  };
  [err, userData] = await to(users.findOne({
    where: {id: req.params.user_id },
    attributes:['first_name', 'middle_name', 'last_name', 'full_name', 'email'],
    include:[
      { model: assessment_results}
    ]
  }));
  if(err) return ReE(res, err, 422);

  if(userData && userData.length) {
    pdfData.name = userData.full_name;
    pdfData.email = userData.email;
  }
  await generateFeedbackPdf(pdfData);

  return ReS(res, {data: userData}, 200);
} catch (err) {
  return ReE(res, err, 422)  ;
}

}
module.exports.userInterviewFeedback = userInterviewFeedback;

const generateFeedbackPdf = async (pdfData) => {
  try {
    let localPath = __dirname + `/../..`;
    // const filePathName = path.resolve(__dirname, 'htmltopdf.ejs');
    //     const htmlString = fs.readFileSync(filePathName).toString();
    //     let  options = { format: 'Letter' };
    
    let html = fs.readFileSync(`${localPath}/views/interview-feedback-pdf.ejs`).toString();
    const ejsData = ejs.render(html, pdfData);
    // console.log(`The HTML is ${html}`);
    var options = {
      // Export options
      "directory": `${localPath}/public/files`,       // The directory the file gets written into if not using .toFile(filename, callback). default: '/tmp'
      // "height": "11.7in",        // allowed units: mm, cm, in, px
      // "width": "9.3in",            // allowed units: mm, cm, in, px
      "width": "732px",
      "height" : "1000px",
      // "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid

      // "orientation": "portrait", // portrait or landscape
      // Page options
      "border": "0",             // default is 0, units: mm, cm, in, px
    };
    
    pdf.create(ejsData, options).toFile(`${localPath}/public/files/interview_feedback.pdf`, function(err, res) {
      if (err) return console.log(err);
      console.log(res); // { filename: '/app/businesscard.pdf' }
    });

    // await htmlToPdf.convertHTMLFile(html, `${localPath}/public/files/interview_feedback.pdf`,
    // function (error, success) {
    //    if (error) {
    //         console.log('Oh noes! Errorz!');
    //         console.log(error);
    //     } else {
    //         console.log('Woot! Success!');
    //         console.log(success);
    //     }
    //   }
    // );
  } catch (err) {
    TE(err);
  }
};

const sendMailToHr = async (subject, email_to) => {
  parameters = { name: 'HrName' };
  let html = await ejs.render(
    fs.readFileSync(__dirname + `/../../views/interview.ejs`).toString(),
    parameters
  );
  
  if(email_to) {
    try {
      let mailObject = { to: email_to , subject: subject, html: html, attachments: [
        {
          filename: 'sample.pdf',
          path: __dirname + `/../../public/assets/sample.pdf`,
          contentType: 'application/pdf'
        }
      ]};
      let response = await mailer.sendWithAttachment(mailObject);
      // console.log("mail reponse", response);
      return true;
    } catch(err) {
      throw new Error('Error sending Email not sent', err);
    }
  } else {
    throw new Error('Email not found');
  }
}

const getUserInterview = async (req, res) => {
  let err, interviewData;
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  } 
  try {
    [err, interviewData] = await to(user_interviews.findOne({ 
      where: { user_id: req.params.user_id},
      // attributes: ['id', 'user_id', 'assessment_id', 'interviewer'],
      include: [ 
        { model: user_interview_feedbacks, as: 'interview_feedback', 
        attributes:["about_candidate","candidate_past","ctc_current", "ctc_expected","teaching_grades","teaching_boards","confidence_score","appearence_score","interview_notes","overall_rating","offer_selection"],
        // where: { assessment_id: req.params.assessment_id }
       }
       
      ]
    }));
    if(err) return ReE(res, err, 422);

    return ReS(res, {data: interviewData}, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getUserInterview = getUserInterview;

module.exports.getAllUserInterview = async (req, res) => {
  let err, interviewData;
  try {
    [err, interviewData] = await to(user_interviews.findAll({ 
      // where: { user_id: req.params.user_id},
      attributes: ['id', 'user_id', "recommended_level","interviewer_id","mode","exam_location","room_no","status","interview_notes","interview_remark"],
      include: [ 
        {
          model: users, attributes:['id', 'profile_pic', 'first_name', 'middle_name', 'last_name', 'email']
        },
        { 
          model: user_interview_feedbacks, as: 'interview_feedback', 
          attributes:["about_candidate","candidate_past","ctc_current", "ctc_expected","teaching_grades","teaching_boards","confidence_score","appearence_score","interview_notes","overall_rating","offer_selection"],
          // where: { assessment_id: req.params.assessment_id }
        },
        { 
          model: user_teaching_interests, as: 'teaching_interests', 
          attributes: ['id', 'level_ids', 'school_ids', 'subject_ids', 'board_ids']
        },
        {
          model: interviewers
        }
      ]
    }));
    if(err) return ReE(res, err, 422);

  [err, levelData] = await to(levels.findAll({ attributes:['id', 'name'] }));
  let levelMap = {};
  levelData.map(ele => { levelMap[ele.id] = ele.name; } );
  [err, subjectData] = await to(subjects.findAll({ attributes:['id', 'name'] }));
  let subjectMap = {};
  subjectData.map(ele => { subjectMap[ele.id] = ele.name; } );
  [err, boardData] = await to(boards.findAll({ attributes:['id', 'name'] }));
  let boardMap = {};
  boardData.map(ele => { boardMap[ele.id] = ele.name; } );

  // console.log("the interveiw query Data ", JSON.parse(JSON.stringify(interviewData)));
  let resultData = interviewData.map(obj => {
    let row = obj.get({plain: true});
    // console.log("the interveiw query row ", JSON.parse(JSON.stringify(row)));
    // if(row.id == 5105) { console.log("interested levels ",row.teaching_interests.level_ids); }
      if(row.teaching_interests && row.teaching_interests.level_ids){
        // console.log("interested levels ",row.teaching_interests.level_ids);
        row.levels = row.teaching_interests.level_ids.map(lev => { return {id: lev,  name:levelMap[lev]}});
      }
      else { row.levels = []; }
      if(row.teaching_interests && row.teaching_interests.subject_ids){
        row.subjects = row.teaching_interests.subject_ids.map(sub => { return { id:sub, name:subjectMap[sub]}});
      }
      else { row.subjects = []; }
      if(row.teaching_interests && row.teaching_interests.board_ids){
        row.boards = row.teaching_interests.board_ids.map(sub => { return { id:sub, name:boardMap[sub]}});
      }
      else { row.boards = []; }      
      if(row.recommended_level){
        row.recommended_level = levelMap[row.recommended_level];
      }
      else { row.recommended_level = ""; }
      return row;
    });

    return ReS(res, {data: resultData}, 200);
  } catch (err) {
    return ReE(res, err, 422);
  } 
}

const getInterviewDate = () => {
  // Set the timezone to IST (Indian Standard Time)
  moment.tz.setDefault('Asia/Kolkata');

  // Get the current date and time
  const currentDate = moment();

  // Find the next weekday (Monday to Friday)
  let futureDate = currentDate.clone().add(3, 'days');
  while (futureDate.isoWeekday() > 5) {
    futureDate = futureDate.add(1, 'day');
  }
  // Set the time to 2:15 PM
  futureDate.set({ hour: 14, minute: 15, second: 0 });
  // Format the date as desired
  const formattedDate = futureDate.format('YYYY-MM-DD HH:mm:ss');
  return formattedDate;
}

const getSingleInterestedSchoolId = async (user_id) => {
  let err, userData;
  if(!user_id) return TE('user_id should not be null');
  [err, userData] = await to(users.findOne({
    where: { id: user_id },
    include: [
      { model: user_teaching_interests, as:'teaching_interests' },
    ]
  }));
  // console.log("userdata teaching interest",userData.teaching_interests);
  userSchoolIds = [142];
  if(userData) {
    userSchoolIds = userData.teaching_interests.school_ids ? userData.teaching_interests.school_ids : userSchoolIds;
  };
  let schoolId = _.sample(userSchoolIds);
  console.log(`Selected ${schoolId} from an array of ${userSchoolIds}`);
  return schoolId;
}

const getInterviewerDetails = async (user_id, schoolId) => {
  let err, userData, schoolData;
  // let interestedSchoolId = await getSingleInterestedSchoolId(user_id);
  schoolId = schoolId ? schoolId : await getSingleInterestedSchoolId(user_id);
  [err, schoolData] = await to(schools.findAll({ 
    where: { id: schoolId }, 
    attributes: ['id', 'name', 'address'],
    include: [
      { 
        model: interviewers, 
        where: { interview_slot: null },
        attributes: ['id', 'name', 'interview_slot'] 
      }
    ]
  }));
  // console.log(JSON.parse(JSON.stringify(schoolData)));
  if(schoolData[0]) {
    let interviewer = _.sample(schoolData[0].interviewers);
    interviewer.interview_slot = getInterviewDate();
    interviewer.save();
    return [
      interviewer.id,
      interviewer.name,
      `${schoolData[0].name}, ${schoolData[0].address}`
    ];
    
  }
  else { 
    //TODO: set a default interviwer
    return TE(`School data for school_id ${schoolId} not found`);
   }
}

module.exports.setUserInterview = async (req, res) => {
  let err, interviewData;
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  }
  try {
    let levelMap = {};
    [err, levelData] = await to(levels.findAll({attributes:['id', 'name']}));
    levelData.map(ele => { levelMap[ele.name] = ele.id; } );
    let payload = req.body;
    payload.user_id = req.params.user_id;
    let [id, interviewerName, interviewLocation]   = await getInterviewerDetails(req.params.user_id);
    payload.interviewer_id  = (payload.interview_slot) ? payload.interview_slot : id;
    payload.interviewer     = (payload.interviewer) ? payload.interviewer : interviewerName;
    payload.exam_location   = (payload.exam_location) ? payload.exam_location : interviewLocation;
    // console.log("the generated payload ", payload);
    if(payload.recommended_level && payload.recommended_level != '') {
      payload.recommended_level = levelMap[payload.recommended_level];
    }
    [err, interviewData] = await to(user_interviews.update(payload, {where : {user_id: req.params.user_id} }));
    if(err) return ReE(res, err, 422);

    if(interviewData && interviewData.length && interviewData[0] == 1) {
      // console.log("found record updating");
      [err, interviewData] = await to(user_interviews.findOne({where: { user_id: req.params.user_id } }));
      if(err) return ReE(res, err, 422);
    }
    else {
      // console.log("creating new record");
      [err, interviewData] = await to(user_interviews.create(payload));
      if(err) return ReE(res, err, 422);
    }

    let urPayload = {};
    urPayload.status = 'INTERVIEW';
    [err, userRecommendData] = await to(user_recommendations.update(urPayload, {where: {user_id: req.params.user_id } }));
    if(err) return ReE(res, err, 422);

    return ReS(res, {data: interviewData}, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}

module.exports.updateRecommendStatus = async (req, res) => {
  let err, statusData;
  let payload = req.body;
  if (_.isEmpty(req.params.user_id) || _.isUndefined(req.params.user_id)) {
    return ReE(res, "user id required in params", 422);
  } 
  if (_.isEmpty(payload.recommendation_status) || _.isUndefined(payload.recommendation_status)) {
    return ReE(res, "recommendation_status is required in payload", 422);
  } 
  try {
    [err,statusData] = await to(user_recommendations.update(payload, { 
      where: { user_id: req.params.user_id } 
    }));
    if(err) return ReE(res, err, 422);

    return ReS(res, {data: statusData}, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}