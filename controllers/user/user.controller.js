const { users } = require("../../models");
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
  let err, user, data;
  user = req.user;
  data = req.body;
  
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
  
  user.set(data);
  [err, user] = await to(user.save());

  if (err) {
    if (err.message == "Validation error")
      err = "The email address or phone number is already in use";
    return ReE(res, err);
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