const model = require('../../models');
const { user_assessment_slots, question_pools, user_assessment_logs, user_assessments, assessments, assessment_questions,campaigns,campaign_assessments, assessment_configurations,levels, questions, question_options, question_mtf_answers, custom_attributes, professional_infos, user_assessment_responses, skills, users, user_teaching_interests, subjects } = require("../../models");
const { to, ReE, ReS, toSnakeCase, returnObjectEmpty } = require('../../services/util.service');
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

const userAssessmentSlot = async function(req, res) {
  let err, userAssessmentSlotData;
  let payload = req.body;
  try {
    payload.user_id = req.user.id;
    [err, userAssessmentSlotData] = await to(user_assessment_slots.create(payload));

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
  try {

    
    // live campaign assessmnets list
    let liveAssessmentList = await getLiveCampaignAssessments();
    console.log(liveAssessmentList);

    [err, userAssessmentExist] = await to(user_assessments.findOne({ where: { user_id: req.user.id, screening_status: { [Op.in]: ['STARTED', 'INPROGRESS', 'FINISHED', 'PASSED']} }, raw: true }));
    if(userAssessmentExist) {
      req.query.debug = userAssessmentExist.assessment_id;
    }

    let assessmentData = assessmentCache.get(`user-${req.user.id}`);
    //console.log("assessmentData", assessmentData);
    if(assessmentData) {
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
        assessment_type: 'SCREENING',
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
            assessment_type: 'SCREENING'
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

      if(finalOutput.user_assessments && finalOutput.user_assessments.screening_status) {
        finalOutput.screening_status = finalOutput.user_assessments.screening_status;
        finalOutput.mains_status = finalOutput.user_assessments.mains_status;
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

  try {
    [err, assessmentsData] = await to(assessments.findAll({
      where: {
        id: {
          [Op.in]: liveAssessmentList
        }
      },
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
      if(payload.screening_status) {
        wherePayload.screening_status = payload.screening_status;
      } else {
        wherePayload.mains_status = payload.mains_status;
      }
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