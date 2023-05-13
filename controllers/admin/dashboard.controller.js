const { roles, users, levels } = require("../../models");
const model = require('../../models');
const { to, ReE, ReS, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash } = require('../../services/util.service');
var _ = require('underscore');
var ejs = require("ejs");
const fs = require("fs");
const mailer = require("../../helpers/mailer");
const readXlsxFile = require('read-excel-file/node')
const path = require("path");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;


const getCampaignDashboard = async function (req, res) { 

  try {

   
    [err, usersData] = await to(users.count({ }));

    let funnel = {
      total_users: usersData,
      attempt_screening: await getUserAttemptCount('SCREENING', 'STARTED'),
      passed_screening: await getUserAttemptCount('SCREENING', 'PASSED'),
      attempt_mains: await getUserAttemptCount('MAINS', 'STARTED'),
      passed_mains: await getUserAttemptCount('MAINS', 'PASSED'),
    };
    
    return ReS(res, { data: funnel }, 200);
   
  } catch (err) {
    console.log(err);
    return ReE(res, err, 422);
  }
    
};

module.exports.getCampaignDashboard = getCampaignDashboard;

const getDashboardData = async function (req, res) {
  try {

    let job_seeker = {
      screening: {
        'in_progress': await getScreeningData('SCREENING', 'STARTED', 'JOB_SEEKER'),
        'passed': await getScreeningData('SCREENING', 'PASSED', 'JOB_SEEKER'),
        'failed': await getScreeningData('SCREENING', 'FAILED', 'JOB_SEEKER'),
      }, 
      mains: {
        'in_progress': await getScreeningData('MAINS', 'STARTED', 'JOB_SEEKER'),
        'passed': await getScreeningData('MAINS', 'PASSED', 'JOB_SEEKER'),
        'failed': await getScreeningData('MAINS', 'FAILED', 'JOB_SEEKER'),
      }
    }

    let teachers = {
      screening: {
        'in_progress': await getScreeningData('SCREENING', 'STARTED', 'TEACHER'),
        'passed': await getScreeningData('SCREENING', 'PASSED', 'TEACHER'),
        'failed': await getScreeningData('SCREENING', 'FAILED', 'TEACHER'),
      }, 
      mains: {
        'in_progress': await getScreeningData('MAINS', 'STARTED', 'TEACHER'),
        'passed': await getScreeningData('MAINS', 'PASSED', 'TEACHER'),
        'failed': await getScreeningData('MAINS', 'FAILED', 'TEACHER'),
      }
    }
    
    let assessments = {
      teacher: teachers,
      job_seeker: job_seeker
    }
    
    return ReS(res, { data: assessments }, 200);
   
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getDashboardData = getDashboardData;


async function getUserAttemptCount (type, status) {
  [err, countData] = await to(assessment_configurations.findAll(
    {
     where: {
      assessment_type: type
     },
      attributes: [
        [
          Sequelize.literal(`(SELECT COUNT(user_id) FROM user_assessments as ua WHERE ua.assessment_id = assessment_configurations.assessment_id and ua.screening_status = '${status}')`),
          'users',
        ]
      ],
      group: ['assessment_configurations.assessment_id'],
      raw: true
    }
  ));
  let count = countData.reduce((n, {users}) => n + parseInt(users), 0)
  return count;
}

async function getScreeningData (type, status, user_type) {
  [err, screeingDataStarted] = await to(assessment_configurations.findAll(
    {
     where: {
      assessment_type: type
     },
     include: [{
        model: levels,
        attributes: ['name']
      }],
      attributes: [
        'level_id',
        [
          Sequelize.literal(`(SELECT COUNT(user_id) FROM user_assessments as ua JOIN users as u on u.id = ua.user_id WHERE ua.assessment_id = assessment_configurations.assessment_id and ua.screening_status = '${status}' and u.user_type = '${user_type}' )`),
          'users',
        ],
      ],
     group: ['assessment_configurations.level_id', 'assessment_configurations.assessment_id', 'level.name', 'level.id']
    }
  ));
  return screeingDataStarted;
}