const model = require('../../models');
const { user_assessment_slots, question_pools, user_assessment_logs, user_assessments, assessments, assessment_questions,campaigns,campaign_assessments, assessment_configurations,levels, questions, question_options, question_mtf_answers, custom_attributes, professional_infos, user_assessment_responses, skills, users, user_teaching_interests, subjects } = require("../../models");
const { to, ReE, ReS, toSnakeCase, returnObjectEmpty, uploadVideoOnS3 } = require('../../services/util.service');
const { getLiveCampaignAssessments } = require('../../services/campaign.service');
const validator = require('validator');
var moment = require("moment");
var _ = require('underscore');
var Sequelize = require("sequelize");
var ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const axios = require('axios');
const mailer = require("../../helpers/mailer"); 
const { Op } = require("sequelize");
const { createClient } = require('redis');
const Redis   = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const NodeCache = require( "node-cache" );
const assessmentCache = new NodeCache( { stdTTL: 0, checkperiod: ((3600*24)*7) } );

questions.belongsTo(model.skills, { foreignKey: 'skill_id' });
questions.belongsTo(model.levels, { foreignKey: 'level_id' });
questions.belongsTo(model.subjects, { foreignKey: 'subject_id' });
assessment_questions.belongsTo(questions, { foreignKey: "question_id" });
assessment_configurations.belongsTo(assessments, { foreignKey: "assessment_id" });
assessments.hasMany(assessment_configurations, { foreignKey: "assessment_id" });
assessments.hasMany(user_assessment_responses, { foreignKey: "assessment_id" });
assessments.hasMany(user_assessments, { foreignKey: "assessment_id" });
assessments.hasMany(assessment_questions, { foreignKey: "assessment_id" });
questions.hasMany(question_options, { foreignKey: "question_id" });
questions.hasMany(question_mtf_answers, { foreignKey: 'question_id'});

campaigns.hasMany(campaign_assessments, { foreignKey: "campaign_id" });

assessment_configurations.belongsTo(levels, { foreignKey: 'level_id' });

