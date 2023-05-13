const { users } = require("../models");
const validator = require("validator");
const { to, TE } = require("../services/util.service");
const { uuid } = require('uuidv4');

const getUniqueKeyFromBody = function(body) {
  // this is so they can send in 3 options unique_key, email, or phone and it will work
  let unique_key = body.unique_key;
  if (typeof unique_key === "undefined") {
    if (typeof body.email != "undefined") {
      unique_key = body.email;
    } else if (typeof body.phone != "undefined") {
      unique_key = body.phone;
    } else {
      unique_key = null;
    }
  }

  return unique_key;
};
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async userInfo => {
  let unique_key, auth_info, err, user;

  auth_info = {};
  auth_info.status = "create";

  unique_key = getUniqueKeyFromBody(userInfo);
  if (!unique_key) TE("An email or phone number was not entered.");

  if (validator.isStrongPassword(userInfo.password) == false) {
    TE(
      "Password should be minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1"
    );
  }
  [err, userData] = await to(
    users.findOne({ where: { phone: userInfo.phone } })
  );
  if (err) return ReE(res, err, 422);
  if (userData !== null) {
    TE("user already exists with that phone number");
  } else {
    if (validator.isEmail(unique_key)) {
      auth_info.method = "email";
      userInfo.email = unique_key;

      [err, user] = await to(users.create(userInfo));
      console.log(err);
      if (err) TE("user already exists with that email");

      return user;
    } else if (validator.isMobilePhone(userInfo.phone, "any")) {
      auth_info.method = "phone";
      userInfo.phone = unique_key;
      [err, user] = await to(users.create(userInfo));
      console.log(err);
      if (err) TE("user already exists with that phone number");
      return user;
    } else {
      TE("A valid email or phone number was not entered.");
    }
  }
};
module.exports.createUser = createUser;

const authUser = async function(userInfo) {
  //returns token
  let unique_key;
  let auth_info = {};
  auth_info.status = "login";
  unique_key = getUniqueKeyFromBody(userInfo);

  if (!unique_key) TE("Please enter an email or phone number to login");

  if (!userInfo.password) TE("Please enter a password to login");

  let user;
  if (validator.isEmail(unique_key)) {
    auth_info.method = "email";

    [err, user] = await to(users.findOne({ where: { email: unique_key } }));
    if (err) TE(err.message);
  } else if (validator.isMobilePhone(unique_key, "any")) {
    //checks if only phone number was sent
    auth_info.method = "phone";

    [err, user] = await to(users.findOne({ where: { phone: unique_key } }));
    if (err) TE(err.message);
  } else {
    TE("A valid email or phone number was not entered");
  }

  if (!user) TE("Not registered");

  [err, user] = await to(user.comparePassword(userInfo.password));

  if (err) TE(err.message);

  return user;
};
module.exports.authUser = authUser;


module.exports.getUUID = async () => {
  let hash = uuid();
  [err, user] = await to(users.findOne({ where: { uuid: hash }, attributes: ['uuid'] }));
  if(user) {
    await getUUID();
  } else {
    return hash;
  }
}

