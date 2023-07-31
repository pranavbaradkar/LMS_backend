const {to} = require('await-to-js');
const pe = require('parse-error');
const axios = require('axios');
const csv = require('csv');
var _ = require('underscore');
var AWS = require('aws-sdk');
const { createLogger, format, transports } = require("winston");


module.exports.getFullName = (userObj) => {
    let fullname  = ['first_name', 'middle_name', 'last_name'];
    let response  = "";
    fullname.forEach(obj => {
      // console.log(obj);
      response += userObj[obj] ? ' '+userObj[obj] : '';
    });
    return response;
  }

  
  module.exports.secondsToMinutesAndSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} mins ${remainingSeconds} secs`;
  }