const getUserAssessmentSlot = async (req,res) => {
  let err, userAssessmentSlotData;
  try {
    [err, userAssessmentSlotData] = await to(user_assessment_slots.findOne({where: {user_id: req.user.id}}));
    if (err) return ReE(res, err, 422);

    return ReS(res, { data: userAssessmentSlotData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUserAssessmentSlot = getUserAssessmentSlot;

const userAssessmentSlot = async function(req, res) {
  let err, userAssessmentSlotData;
  let payload = req.body;
  try {
    payload.user_id = req.user.id;
    [err, updated] = await to(user_assessment_slots.update(payload, {where: {user_id: req.user.id }}));
    if(!updated[0]) {
      [err, userAssessmentSlotData] = await to(user_assessment_slots.create(payload));
    }
    else {
      [err, userAssessmentSlotData] = await to(user_assessment_slots.findOne({where: {user_id: req.user.id}}));
    }

    if (err) return ReE(res, err, 422);
    return ReS(res, { data: userAssessmentSlotData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.userAssessmentSlot = userAssessmentSlot;

const getScreeningTestDetails = async function (req, res) {
  let err, assessmentsData, typeData;

  if (_.isEmpty(req.params.assessment_id) || _.isUndefined(req.params.assessment_id)) {
    return ReE(res, "Assessment id required in params", 422);
  }
  if (_.isEmpty(req.params.type) || _.isUndefined(req.params.type)) {
    return ReE(res, "type required in params", 422);
  }
  if (req.params.type) {
    typeData = (req.params.type).toUpperCase();
  }

  [err, assessment_configurations_data] = await to(assessment_configurations.findOne({ where: { assessment_id: req.params.assessment_id, assessment_type: typeData }, raw: true }));

  let skillDistributions = assessment_configurations_data.skill_distributions;

  console.log(skillDistributions);

  let skillIds = skillDistributions.map(ele => {
    return ele.skill_id;
  });

  [err, skills_data] = await to(skills.findAll({
    where: { id: { [Sequelize.Op.in]: skillIds } },
    attributes: ['name', 'id'],
    raw: true
  }));

  try {
    [err, assessmentQuestions] = await to(assessment_questions.findAll(
      {
        where: { assessment_id: req.params.assessment_id, type: typeData },
        attributes: [],
        include:
          [
            {
              model: questions,
              attributes:['id','question_type', 'statement', 'mime_type','hint','difficulty_level','complexity_level','knowledge_level','proficiency_level','blooms_taxonomy','skill_id','estimated_time','correct_answer_score','level_id','tags','subject_id', 's3_asset_urls'],
              include: [
                { model: question_options },
                { model: question_mtf_answers },
                { model: model.skills, attributes: ['name'] },
                { model: model.levels, attributes: ['name'] },
                { model: model.subjects, attributes: ['name'] }
              ]
            }
          ]
      }));

    if (err) return ReE(res, err, 422);
    if (_.isEmpty(assessmentQuestions)) {
      return ReE(res, "No questions data found", 404);
    } else {

      console.log(skills_data);
      let skills_data_final = skills_data.map(ele => {
        let obj = { ...ele };
        obj.questions = assessmentQuestions.filter(e => {
          return e.question && e.question.skill_id == ele.id;
        }).map(ele => {
          let object = {...ele.question.get({plain: true})};
          object.question_options = object.question_options.map(e => {
            return returnObjectEmpty(e);
          })
          return returnObjectEmpty(object);
        })
        return obj;
      });

      if(req.internal) return skills_data_final;
      return ReS(res, { data: skills_data_final }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getScreeningTestDetails = getScreeningTestDetails;

const getUserRecommendedAssessments = async function (req, res) {
  let err, assessmentsData, teachingInterest, userAssessmentExist, logAssessmentData;
  let type = req.query.type.toUpperCase();
  try {

    
    // live campaign assessmnets list
    let liveAssessmentList = await getLiveCampaignAssessments();
    
    [err, userAssessmentExist] = await to(user_assessments.findOne({ where: { user_id: req.user.id, screening_status: { [Op.in]: ['STARTED', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED']} }, raw: true }));

    console.log("tetstst", userAssessmentExist);

    if(userAssessmentExist) {
      req.query.debug = userAssessmentExist.assessment_id;
    }

    let assessmentData = assessmentCache.get(`user-${req.user.id}`);
    //console.log("assessmentData", assessmentData);
    if(assessmentData && req.query && req.query.debug == undefined) {
      req.query.debug = assessmentData;
    }

    let subjectIds = [], levelIds = [];
    if(req.query && req.query.debug == undefined) {
      [err, professionalInfoData] = await to(professional_infos.findOne({ where: { user_id: req.user.id }, raw: true }));
      
      [err, teachingInterest] = await to(user_teaching_interests.findOne({ where: { user_id: req.user.id }, raw: true }));
      
      if(teachingInterest == null) {
        return ReE(res, "No teaching interests info data found", 404);
      }
      
      //console.log("=========", teachingInterest);
      levelIds = teachingInterest.level_ids != null ? teachingInterest.level_ids.map(ele => {
        return ele ? parseInt(ele) : null;
      }).filter(e => e != null) : [];
      
      subjectIds = teachingInterest.subject_ids ? teachingInterest.subject_ids.map(ele => {
        return ele ? parseInt(ele) : null;
      }).filter(e => e != null) : [];
    }

    let where = [
      { 
        assessment_id: {
          [Op.in]: liveAssessmentList
        } 
      }
    ]
    if(req.query && req.query.debug == undefined) {
      where.push({ 
        level_id: { [Sequelize.Op.in]: levelIds }, 
        assessment_type: type,
        assessment_id: {
          [Op.in]: liveAssessmentList
        }
    })
    }

    if(subjectIds.length > 0) {
      let skill_distributions  = {
        [Op.or]: subjectIds.map(ele => {
          return { skill_distributions : { 
              [Op.contains] : [
                { subject_ids:[{
                    'subject_id': ele
                  }]
                }
              ]
              }
            }
        })
      };
      where.push(skill_distributions);
    }

    //console.log(req.query.debug);
    if(req.query && req.query.debug) {
      where = { assessment_id: req.query.debug }
    }

    [err, assessments_screening] = await to(assessment_configurations.findAll({
      where: {[Op.and]: where},
      include: [{
        model: assessments,
        include: [{
          model: user_assessments,
          where: { user_id: req.user.id },
          required: false
        }]
      }],
      order: [
        Sequelize.literal('random()')
      ],
      limit: 1,
      raw: true,
      nest: true
    }));

    console.log(where);
    
    
    if(assessments_screening.length == 0) {
      //console.log(levelIds);
      [err, assessments_screening] = await to(assessment_configurations.findAll({
        where: {
          [Op.and]: {
            assessment_type: type
          },
          level_id: { [Sequelize.Op.in]: levelIds },
          assessment_id: {
            [Op.in]: liveAssessmentList
          }
        },
        include: [{
          model: assessments,
          include: [{
            model: user_assessments,
            where: { user_id: req.user.id },
            required: false
          }]
        }],
        order: [
          Sequelize.literal('random()')
        ],
        limit: 1,
        raw: true,
        nest: true
      }));
    }

    if (err) return ReE(res, err, 422);
    // console.log(assessments_screening);
    if (assessments_screening !== null) {

      let screeningData = assessments_screening.map(element => {
        let skill_distributions = element.skill_distributions;
        var exists = skill_distributions.filter(function (o) {
          return o.hasOwnProperty('subject_ids');
        }).length > 0;
        if (exists) {
          return element;
        } else {
          return null
        }
      }).filter(e => e != null);

      let mapData = screeningData[0];

      if (screeningData.length > 1) {
        mapData = screeningData.map(element => {
          let skill_distributions = element.skill_distributions;
          let skill2 = skill_distributions.find(ele => ele.subject_ids != undefined);
          let screeningSubject = skill2.subject_ids.map(value => {
             return value && value.subject_id ? value.subject_id : 0;
          });
          let intersec = _.intersection(screeningSubject, subjectIds);
          element.intersection = intersec.length;
          return element;
        }).sort((a, b) => b.intersection - a.intersection);
        mapData = mapData[0];
      }

      //console.log(mapData);
      if(mapData == undefined || mapData == null) {
        return ReE(res, "No assessments data found", 404);
      }
      let skill_distributions_id = mapData && mapData.skill_distributions ? mapData.skill_distributions.map(ele => { return ele.subject_ids == undefined ? ele.skill_id : null }).filter(e => e != null) : [];
      let subject_ids = [];
      if(mapData && mapData.skill_distributions) {
        mapData.skill_distributions.forEach(ele => { 
          if(ele.subject_ids) {
            subject_ids = [...subject_ids, ...ele.subject_ids.map(e => e.subject_id)];
          }
        })
      }
       //console.log(subject_ids);
      [err, skillsData] = await to(skills.findAll({
        where: { id: { [Sequelize.Op.in]: skill_distributions_id } },
        attributes: ['name'],
        raw: true
      }));

      [err, subjectData] = await to(subjects.findAll({
        where: { id: { [Sequelize.Op.in]: subject_ids } },
        attributes: ['name'],
        raw: true
      }));

      //console.log(subjectData);

      [err, assessments_test] = await to(assessment_configurations.findAll({
        where: { assessment_id: mapData.assessment.id },
        include:[
          {
            model: levels,
            attributes: ['name'],
            require: false
          }
        ]
      }));

      [err, logAssessmentData] = await to(user_assessment_logs.findOne({
        where: { user_id: req.user.id, assessment_id: mapData.assessment.id },
        attributes: [ 'id', 'assessment_id', 'elapsed_time', 'assessment_type', 'answered_question']
      }));
      logAssessmentData = logAssessmentData || [];

      let finalOutput = { ...mapData.assessment };
      assessments_test = assessments_test ? assessments_test.map(ed => {
        let object = {...ed.get({plain: true})};
        //console.log(object);
        object.skill_distributions = object.skill_distributions.map(ele => {
          let obj = {...ele};
          if(ele.subject_ids) {
            obj.subject_ids = ele.subject_ids ? ele.subject_ids.map(e => {
              return e.subject_id ? e.subject_id : e;
            }): [];
          }
          return obj;
        });
        
        return object;
      }) : [];
      finalOutput.skills = [...skillsData.map(ele => { return ele.name }), ...subjectData.map(ele => { return ele.name })];
      finalOutput.tests = assessments_test;
      finalOutput.assessment_log = logAssessmentData;

      if(finalOutput.user_assessments && finalOutput.user_assessments.type == type) {
        if(type == 'SCREENING') {
          finalOutput.screening_status = finalOutput.user_assessments.status;
        } 
        if(type == 'MAINS') {
          finalOutput.mains_status = finalOutput.user_assessments.mains_status;
        }
        delete finalOutput.user_assessments;
      } else {
        finalOutput.screening_status = "PENDING";
        finalOutput.mains_status = "PENDING";
        delete finalOutput.user_assessments;
      }

      let assessmentData = assessmentCache.get(`user-${req.user.id}`);
      if(!assessmentData) {
        let datasuccess = assessmentCache.set(`user-${req.user.id}`, finalOutput.id );
      }

      
      return ReS(res, { data: finalOutput }, 200);
    } else {
      return ReE(res, "No assessments data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUserRecommendedAssessments = getUserRecommendedAssessments;

const getUserAssessments = async function (req, res) {
  let err, assessmentsData;
  let liveAssessmentList = await getLiveCampaignAssessments();
  let include = [];
  if(req.query.type) {
    include.push({
      model: assessment_configurations,
      where: {
        assessment_type: req.query.type
      }
    })
  }
  try {
    [err, assessmentsData] = await to(assessments.findAll({
      where: {
        id: {
          [Op.in]: liveAssessmentList
        }
      },
      include: include,
      order: [
        [Sequelize.fn('RANDOM')]
      ]
    }));
    if (err) return ReE(res, err, 422);
    if (assessmentsData !== null) {
      return ReS(res, { data: assessmentsData }, 200);
    } else {
      return ReE(res, "No assessments data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getUserAssessments = getUserAssessments;


const testAnswersSubmit = async function (req, res) {
  let err, assessmentsData, type, responseData = {};
  let payload = req.body;
  payload.user_id = req.user.id;
  if (_.isEmpty(req.params.assessment_id) || _.isUndefined(req.params.assessment_id)) {
    return ReE(res, "Assessment id required in params", 422);
  }
  if (_.isEmpty(req.params.type) || _.isUndefined(req.params.type)) {
    return ReE(res, "type required in params", 422);
  }
  if (_.isEmpty(payload.response_json) || _.isUndefined(payload.response_json)) {
    return ReE(res, "Response json required", 422);
  }
  if (req.params.type && req.params.assessment_id) {
    payload.assessment_id = req.params.assessment_id;
    payload.type = (req.params.type).toUpperCase();
  }
  try {
    if (payload.response_json) {
      payload.response_json = JSON.stringify(payload.response_json)
    }

    [err, response] = await to(user_assessment_responses.findOne({ where: { assessment_id: req.params.assessment_id, user_id : req.user.id, type: payload.type } }));

    if(response) {
      let response_json = JSON.stringify(payload.response_json)
      response.save({response_json: response_json});
    } else {
      [err, response] = await to(user_assessment_responses.create(payload));
      console.log(err);
    }

    console.log(response);
    
    if(req.params.type) {
      let payload = {};
      if(req.params.type == 'screening') {
        payload.screening_status = 'FINISHED';
      }
      if(req.params.type == 'mains') {
        payload.mains_status = 'FINISHED';
      }
      [err, user_assessment_data] = await to(user_assessments.findOne({ where: { assessment_id: req.params.assessment_id, user_id : req.user.id } }));
      if(user_assessment_data) {
        await user_assessment_data.update(payload, { where: { assessment_id: req.params.assessment_id, user_id : req.user.id } });
      }
    }
    
    if (err) return ReE(res, err, 422);
    console.log(response.response_json);
    responseData.response_json = response.response_json;
    return ReS(res, { message:  "Assessment has been submit successfully." }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.testAnswersSubmit = testAnswersSubmit;

const logAssessment = async function (req, res) {
  let err, logAssessmentData, responseData = {};
  let payload = req.body;
  payload.user_id = req.user.id;
  if (_.isEmpty(req.params.assessment_id) || _.isUndefined(req.params.assessment_id)) {
    return ReE(res, "Assessment id required in params", 422);
  }
  if (_.isEmpty(req.params.assessment_type) || _.isUndefined(req.params.assessment_type)) {
    return ReE(res, "Assessment type required in params", 422);
  }
  if (_.isEmpty(payload.answered_question) || _.isUndefined(payload.answered_question)) {
    return ReE(res, "Answered Question JSON required in payload", 422);
  }
  // if (_.isEmpty(payload.question_status) || _.isUndefined(payload.question_status)) {
  //   return ReE(res, "Question Status required in payload", 422);
  // }
  if (req.params.assessment_type && req.params.assessment_id) {
    payload.assessment_id = req.params.assessment_id;
    payload.assessment_type = (req.params.assessment_type).toUpperCase();
  }
  try {
     //Log Payload
    payload.user_id = req.user.id;
    payload.answered_question = JSON.stringify(payload.answered_question);
    let upsert = { user_id: payload.user_id, assessment_type: payload.assessment_type, assessment_id: payload.assessment_id };
    [err, logAssessmentData] = await to(user_assessment_logs.findOne({where: upsert}));
    console.log('logAssessmentData', JSON.stringify(logAssessmentData));
    if(logAssessmentData) {
      logAssessmentData.answered_question = payload.answered_question;
      logAssessmentData.elapsed_time = payload.elapsed_time;
      logAssessmentData.save();
    }
    else {
      [err, logAssessmentData] = await to(user_assessment_logs.create(payload));
    }
    //  [logAssessmentData, created] = await to(user_assessment_logs.upsert(payload, { fields: ['user_id','assessment_id', 'assessment_type'], returning: true }));
    //  [err, logAssessmentData] = await to(user_assessment_logs.findOrCreate({ where: upsert, defaults: payload }));
     if (err) return ReE(res, err, 422);
     return ReS(res, { data: logAssessmentData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.logAssessment = logAssessment;

const statusUserAssessment = async function (req, res) {
  let err, user_assessment_data_exist;
  payload = req.body;
  payload.user_id = req.user.id;
  try {
    [err, assessment_data] = await to(assessments.findOne({ where: { id: payload.assessment_id } }));
    if (assessment_data !== null) {
      let wherePayload = { assessment_id: payload.assessment_id, user_id : req.user.id };
      wherePayload.status = payload.status;
      wherePayload.type = payload.type;
      [err, user_assessment_data_exist] = await to(user_assessments.findOne({ where: wherePayload }));
      if(user_assessment_data_exist == null) {
        [err, user_assessment_data] = await to(user_assessments.create(payload));
        if (err) return ReE(res, err, 422);
        return ReS(res, { data: user_assessment_data }, 200);
      } else {
        return ReS(res, { data: user_assessment_data_exist }, 200);
      }
     
    } else {
      return ReE(res, "Assessment id not found.", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.statusUserAssessment = statusUserAssessment

const updateStatusUserAssessment = async function (req, res) {
  let err;
  payload = req.body;
  // payload.user_id = req.user.id;
  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "Assessment id is missing" }, 422);
  }
  try {
    [err, user_assessment_data] = await to(user_assessments.findOne({ where: { assessment_id: req.params.assessment_id, user_id : req.user.id } }));
    if (user_assessment_data == null) {
      return ReE(res, "No user assessment data found", 404);
    } else {
      await user_assessment_data.update(payload, { where: { assessment_id: req.params.assessment_id, user_id : req.user.id } });
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: user_assessment_data }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateStatusUserAssessment = updateStatusUserAssessment

const getAllAssessmentsResult = async function (req, res) {
  let err;
  payload = req.body;

  [err, assessmentsData] = await to(assessments.findAll(
    {
      include: [{
        model: assessment_configurations
      },
      {
        model: user_assessment_responses
      },
      {
        model: assessment_questions,
        include: [ { model: questions }]
      }]
    }
  ));
  console.log(assessmentsData)
  let assessmentResult = assessmentsData.map(ele => {
    let obj = {...ele.get({plain: true})};
    if(obj.user_assessment_responses.length > 0) {
      obj.user_assessment_responses.map(uar => {

        uar.assessment_configurations = obj.assessment_configurations.find(e => uar.type == e.assessment_type);
        let questions = ele.assessment_questions.filter(as => {
          return as.type == uar.type;
        }).map(q => {
          return {id: q.question_id, correct_answer: q.question ? q.question.correct_answer : null};
        });
        let ob = {};
        questions.forEach(qe => {
          ob[qe.id] = qe.correct_answer;
        });
        uar.questionAnswer = ob;
      });
      return obj;
    } else {
      return null
    }
    return obj;
  }).filter(e => e != null);

  console.log(assessmentResult);

  assessmentResult.forEach(ele => {
    ele.user_assessment_responses.map(async k => {
      let correctQuestion = 0;
      let responseJson = JSON.parse(k.response_json);
      for(let key in responseJson ) {
        if(responseJson[key] && k.questionAnswer[key] && responseJson[key] == k.questionAnswer[key]) {
          correctQuestion = correctQuestion + 1;
        }
      }

      let status = 'FAILED';
      let subjectHead = "Screening Test Result - Vibgyor Group of Schools";
      console.log(k, k.assessment_configurations.passing_criteria)
      if(correctQuestion >= k.assessment_configurations.passing_criteria) {
        status = 'PASSED';
        subjectHead = "Screening Test Result - Vibgyor Group of Schools";
      }

      [err, user_assessment_data] = await to(user_assessments.findOne({ where: { assessment_id: k.assessment_id, user_id : k.user_id } }));

      [err, userInfo] = await to(users.findOne({ where: { id : k.user_id } }));
      if(user_assessment_data) {
        let payload = {};
        if(k.type == 'SCREENING') {
          payload = {
            screening_status: status,
            screening_result_notified: true
          };
        }
        if(k.type == 'MAINS') {
          payload = {
            mains_status: status,
            mains_result_notified: true
          };
        }
        await user_assessment_data.update(payload, { where: { assessment_id: k.assessment_id, user_id : k.user_id } });

        parameters = {};
        let html = ejs.render(
          fs.readFileSync(__dirname + `/../../views/${status.toLowerCase()}.ejs`).toString(),
          parameters
        );
        
        var subject = subjectHead;
        let response = await mailer.send(userInfo.email, subject, html);
      }
      

    });
    
  });

  return ReS(res, { data: assessmentResult }, 200);
}
module.exports.getAllAssessmentsResult = getAllAssessmentsResult


const recursiveResultSend = async function (req, res) {
    var k = req.body;
    let correctQuestion = 0;
    let responseJson = JSON.parse(k.response_json);
    for(let key in responseJson ) {
      if(responseJson[key] && k.questionAnswer[key] && responseJson[key] == k.questionAnswer[key]) {
        correctQuestion = correctQuestion + 1;
      }
    }

    let status = 'FAILED';
    let type = toTitleCase(req.params.assessment_type);
    let subjectHead = type+" Test Result - Vibgyor Group of Schools";
  
    if(correctQuestion >= k.assessment_configurations.passing_criteria) {
      status = 'PASSED';
      subjectHead = type+" Test Result - Vibgyor Group of Schools";
    }
   
    let object = { assessment_id: k.assessment_id, user_id : k.user_id };
    if(req.params.assessment_type.toUpperCase() == 'SCREENING') {
      object.screening_status = "FINISHED";
    }
    if(req.params.assessment_type.toUpperCase() == 'MAINS') {
      object.mains_status = "FINISHED";
    }
  
   
    [err, userInfo] = await to(users.findOne({ where: { id : k.user_id }, attributes: ['email'], raw: true }));
    var userInfo = userInfo;
    [err, user_assessment_data] = await to(user_assessments.findOne({ where: object, raw: true }));
    console.log("=================",k.user_id, user_assessment_data, object, userInfo)
    // console.log("$$$$$$$$$$$", userInfo, user_assessment_data != null, user_assessment_data, object);
      
    if(user_assessment_data != null) {
      
      let payload = {};
      if(k.type == 'SCREENING') {
        payload = {
          screening_status: status,
          screening_result_notified: true
        };
      }
      if(k.type == 'MAINS') {
        payload = {
          mains_status: status,
          mains_result_notified: true
        };
      }
     // console.log("****************************", k, k.assessment_configurations.passing_criteria, payload);
  
      let updateUserData = await user_assessments.update(payload, {where: {id: user_assessment_data.id}});
    //  console.log("=================", updateUserData, subjectHead);

      if(status == 'PASSED' && k.type == 'SCREENING') {
        let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/assessments/inventory/block/${k.user_id}`);
        return ReS(res, { data: request.data}, 200);
      }

      parameters = {};
      let html = ejs.render(
        fs.readFileSync(__dirname + `/../../views/${status.toLowerCase()}_${k.type.toLowerCase()}.ejs`).toString(),
        parameters
      );
      if(userInfo && userInfo.email) {
        var subject = subjectHead;
        try {
          let response = await mailer.send(userInfo.email, subject, html);
          console.log("mail reponse", response);
          return ReS(res, { data: k }, 200);
        } catch(err) {
          return ReS(res, { data: k }, 200);
        }
      } else {
        return ReS(res, { data: k }, 200);
      }
     
    } else {
      // console.log("===========================================");
      return ReS(res, { data: k }, 200);

    }
}
module.exports.recursiveResultSend = recursiveResultSend

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const userAssessmentQuestion = async function(req, res) {
  let err, questionData, random;
  if (_.isEmpty(req.params.assessment_id) || _.isUndefined(req.params.assessment_id)) {
    return ReE(res, "Assessment id required in params", 422);
  }
  if (_.isEmpty(req.params.type) || _.isUndefined(req.params.type)) {
    return ReE(res, "Assessment type required in params", 422);
  }
  try {

    [err, questionData] = await to(question_pools.findAll({ 
      where: { 
        user_id: req.user.id, 
        assessment_id: req.params.assessment_id, 
        assessment_type: req.params.type.toUpperCase(),
        question_status: { [Op.not]: 'COMPLETED' }
      }
    }));
    console.log("Found question data ",questionData);
    if(questionData.length > 0) {
      // TODO: pick question and send respnse
      random = _.random((questionData.length-1));
      return ReS(res, { data: questionData[random] }, 200);
    }

    // call api to get the question list
    req.internal = true;
    let questionList = await getScreeningTestDetails(req, res);
    console.log(questionList);

    let payload = [];
    questionList.forEach((obj, index) => {
      let data = {};
      data.user_id = req.user.id;
      data.assessment_id = req.params.assessment_id;
      data.assessment_type = req.params.type.toUpperCase();
      data.question = obj;
      data.question_status = 'PENDING';
      payload.push(data);
    });
    if(payload.length < 0) return ReE(res, 'No question to insert to pool', 422);

    // create new pool
    [err, questionData] = await to(question_pools.bulkCreate(payload));
    if(err) return ReE(res, err, 404);

    random = _.random((questionData.length-1));
    return ReS(res, { data: questionData[random] }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.userAssessmentQuestion = userAssessmentQuestion;

const getAssessmentsFinalResult = async function(req, res) {
  let err, resultData;
  try {
    [err, resultData] = await to(user_assessments.findAll({
      where: { user_id: req.user.id, screening_status: { [Op.in]: ['PASSED', 'FAILED']} }
    }));
    if(err) return ReE(res, err, 422);
    return ReS(res, { data: resultData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getAssessmentsFinalResult = getAssessmentsFinalResult;

const getMainsSlot = async function(req, res) {
  let err, resultData;
  try {

    var startDate = moment(); 
    var endDate  = moment().add(1, 'months');
    
    var diff = endDate.diff(startDate, 'days');
    let slotDay = [];
    let timeing =  ["10:00 am","12:00 pm","01:00 am","03:00 am","06:00 am"];
    for(i = 0; i < diff; i++) {
      var isDay  = moment().add(i, 'day').isoWeekday();
      if(isDay == 6 || isDay == 7) {
        var day = moment().add(i, 'day').format("Do MMM, YY");
        let dayData = {
          day: day,
          timeing: timeing
        };
        slotDay.push(dayData);
      }
    }
    return ReS(res, { data: slotDay }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getMainsSlot = getMainsSlot;

const uploadVideoPacd = async function (req, res) {
  let userId = req.params.user_id;
  let payload = req.body;
  let path = `${payload.context}/${payload.business_type}/${payload.post_type}/${req.user.uuid}/${payload.file_type}`
  url = await uploadVideoOnS3(path, `video_${new Date().getTime()}.webm`, req.files[0].mimetype, req.files[0].buffer, true);
  return ReS(res, { data: url });
}
module.exports.uploadVideoPacd = uploadVideoPacd;

const getAssessmentResultScreenData = (req, res) => {
  let err, resultData;
  try {
    resultData = {};
    resultData.labels = ["IQ/EQ", "Pedagogy", "English", "Psychometry", "Subject", "Computer"];
    resultData.data = [20, 35, 50, 60, 100, 45];
    resultData.dataScore = { 'scored': 45, 'total_score': 60 };
    resultData.percentage = 85;
    return ReS(res, {data: resultData }, 200);
  } catch (err) {
    return ReE(res,err,442);
  }
}
module.exports.getAssessmentResultScreenData = getAssessmentResultScreenData;

const getAssessmentAnalytics = (req, res) => {
  let err, resultData;
  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "assessment_id params is missing" }, 422);
  }
  try {
    resultData = {};
    resultData.labels = ["IQ/EQ", "Pedagogy", "English", "Psychometry", "Subject", "Computer"];
    resultData.data = [20, 35, 50, 60, 100, 45];
    resultData.dataScore = { 'scored': 45, 'total_score': 60 };
    resultData.percentage = 85;
    return ReS(res, {data: resultData }, 200);
  } catch (err) {
    return ReE(res,err,442);
  }
}
module.exports.getAssessmentAnalytics = getAssessmentAnalytics;

const insertQuestions = async (req, res) => {
  let err, insertData;
  try {
    // TODO use bulkInsert
    [err, insertData] = await to(lo.create({ lo_text: '2Physics:Heat:Grade 2' } ));
    [err, topicData] = await to(topic.create({ topic_name: "Heat water" }));
    await loData.addTopic(topicData);
    return ReS(res, {data: insertData}, 200);
  }
  catch(err) {
    return ReE(res, err, 422);
  }
}
module.exports.insertQuestions = insertQuestions;

const getQuestionMeta = () => {
  let grades = ['Grade_1', 'Grade_2', 'Grade_3'];
  let blooms = ['UNDERSTAND', 'APPLY', 'ANALYSE'];
  let cLevels = ['P1', 'P2', 'P3'];
  
  return [grades, blooms, cLevels];
}

const createQuestionGrid = async (questionList) => {
  let grades, blooms, cLevels;
  [grades, blooms, cLevels] = getQuestionMeta();

  // let qSet = {};
  let gradeSet = {};
  grades.forEach((grade,gi)=>{
    gradeSet[grade] = {};
    cLevels.forEach((cl) => {
      gradeSet[grade][cl]={};
      // qSet[cl] = {};
      blooms.forEach((bt) => {
        gradeSet[grade][cl][bt]=[];
        let subjects = [
          questionList.filter(ele => ele.complexity_level==cl && ele.blooms_taxonomy==bt ),
          { 'score': randomIntFromInterval(0,3), 'direction': getRandomXYDirection(), "steps":[]}];
        // qSet[cl][bt] = [];
        // qSet[cl][bt].push(...subjects);
        gradeSet[grade][cl][bt].push(...subjects);
      });
    });
  });

  // console.log("the Grades Set is ",gradeSet);
  return gradeSet;
};

const getRandomElement = function(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

const getQuestionList = async function() {
  let err, questionData;
  try {
    // for (let i = 80; i < 120; i++) {
    //   // const element = array[i];
    //   let cl = getRandomElement(['P1', 'P2', 'P3']);
    //   let bt = getRandomElement(['UNDERSTAND', 'APPLY', 'ANALYZE']);
    //   // let idd = getRandomElement([1,2,3,4,5,6,7,8,9,10]);
    //   [err, questionData] = await questions.update({
    //     complexity_level: cl,
    //     blooms_taxonomy: bt
    //   },{ 
    //   where:{ id: { [Op.in]: [i] }
    //   }});
    // }    
    [err, questionData] = await to(questions.findAll({
      where:{blooms_taxonomy: { [Op.in]: ['UNDERSTAND', 'APPLY', 'ANALYZE']}},
      order: [['blooms_taxonomy','ASC'],['complexity_level', 'ASC']],
      include: { model: question_options , attributes: ['option_key', 'option_value', 'option_type']}, // uncomment
      attributes: {exclude:["answer_explanation", "hint", "correct_answer", "answer", "deleted_at", "created_at", "updated_at"]}, // uncomment
      // attributes: ['id','complexity_level', 'blooms_taxonomy'], // delete
    }));
    // add question identifier if it has been asked to user before
    let pool_c = 1; c=1;
    let poolName = ''; 
    questionData = questionData.map((row) => {
      let obj = {...row.get({plain: true})};
      if(poolName != obj.complexity_level+obj.blooms_taxonomy) { 
        c = 1; pool_c=1;
        poolName = obj.complexity_level+obj.blooms_taxonomy;
      }
      // console.log("The row obj ",obj);
      // console.log("The row count  ",c, );
      obj.is_answered = 0;
      obj.users_answer = '';
      obj.pool = pool_c;
      if(c%3==0) { pool_c++;}
      c++;
      return obj;
    });

    return questionData;
  } catch (err) {
    return ReE(res,err,422);
  }

}
module.exports.getQuestionList = getQuestionList;

// pass assessment_id and user_id to generate question set 
// get new question on subsequent calls.
// TODO: pool will be updated when user reaches the same grid_position;
// TEMP: currently updating pool on every request
const getQuestionSet = async function(req, res) {
  let err, questionGrid, grades, blooms, cLevels;
  let user_id = req.user.id;
  let assessment_id = req.params.assessment_id;
  let no_of_question = 3;

  let questionGridKey = `${user_id}-${assessment_id}-qset`;
  let gridPosKey = `${user_id}-${assessment_id}-meta`;
  let current_position = {x:0, y:0, z:1, grid_count: 1, pool:1}; // [x,y,z,question_no_count]

  try {

    // ioredis supports the node.js callback style
    gridPos = await redis.get(gridPosKey, (err, result) => {
      if (err) {
        console.error("could not get grid positon ",err);
      } else {
        console.log("reids result ",result); // Prints "value"
        return result;
      }
    });
    questionGrid = await redis.get(questionGridKey, (err, result) => {
      if (err) {
        console.error("could not get grid data ",err);
      } else {
        console.log("reids grid data received"); // Prints "value"
        return result;
      }
    });
    
    if(questionGrid && gridPos) {
      // console.log("======================== Elasticache");
      questionGrid  = await JSON.parse(questionGrid);
      gridPos       = await JSON.parse(gridPos) || current_position;
    }
    else {
      // console.log("=======================DB Call ");
      let questionList = await getQuestionList();
      questionGrid = await createQuestionGrid(questionList);
      gridPos = current_position;
      await redis.set(gridPosKey, JSON.stringify(gridPos));
      await redis.set(questionGridKey, JSON.stringify(questionGrid));
    }


    // console.log("the grid positions ",gridPos);
    [grades, blooms, cLevels] = getQuestionMeta();
    let grade = grades[gridPos.z];
    let cLevel = cLevels[gridPos.y];
    let bloom = blooms[gridPos.x];
    
    // console.log(`grade:${grade} clevel:${cLevel} bloom:${bloom}`);
    // filter question by gridPos.pool 
    
    filteredQuestionSet = questionGrid[grade][cLevel][bloom][0].filter(e => e.pool == gridPos.pool);

    gridPos.pool++;
    await redis.set(gridPosKey, JSON.stringify(gridPos));
    return ReS(res, {data: { current_question_set:filteredQuestionSet, current_position: gridPos, all_questions:questionGrid} }, 200);
  }
  catch(err) {
    return ReE(res, err, 422);
  }
}
module.exports.getQuestionSet = getQuestionSet;

// answer the question set 
/*
1) set the answers by coordinates from user.
2) calculate score 
3) Based on calculation change the position on grid.
4) update redis 
*/
const answerQuestionSet = async (req, res) => {
  let err, questionGrid, grades, blooms, cLevels, gridPos;
  let payload = req.body;
  let user_id = req.user.id;
  let assessment_id = req.params.assessment_id;

  let questionGridKey = `${user_id}-${assessment_id}-qset`;
  let gridPosKey = `${user_id}-${assessment_id}-meta`;
  try {
    let gPos = "";
    gPos = await redis.get(gridPosKey, (err, result) => {
      if (err) {
        console.error("could not get grid positon ",err);
      } else {
        console.log("reids result ",result); // Prints "value"
        return result;
      }
    });
    questionGrid = await redis.get(questionGridKey, (err, result) => {
      if (err) {
        console.error("could not get grid data ",err);
      } else {
        console.log("reids grid data ",result); // Prints "value"
        return result;
      }
    });
    
    questionGrid  = JSON.parse(questionGrid);
    gPos          = JSON.parse(gPos);
    
    // console.log("Redis grid position ", payload.grid_position);
    // console.log("Redis gpos ", gPos);
    if(gPos !== payload.current_position) {
      gPos = payload.current_position;
    }

    [grades, blooms, cLevels] = getQuestionMeta();
    let grade   = grades[gPos.z];
    let cLevel  = cLevels[gPos.y];
    let bloom   = blooms[gPos.x];
    let q_no    = gPos.grid_count;
    let pool    = gPos.pool;

    filteredQuestionSet = questionGrid[grade][cLevel][bloom];

    //TODO: calculate scores here 
    filteredQuestionSet[1].score      =3;
    // filteredQuestionSet[1].steps      = [];//[`STEP-${q_no}) [${gPos.x},${gPos.y},${gPos.z},${gPos.count}]`];
    filteredQuestionSet[1].direction  = getRandomXYDirection();
    payload.data.forEach(obj => {
      filteredQuestionSet[0]
      .filter(q => q.id == obj.id)
      .map(q => {
        q.is_answered = obj.is_answered;
        q.users_answer = obj.users_answer;
      });
    });
    
    //Set coordinates for next question
    // console.log("question grid ",questionGrid);
    [ansSet, x, y, z, q_no] = await calculatePosition(questionGrid, gPos.x, gPos.y, gPos.z, q_no);

    let newPos = {x:x, y:y, z:z, grid_count: q_no, pool: pool}; // [x,y,z,count]

    await redis.set(questionGridKey, JSON.stringify(ansSet));
    await redis.set(gridPosKey, JSON.stringify(newPos));
    
    return ReS(res, {data: {current_question_set:filteredQuestionSet, current_position: gPos, next_position: newPos} }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.answerQuestionSet = answerQuestionSet;


// TODO: remove recursive call 
const calculatePosition = async (ansSet, x, y, z, q_no)=> {
  let grades,cLevels, blooms, grade,cLevel, bloom;

  [grades, blooms, cLevels] = getQuestionMeta();
  grade = grades[z];
  cLevel = cLevels[y];
  bloom = blooms[x];
  
  // console.log(`grade: ${grade} level: ${cLevel} bloom: ${bloom}`);
  // console.log("the array ",ansSet[grade][cLevel]);
  // return false;
  let cell = ansSet[grade][cLevel][bloom][1];
  
  let score = cell.score;
  let direction = cell.direction;
  
  console.log(`${q_no} processing for pos [${x}, ${y}] ${z}:${grades[z]} score ${score}`);

  // Boundry condition (change direction on reaching boundary)
  // for top row [0,0] [1,0] [2,0]
  if(y==0 && direction =='y' && score<2 ) { direction = 'x'; }
  // for bottom row [0,2] [1,2] [2,2]
  if(y==2 && direction =='y' && score > 1) { direction = 'x'; }
  // for left row [0,0] [0,1] [0,2]
  if(x==0 && direction =='x' && score<2 ) { direction = 'y'; }
  // for right row [2,0] [2,1] [2,2]
  if(x==2 && direction =='x' && score > 1) { direction = 'y'; }

  // todo: x,y should not be greater than bloom.length and cLevel.length respectively
  let path = `step ${q_no}) score:${score} direction:${direction}  [${x},${y},${z}] => `;

  [x,y,z,changed] = handleCornerGradeCases(x,y,z,score);
  if(changed) { 
    path += ` [changed Grade to ${grades[z]} ] `; 
    path += ` new cordinates [${x},${y},${z}] ${grade} ${cLevel} ${bloom} `;
  }
  else { 
    if(score==3) {
      x<=1 ? x++: x; y<=1 ? y++: y;
      path += `[${x},${y},${z}] promoted to ${grades[z]} ${cLevels[y]} ${blooms[x]}`;
    }
    else if(score == 2)  {
      if(direction=='x') x<=1 ? x++: x; else y<=1 ? y++: y;
      path += `[${x},${y},${z}] promoted to ${grades[z]} ${cLevels[y]} ${blooms[x]}`;
    }
    else if(score == 0 || score == 1) {
      if(direction=='x') x--; else y--;
      path += `[${x},${y},${z}] demoted to ${grades[z]} ${cLevels[y]} ${blooms[x]}`;
    }
  }

  q_no++;
  // todo: remove hack (score changes automatically here to mimic real world)
  // cell.score = randomIntFromInterval(0,3);
  // path += ' score changed to '+cell.score;
  cell.steps.push(path);
  // pos = {cordinates:[x,y,z], text: `${grades[z]} ${cLevel[y]} ${blooms[x]}` };
  return [ansSet, x, y, z, q_no];
};

const handleCornerGradeCases = (x,y,z, score) => {
  let changed = 0;
  // change grade promoting
  // user user keeps on failing OR if user keeps on scoring full marks
  if(x==0 && y==0 && z==0 && score < 2 ) { console.log('Extreme lower ends reached'); changed++; }
  else if(x==2 && y==2 && z==2 && score > 1) { console.log("extreme high end reached"); changed++; }
  else if(x==2 && y==2 && score > 1) {
    x=0; y=0; z++;
    console.log("promoting grade to ", grades[z]);
    changed++;
  }
  // change grade demoting
  else if(x==0 && y==0 && score < 2) {
    x=2; y=2; z--;
    console.log("demoting grade to ", grades[z]);
    changed++;
  }

  return [x,y,z, changed];
}

const randomIntFromInterval = (min, max) => { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
const getRandomXYDirection = ()=>{
  return randomIntFromInterval(0,1) ? 'x' : 'y';
};

const uploadVideoLiveStreaming = async function (req, res) {
  let user_id = req.user.id;
  let assessment_id = req.params.assessment_id;
  let payload = req.body;
  let path = `livestream/${assessment_id}/${user_id}`
  url = await uploadVideoOnS3(path, `video_${new Date().getTime()}.webm`, req.files[0].mimetype, req.files[0].buffer, false);
  return ReS(res, { data: url });
}
module.exports.uploadVideoLiveStreaming = uploadVideoLiveStreaming;
