const { users, countries, states, districts, cities, talukas, academics, professional_infos, user_communications, user_assessments, user_teaching_interests,levels,schools, boards, subjects } = require("../../models");
const authService = require("../../services/auth.service");
const { to, ReE, ReS, toSnakeCase, sendSMS, isBlank, validatePhoneNo } = require("../../services/util.service");
var moment = require("moment");
var _ = require('underscore');
var ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const mailer = require("../../helpers/mailer"); 
const axios = require('axios');
const NodeCache = require( "node-cache" );
const otpCache = new NodeCache( { stdTTL: 10000, checkperiod: 10000 } );

var Sequelize = require("sequelize");
const { response } = require("express");
const Op = Sequelize.Op;

users.belongsTo(countries, {foreignKey: 'country_id'});
users.belongsTo(states, {foreignKey: 'state_id'});
users.belongsTo(districts, {foreignKey: 'district_id'});
users.belongsTo(talukas, {foreignKey: 'taluka_id'});

const get = async function (req, res) {
  let user = req.user;

  let isProfileCreated = false;
  let isAcademicInfo = false;
  let isProfessionalInfo = false;
  let isInterestInfo = false;

  [err, userData] = await to(users.findOne({ where: { id: user.id }, raw: true }));

  let academicData = null;
  let professionalInfosData = null;
  let interestData = null;
  [err, academicData] = await to(academics.findOne({ where: { user_id: userData.id } }));
  [err, professionalInfosData] = await to(professional_infos.findOne({ where: { user_id: userData.id } }));
  [err, interestData] = await to(user_teaching_interests.findOne({ where: { user_id: userData.id } }));
  

  if(academicData) {
    isAcademicInfo = true;
  }

  if(professionalInfosData) {
    isProfessionalInfo = true;
  }

  if(interestData) {
    isInterestInfo = true;
  }

  if(userData.first_name && userData.phone_no && userData.email) {
    isProfileCreated = true;
  }
  

  let is_screening_test_taken = false;
  let is_mains_test_taken = false;

  [err, user_assessment_data_screening] = await to(user_assessments.findOne({ where: { user_id : userData.id, screening_status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']} }, order: [['id', 'desc']] }));
  [err, user_assessment_data_mains] = await to(user_assessments.findOne({ where: { user_id : userData.id, mains_status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']} }, order: [['id', 'desc']] }));
  
  if(user_assessment_data_mains) {
    is_mains_test_taken = true
  }

  if(user_assessment_data_screening) {
    is_screening_test_taken = true
  }

  userData.is_profile_created = isProfileCreated && isAcademicInfo && isProfessionalInfo;
  userData.is_personal_info_captured = isProfileCreated;
  userData.is_academic_info_captured = isAcademicInfo;
  userData.is_professional_info_captured = isProfessionalInfo;
  userData.is_interest_captured = isInterestInfo;
  userData.is_mains_test_taken = is_mains_test_taken;
  userData.is_screening_test_taken = is_screening_test_taken;

  return ReS(res, { user: userData });
};
module.exports.get = get;

const update = async function (req, res) {
    let err, user, data, userData;
    user = req.user;
  data = req.body;

    // remove blank, -1, null contining keys from data
  data = Object.keys(data).filter(e=> { 
    // console.log("ele ",e, obj[e]); 
    if (data[e] === -1 || data[e] === "" || data[e] === null) {
      return false;
    }
    else return true;
  }).reduce((a, key) => ({ ...a, [key]: data[key] }), {});

  let dob_data = moment(data.dob, "YYYY-MM-DD");
  dob_data.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  data.dob = dob_data.format("YYYY-MM-DD");
  console.log(data.dob);

  if (data.email && user.email !== data.email) {
    [err, userData] = await to(users.findOne({ where: { email: data.email } }));
    if (userData != null) {
      return ReE(res, "User already exist with email.", 422);
    }
  } 
  console.log("user ===============",  user.phone_no, data.phone_no)
  if (data.phone_no && user.phone_no !== data.phone_no) {
    [err, userData] = await to(users.findOne({ where: { phone_no: data.phone_no } }));
    if (userData != null) {
      return ReE(res, "User already exist with phone number.", 422);
    }
  }

  if(data.country_name || data.country_id) {
    let whereCondition = {};
    if(data.country_name && data.country_name.trim() !=='') { whereCondition.country_name = data.country_name; }
    if(data.country_id && data.country_id !=='' ) { whereCondition.id = data.country_id; }
    [err, countryData] = await to(countries.findOne({
      where: whereCondition
    }));
    if(countryData) { 
      data.country_id = countryData.id; 
      data.country_name = countryData.country_name;
    }
  }
  if(data.state_name || data.state_id) {
    let whereCondition = {};
    if(data.state_name && data.state_name.trim() !=='') { whereCondition.state_name = data.state_name; }
    if(data.state_id && data.state_id !=='' ) { whereCondition.id = data.state_id; }
    [err, stateData] = await to(states.findOne({
      where: whereCondition
    }));
    if(stateData) { 
      data.state_id = stateData.id; 
      data.state_name = stateData.state_name;
    }
  }

  if(data.district_name || data.district_id) {
    let whereCondition = {};
    if(data.district_name && data.district_name.trim() !=='') { whereCondition.district_name = data.district_name; }
    if(data.district_id && data.district_id !=='' ) { whereCondition.id = data.district_id; }
    [err, districtData] = await to(districts.findOne({
      where: whereCondition
    }));
    if(districtData) { 
      data.district_id = districtData.id; 
      data.district_name = districtData.district_name;
    }
  }

  if(data.city_name || data.city_id) {
    let whereCondition = {};
    if(data.city_name && data.city_name.trim() !=='') { whereCondition.city_name = data.city_name; }
    if(data.city_id && data.city_id !=='' ) { whereCondition.id = data.city_id; }
    [err, cityData] = await to(cities.findOne({
      where: whereCondition
    }));
    if(cityData) { 
      data.city_id = cityData.id; 
      data.city_name = cityData.city_name;
    }
  }
  
  user.set(data);
  [err, user] = await to(user.save());

  // // fetch user again and apply association
  // [err, userData] = await to(users.findOne({
  //   where: { id: user.id },
  //   // include: [
  //   //   { model: countries, as: 'country', attributes:['id', 'country_name']},
  //   //   { model: states, as: 'state', attributes:['id', 'state_name']},
  //   //   { model: districts, as: 'district', attributes:['id', 'district_name']},
  //   //   { model: talukas, as: 'taluka', attributes:['id', 'taluka_name']},
  //   // ]
  // }));
  
  if (err) {
    if (err.message == "Validation error")
      err = "The email address or phone number is already in use";
    return ReE(res, err, 422);
  }
  return ReS(res, { data: user }, 200);
};
module.exports.update = update;

const remove = async function (req, res) {
  let user, err;
  user = req.user;

  [err, user] = await to(user.destroy());
  if (err) return ReE(res, "error occured trying to delete user");

  return ReS(res, { message: "Deleted User" }, 204);
};
module.exports.remove = remove;

// generate OTP
const generateUserOtp = async function (req, res) {
  let err, user;
  console.log(req.user.id);
  let payload = req.body;
  [err, user] = await to(users.findOne({ where: { id: req.user.id } }));
  let generate_otp = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);;
  user.otp = generate_otp;
  user.otp_expire = moment().add(2, 'minutes').format("YYYY-MM-DD HH:mm:ss");
  try {
    user.save();

    if(payload.email) {
      let parameters = { otp: generate_otp };
      let html = ejs.render(
        fs.readFileSync(__dirname + `/../../views/otpTemplate.ejs`).toString(),
        parameters
      );
      var subject = "LMS Connect OTP";
      let response = await mailer.send(payload.email, subject, html);
    }
    if(payload.mobile) {
      await sendSMS(payload.mobile, payload.otp);
    }
    return ReS(res, { message: "OTP has been generated successfully" });
  } catch (err) {
    console.log(err);
    return ReE(
      res,
      "Something went wrong, please try again or please connect with Knoggles support team.",
      422
    );
  }

};
module.exports.generateUserOtp = generateUserOtp;

// generate OTP
const verifyUserOtp = async function (req, res) {
  const payload = req.body;
  let err, user;

  if (payload.otp == undefined || payload.method == undefined) {
    return ReE(res, "OTP is required with method.", 422);
  }
  let payloadBody = { id: req.user.id, otp: payload.otp };
  if(payload.debug) {
    delete payloadBody.otp;
  }
  try {
    [err, user] = await to(users.findOne({ where: payloadBody }));
    if (user == null) {
      return ReE(
        res,
        "invalid otp",
        422
      );
    }

    if (user.otp_expire) {
      console.log(user.otp_expire)
      let currentTime = moment().utc();
      let expire_otp = moment(user.otp_expire, 'YYYY-MM-DDTHH:mm:ssZ').utc();
      console.log(currentTime.isSameOrAfter(expire_otp));
      if (currentTime.isSameOrAfter(expire_otp)) {
        return ReE(
          res,
          "OTP has been expired",
          422
        );
      }
      if (payload.method == 'email') {
        user.is_email_verified = true;
      }
      if (payload.method == 'phone') {
        user.is_phone_verified = true;
      }
      user.otp = null;
      user.otp_expire = null;
      user.save();
      return ReS(res, { message: "otp verify successfully" });
    }
  } catch (err) {
    return ReE(
      res,
      "Something went wrong, please try again or please connect with Knoggles support team.",
      422
    );
  }

};
module.exports.verifyUserOtp = verifyUserOtp;

const login = async function (req, res) {
  const payload = req.body;
  let userPayload = {};
  let err, userData;
  if (payload.email) {
    [err, userData] = await to(users.findOne({ where: { email: payload.email } }));
  } else if (payload.mobile) {
    [err, userData] = await to(users.findOne({ where: { phone_no: payload.mobile } }));
  }
  if(userData == null) {
    return ReE(
      res,
      "Account not found",
      422
    );
  }
  


  // check concurrent login
  if(userData.is_logged_in) {
    console.log("already logged in ");
    return ReE(res, 'You are already Logged In.', 422);
  }
  else {
    userData.is_logged_in = true;
    userData.save();
  }

  let generate_otp = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);;
  userData.otp = generate_otp;
  userData.otp_expire = moment().add(2, 'minutes').format("YYYY-MM-DD HH:mm:ss");
  userData.save();
  
  if(payload.email) {
    let parameters = { otp: generate_otp };
    let html = ejs.render(
      fs.readFileSync(__dirname + `/../../views/otpTemplate.ejs`).toString(),
      parameters
    );
    
    var subject = "LMS Connect OTP";
    let response = await mailer.send(payload.email, subject, html);
  }

  if (err) return ReE(res, err, 422);
  
  if (userData.status == "PENDING") {
    return ReE(
      res,
      "Your account not yet active, please verify your account through email.",
      422
    );
  }

  if (userData.status == "BLOCK") {
    return ReE(
      res,
      "Sorry your account block by admin please connect with Knoggles support team.",
      422
    );
  }
  
  delete userData.otp;
  return ReS(res, { token: userData.getJWT(), user: userData.toWeb() });
};
module.exports.login = login;

const logout = async (req, res)=> {
  let err, userData;
  // console.log("req received ",req.headers.authorization);
  [err, userData] = await to(users.findOne({ where: { id: req.user.id } }));
  userData.is_logged_in = false;
  userData.save();

  return ReS(res, { 'logout': 'successfull' });
};
module.exports.logout = logout;

//upsertAcademics

const createAcademics = async function (req, res) {
  let err, academicsData;
  let payload = req.body;
  if (!payload.programme) {
    return ReE(res, "Please enter a programme", 422);
  } else if (!payload.start_date) {
    return ReE(res, "Please enter a start date.", 422);
  } else if (!payload.institution) {
    return ReE(res, "Please enter a institution.", 422);
  } else if (!payload.extra_carricular_activities) {
    return ReE(res, "Please enter a extra curricular activities", 422);
  } else {
    try {
      //date format code
      let startDateTime = moment(payload.start_date, ["DD/MM/YYYY", "YYYY-MM-DD"]);
      payload.start_date = startDateTime.format("YYYY-MM-DD");
      
      if(!isBlank(payload.end_date)) {
        let endDateTime = moment(payload.end_date, ["DD/MM/YYYY", "YYYY-MM-DD"]);
        payload.end_date = endDateTime.format("YYYY-MM-DD");
      } else {
        payload.end_date = null;
      }
      
      //user assign
      payload.user_id = req.user.id;
      payload.extra_carricular_activities = payload.extra_carricular_activities != null && payload.extra_carricular_activities != undefined && payload.extra_carricular_activities != ''  ? payload.extra_carricular_activities.join(',') : null;
      payload.achievements = payload.achievements != null && payload.achievements != undefined && payload.achievements != ''  ? payload.achievements.join(',') : null;

      [err, academicsData] = await to(academics.create(payload));
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: academicsData }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
};
module.exports.createAcademics = createAcademics;


// create user teaching interest
const createUserTeachingInterest = async function (req, res) {
  let err, academicsData, response;
  let payload = req.body;
  if (!payload.level_ids || !payload.school_ids || !payload.board_ids || !payload.subject_ids) {
    return ReE(res, "levels, schools, boards and subject ids is required", 422);
  } else {
    try {
      //user assign
      payload.user_id = req.user.id;

      [err, response] = await to(user_teaching_interests.findOne({ where: { user_id: payload.user_id } }));
      if (err) return ReE(res, err, 422);
      if(response) {
        response.update(payload);
      } else {
        [err, response] = await to(user_teaching_interests.create(payload));
        if (err) return ReE(res, err, 422);
      }
      return ReS(res, { data: response }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
};
module.exports.createUserTeachingInterest = createUserTeachingInterest;
// end 

// get user teaching interest
const getUserTeachingInterest = async function (req, res) {
  let err, response;
  let payload = req.body;
  try {
    //user assign
    payload.user_id = req.user.id;

    [err, response] = await to(user_teaching_interests.findOne({ where: { user_id: payload.user_id } }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: response }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUserTeachingInterest = getUserTeachingInterest;
// end 

// get user teaching interest with names
const getUserTeachingInterestNames = async function (req, res) {
  let err, response, levelData, schoolData, boardData, subjectData;
  let payload = req.body;
  try {
    //user assign
    payload.user_id = req.user.id;

    [err, response] = await to(user_teaching_interests.findOne({ where: { user_id: payload.user_id }, raw:true }));
    if (err) return ReE(res, err, 422);

    // console.log("the ids obj ", interestIds);
    [err, levelData] = await to(levels.findAll({ where: {id: response.level_ids }, attributes: ['id','name'] }));
    [err, schoolData] = await to(schools.findAll({ where: {id: response.school_ids }, attributes: ['id','name'] }));
    [err, boardData] = await to(boards.findAll({ where: {id: response.board_ids }, attributes: ['id','name'] }));
    [err, subjectData] = await to(subjects.findAll({ where: {id: response.subject_ids }, attributes: ['id','name'] }));
    
    let finalOutput = {};
    finalOutput.id = response.id;
    finalOutput.user_id = response.user_id;
    finalOutput.levels = levelData;
    finalOutput.schools = schoolData;
    finalOutput.boards = boardData;
    finalOutput.subjects = subjectData;
    

    return ReS(res, { data: finalOutput }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUserTeachingInterestNames = getUserTeachingInterestNames;

const createBulkAcademics = async function (req, res) {
  let err, academicsData;
  let payload = req.body;
  
  let academicsError = [];
  let requiredField = ["institution", "programme", "start_date", "field_of_study"];
  payload.forEach((ele, k) => {
    
    let diff = _.difference(requiredField, Object.keys(ele));
    console.log(diff, requiredField, Object.keys(ele));
    if (diff.length > 0) {
      academicsError.push(`academics[${k}] fields ${diff.join(',')} is required`);
    }
  });

  payload = payload.map(ele => {
    for (const val in ele) {
      ele[val] = !isBlank(ele[val]) ? ele[val] : null;
    }
    
    let obj  = {...ele};
    
    obj.user_id = req.user.id;
    obj.extra_carricular_activities = ele.extra_carricular_activities != null && ele.extra_carricular_activities != undefined && ele.extra_carricular_activities != ''  ? ele.extra_carricular_activities.join(',') : null;
    obj.achievements = ele.achievements != null && ele.achievements != undefined && ele.achievements != ''  ? ele.achievements.join(',') : null;
    return obj;
  });

  if (academicsError.length > 0) {
    return ReE(res, academicsError.join(", "), 422);
  }
  
  try {
    //user assign
    [err, academicsDeleted] = await to(academics.destroy({ where: { user_id: req.user.id }, force: true }));
    [err, academicsData] = await to(academics.bulkCreate(payload));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: academicsData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }

};
module.exports.createBulkAcademics = createBulkAcademics;




const getAllUserAcademics = async function (req, res) {
  let err, academicsData;
  try {
    [err, academicsData] = await to(academics.findAll({ where: { user_id: req.user.id } }));
    if (err) return ReE(res, err, 422);
    
    return ReS(res, { data: academicsData }, 200); 
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllUserAcademics = getAllUserAcademics;

const getUserAcademic = async function (req, res) {
  let err, academicData;

  if (req.params && req.params.academic_id == undefined) {
    return ReE(res, { message: "Academic id params is missing" }, 422);
  }
  try {
    [err, academicData] = await to(academics.findOne({ where: { id: req.params.academic_id } }));
    if (err) return ReE(res, err, 422);
    if (academicData !== null) {
      return ReS(res, { data: academicData }, 200);
    } else {
      return ReE(res, "No academic data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getUserAcademic = getUserAcademic;

const updateUserAcademic = async function (req, res) {
  let err, academicData;
  let payload = req.body;
  if (req.params && req.params.academic_id == undefined) {
    return ReE(res, { message: "Academic id params is missing" }, 422);
  }
  try {
    [err, academicData] = await to(academics.findOne({ where: { id: req.params.academic_id } }));
    if (err) return ReE(res, err, 422);
    if (academicData == null) {
      return ReE(res, "No academic data found", 404);
    } else {
      payload.extra_carricular_activities = payload.extra_carricular_activities != null && payload.extra_carricular_activities != undefined && payload.extra_carricular_activities != ''  ? payload.extra_carricular_activities.join(',') : null;
      payload.achievements = payload.achievements != null && payload.achievements != undefined && payload.achievements != ''  ? payload.achievements.join(',') : null;
      await academicData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: academicData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateUserAcademic = updateUserAcademic;

const deleteUserAcademic = async function (req, res) {
  let err, academicData;
  if (req.params && req.params.academic_id == undefined) {
    return ReE(res, { message: "Academic id params is missing" }, 422);
  }
  try {
    [err, academicData] = await to(academics.findOne({ where: { id: req.params.academic_id } }));
    if (err) return ReE(res, err, 422);
    if (academicData == null) {
      return ReE(res, "No academic data found", 404);
    } else {
      academicData.destroy();
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "Academic deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteUserAcademic = deleteUserAcademic;

const generateOtp = async function (req, res) {
  let payload = req.body;
  let generate_otp = Math.floor(Math.random() * (9 * Math.pow(10, 6 - 1))) + Math.pow(10, 6 - 1);;
  payload.otp = generate_otp;
  let success = false;
  let userDataD = null;
  try {

    if (payload.email) {
      
    } else if (payload.mobile) {
      if(validatePhoneNo(payload.mobile)) {
        return ReE(res, "phone number is not valid, please reenter correct phone number.", 422);
      }
    }

    if(payload.email) {
      let parameters = { otp: payload.otp };
      let html = ejs.render(
        fs.readFileSync(__dirname + `/../../views/otpTemplate.ejs`).toString(),
        parameters
      );
      
      var subject = "LMS Connect OTP";
      let response = await mailer.send(payload.email, subject, html);
      console.log("test", response);
      success = otpCache.set(payload.email, payload.otp, 300 );
    }
    if(payload.mobile) {
      let data = await sendSMS(payload.mobile, payload.otp);
      success = otpCache.set(payload.mobile, payload.otp, 300 );
      console.log(data);
    }

    if(success) {
      return ReS(res, { message: "OTP sent successfully" });
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.generateOtp = generateOtp;

const verifyOtp = async function (req, res) {
  let payload = req.body;
  let userData;
  if(payload.otp == undefined) {
    return ReE(res, "OTP is required to validate user.", 422);
  }
  try {
    
    // // check concurrent login
    // if(userData.is_logged_in) {
    //   console.log("already logged in ");
    //   return ReE(res, 'You are already Logged In.', 422);
    // } else {
    //   userData.is_logged_in = true;
    //   userData.save();
    // }

    let existingOTP = null;
    if(payload.email) {
      existingOTP = otpCache.get(payload.email);
    }

    if(payload.mobile) {
      existingOTP = otpCache.get(payload.mobile);
    }
    
    if(existingOTP == undefined) {
      return ReE(
        res,
        "OTP has been expired",
        422
      );
    } else if(payload.otp != existingOTP && payload.debug == undefined) {
      return ReE(
        res,
        "invalid otp",
        422
      );
    }

    if(payload.otp == existingOTP || payload.debug == true) {
      if(payload.user_id) {
        if (payload.mobile) {
          let userPayload = { phone_no: payload.mobile, is_phone_verified: true };
          await to(users.update(userPayload, { where: { id: payload.user_id } }));
        } else if(payload.email) {
          let userPayload = { email: payload.email, is_email_verified: true };
          await to(users.update(userPayload, { where: { id: payload.user_id } }));
        }
        [err, userData] = await to(users.findOne({ where: { id: payload.user_id } }));
      } else {
        if (payload.email) {
          [err, userData] = await to(users.findOne({ where: { email: payload.email } }));
          if (userData == null) {
            userPayload = { email: payload.email, is_email_verified: true };
          }
          if(err) {
            return ReE(res, err, 422);
          }
        } else if (payload.mobile) {
          if(validatePhoneNo(payload.mobile)) {
            return ReE(res, "phone number is not valid, please reenter correct phone number.", 422);
          }
          [err, userData] = await to(users.findOne({ where: { phone_no: payload.mobile } }));
          if (userData == null) {
            userPayload = { phone_no: payload.mobile, is_phone_verified: true };
          }
        }
      }


      // console.log(userData);
      // return false;

      let isProfileCreated = false;
      let isAcademicInfo = false;
      let isProfessionalInfo = false;
      let isInterestInfo = false;
      if (userData == null) {
        let uuiD = await authService.getUUID();
        userPayload.uuid = uuiD;
        [err, userData] = await to(users.create(userPayload));
      } else {
        let academicData = null;
        let professionalInfosData = null;
        let interestData = null;
        [err, academicData] = await to(academics.findOne({ where: { user_id: userData.id } }));
        [err, professionalInfosData] = await to(professional_infos.findOne({ where: { user_id: userData.id } }));
        [err, interestData] = await to(user_teaching_interests.findOne({ where: { user_id: userData.id } }));
        

        if(academicData) {
          isAcademicInfo = true;
        }

        if(professionalInfosData) {
          isProfessionalInfo = true;
        }

        if(interestData) {
          isInterestInfo = true;
        }

        if(userData.first_name && userData.phone_no && userData.email) {
          isProfileCreated = true;
        }
      }

      let is_screening_test_taken = false;
      let is_mains_test_taken = false;

      [err, user_assessment_data_screening] = await to(user_assessments.findOne({ where: { user_id : userData.id, screening_status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']} }, order: [['id', 'desc']] }));
      [err, user_assessment_data_mains] = await to(user_assessments.findOne({ where: { user_id : userData.id, mains_status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']} }, order: [['id', 'desc']] }));
      
      if(user_assessment_data_mains) {
        is_mains_test_taken = true
      }
      if(user_assessment_data_screening) {
        is_screening_test_taken = true
      }

      userData.is_logged_in = true;
      userData.save();

      return ReS(res, { 
        token: userData.getJWT(),  
        user_id: userData.id,
        uuid: userData.uuid,
        is_profile_created: isProfileCreated && isAcademicInfo && isProfessionalInfo,
        is_personal_info_captured: isProfileCreated,
        is_academic_info_captured: isAcademicInfo,
        is_professional_info_captured: isProfessionalInfo,
        is_interest_captured: isInterestInfo,
        is_mains_test_taken: is_mains_test_taken,
        is_screening_test_taken: is_screening_test_taken
      });
      
    } else {
      return ReE(
        res,
        "invalid otp",
        422
      );
    }
   

  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.verifyOtp = verifyOtp;

// ************************************** PROFESSIONAL INFOS API ***********************************

const createProfessionalInfos = async function (req, res) {
  let err, professionalInfoData;
  
  let payload = req.body;
  payload.user_id = req.user.id;

  if(payload.is_fresher) {
    payload.experience_year = 0;
    payload.experience_month = 0;
    payload.position = "Teacher";
  }

  if (payload.experience_year == undefined) {
    return ReE(res, "Please enter a experience year.", 422);
  } else if (!payload.experience_month == undefined) {
    return ReE(res, "Please enter a experience month.", 422);
  } else if (!payload.position) {
    return ReE(res, "Please enter a position.", 422);
  } else {

    try {

      //date format code
      if(payload.start_date && !isBlank(payload.start_date)) {
        let startDateTime = moment(payload.start_date, ["DD/MM/YYYY", "YYYY-MM-DD"]);
        payload.start_date = startDateTime.format("YYYY-MM-DD");
      } else {
        payload.start_date = null;
      }

      if(payload.end_date &&  !isBlank(payload.end_date)) {
        let endDateTime = moment(payload.end_date, ["DD/MM/YYYY", "YYYY-MM-DD"]);
        payload.end_date = endDateTime.format("YYYY-MM-DD");
      } else {
        payload.end_date = null;
      }
     
      console.log(payload);
      [err, professionalInfoData] = await to(professional_infos.create(payload));
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: professionalInfoData }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
}
module.exports.createProfessionalInfos = createProfessionalInfos;

const createBulkProfessionalInfos = async function (req, res) {

  let err, professional_infos_bulk;
  let payload = req.body;

  payload = payload.map(ele => {
    let obj = {...ele};
    if(obj.is_fresher) {
      obj.experience_year = 0;
      obj.experience_month = 0;
      obj.position = "Teacher";
    }
    return obj;
  })
  

  
  let professonalError = [];
  let professional_infos_required = ["experience_year", "experience_month"];
  payload.forEach((ele, k) => {
    let diff = _.difference(professional_infos_required, Object.keys(ele));
    if (diff.length > 0) {
      professonalError.push(`professional infos[${k}] fields ${diff.join(',')} is required`);
    }
  });

  if (professonalError.length > 0) {
    return ReE(res, professonalError.join(", "), 422);
  }

  payload = payload.map(ele => {
    for (const val in ele) {
      ele[val] = !isBlank(ele[val]) ? ele[val] : null;

      //date format code
      if(val == "end_date" &&  !isBlank(ele['end_date'])) {
        let endDateTime = moment(ele['end_date'], ["DD/MM/YYYY", "YYYY-MM-DD"]);
        ele['end_date'] = endDateTime.format("YYYY-MM-DD");
      } else {
        ele['end_date'] = null;
      }
    }

    let obj  = {...ele};
    obj.user_id = req.user.id;
    return obj;
  });

  try {
    //user assign
    [err, professional_infos_bulk] = await to(professional_infos.destroy({ where: { user_id: req.user.id }, force: true }));
    [err, professional_infos_bulk] = await to(professional_infos.bulkCreate(payload));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: professional_infos_bulk }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }

}
module.exports.createBulkProfessionalInfos = createBulkProfessionalInfos;


const getAllProfessionalInfos = async function (req, res) {
  let err, professionalInfosData;
  try {
    [err, professionalInfosData] = await to(professional_infos.findAll({ where: { user_id: req.user.id } }));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: professionalInfosData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllProfessionalInfos = getAllProfessionalInfos;

const getProfessionalInfo = async function (req, res) {
  let err, professionalInfoData;

  if (req.params && req.params.professional_info_id == undefined) {
    return ReE(res, { message: "professional info id params is missing" }, 422);
  }
  try {
    [err, professionalInfoData] = await to(professional_infos.findOne({ where: { id: req.params.professional_info_id } }));
    if (err) return ReE(res, err, 422);
    if (professionalInfoData !== null) {
      return ReS(res, { data: professionalInfoData }, 200);
    } else {
      return ReE(res, "No professional info data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getProfessionalInfo = getProfessionalInfo;

const updateProfessionalInfo = async function (req, res) {
  let err, professionalInfoData;
  let payload = req.body;
  if (req.params && req.params.professional_info_id == undefined) {
    return ReE(res, { message: "professional info id params is missing" }, 422);
  }
  try {
    [err, professionalInfoData] = await to(professional_infos.findOne({ where: { id: req.params.professional_info_id } }));
    if (err) return ReE(res, err, 422);
    if (professionalInfoData == null) {
      return ReE(res, "No professional info data found", 404);
    } else {
      await professionalInfoData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: professionalInfoData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateProfessionalInfo = updateProfessionalInfo;

const deleteProfessionalInfo = async function (req, res) {
  let err, professionalInfoData;
  if (req.params && req.params.professional_info_id == undefined) {
    return ReE(res, { message: "professional info id params is missing" }, 422);
  }
  try {
    [err, professionalInfoData] = await to(professional_infos.findOne({ where: { id: req.params.professional_info_id } }));
    if (err) return ReE(res, err, 422);
    if (professionalInfoData == null) {
      return ReE(res, "No professional info data found", 404);
    } else {
      professionalInfoData.destroy();
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "professional info deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteProfessionalInfo = deleteProfessionalInfo;

// user Communications
const userCommunications = async function (req, res) {
  let err, communications;
  
  let payload = req.body;
  payload = payload.map(ele => {
    let obj  = {...ele};
    obj.user_id = req.user.id;
    return obj;
  });

  try {
    //date format code
    [err, communications] = await to(user_communications.bulkCreate(payload));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: communications }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.userCommunications = userCommunications;

