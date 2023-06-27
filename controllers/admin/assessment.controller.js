const model = require('../../models');
const { demovideo_details, psy_questions, psy_question_options, assessments,assessment_results, user_assessment_logs, assessment_questions, strands, sub_strands, campaign_assessments, questions, question_options, custom_attributes, assessment_configurations, skills, levels, user_assessments, user_recommendations, users, inventory_blocks, user_assessment_responses, subjects, grades } = require("../../models");
const { to, ReE, ReS, requestQueryObject, lowercaseKeyValue, getDemoTopicsFile, fetchSubjectTopic } = require('../../services/util.service');
const { gradePsyScore, getHighestCount } = require('../../services/assessment.service');
const validator = require('validator');
const mailer = require("../../helpers/mailer"); 
const fs = require("fs");
var moment = require("moment");
var ejs = require("ejs");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
var _ = require('underscore');
const axios = require('axios');
const psychometric_skill_id = process.env.PSYCHOMETRIC_SKILL_ID || 48;


assessment_questions.belongsTo(questions, { foreignKey: "question_id" });
assessment_questions.belongsTo(psy_questions, { foreignKey: "question_id" });

questions.hasMany(question_options, { foreignKey: "question_id" });
psy_questions.hasMany(model.psy_question_options, { foreignKey: 'psy_question_id' });

questions.belongsTo(model.skills, { foreignKey: 'skill_id' });

psy_questions.belongsTo(model.skills, { foreignKey: 'skill_id' });
questions.belongsTo(model.levels, { foreignKey: 'level_id' });
psy_questions.belongsTo(model.levels, { foreignKey: 'level_id' });
questions.belongsTo(model.subjects, { foreignKey: 'subject_id' });
questions.belongsTo(model.grades, { foreignKey: 'grade_id' });

assessments.belongsTo(campaign_assessments, { foreignKey: "id", targetKey: "assessment_id",  as: 'campaign_details' });

assessments.hasMany(user_assessments, { foreignKey: "assessment_id" });

assessment_configurations.belongsTo(levels, { foreignKey: 'level_id' });
assessment_configurations.hasMany(user_assessments, {  sourceKey: 'assessment_id', foreignKey: "assessment_id" });
user_assessments.belongsTo(users, { foreignKey: "user_id" });
user_assessment_responses.belongsTo(users, {foreignKey: 'user_id'});
assessment_results.belongsTo(users, {foreignKey: 'user_id'});

const createAssessment = async function (req, res) {
  let err, assessmentData, assessmentQuestionData, assessmentConfiguratonData;
  let body = req.body;
  if (!body.name) {
    return ReE(res, "Please enter an name", 422);
  } else if (!body.score_type) {
    return ReE(res, "Please enter a score type.", 422);
  } else if (!body.instructions) {
    return ReE(res, "Please enter a instructions.", 422);
  } else {
    try {
      // let startDateTime = moment(body.start_date, "DD/MM/YYYY");
      // startDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      // body.start_date = startDateTime.format("YYYY-MM-DD HH:mm:ss");

      // let endDateTime = moment(body.end_date, "DD/MM/YYYY");
      // endDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      // body.end_date = endDateTime.format("YYYY-MM-DD HH:mm:ss");

      [err, assessmentData] = await to(assessments.create(body));
      if (err) return ReE(res, err, 422);

      // // create records in assessment configuration table object mapping
      // let screenConfObj = body.screening_configration ? body.screening_configration : null;
      // // console.log("screenConfobj-------------------------",screenConfObj);
      // if(screenConfObj) {
      //   screenConfObj.assessment_id = assessmentData.id;
      //   screenConfObj.skill_distributions = JSON.stringify(screenConfObj.skill_distributions);
      //   [err, screeningConfiguratonData] = await to(assessment_configurations.create(screenConfObj));
      //   if (err) return ReE(res, err, 422);
      // }
      // let mainsConfObj = body.mains_configration ? body.mains_configration : null;
      // // console.log("mainsConfObj-------------------------",mainsConfObj);
      // mainsConfObj.skill_distributions = JSON.stringify(mainsConfObj.skill_distributions);
      // if(mainsConfObj) {
      //   mainsConfObj.assessment_id = assessmentData.id;
      //   [err, mainsConfiguratonData] = await to(assessment_configurations.create(mainsConfObj));
      //   if (err) return ReE(res, err, 422);
      // }

      // bulk create records in assessment questions table array of objects mapping
      // let screenObject = body.screening_question_ids.map(ele => {
      //   let newObject = {
      //     assessment_id: assessmentData.id,
      //     question_id: ele,
      //     type: 'SCREENING'
      //   }
      //   return newObject;
      // })
      // let mainsObject = body.mains_question_ids.map(ele => {
      //   let newObject1 = {
      //     assessment_id: assessmentData.id,
      //     question_id: ele,
      //     type: 'MAINS'
      //   }
      //   return newObject1;
      // })
      // let assessmentQueVar = screenObject.concat(mainsObject);
      // [err, assessmentQuestionData] = await to(assessment_questions.bulkCreate(assessmentQueVar));
      // if (err) return ReE(res, err, 422);

      return ReS(res, { data: assessmentData }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
};
module.exports.createAssessment = createAssessment;

const getAllAssessments = async function (req, res) {
  let err, assessmentsData;
  try {

    let orData = [];
    let queryParams = {};
    if(req.query && req.query.filter) {
      if(req.query.filter['level_id'] && req.query.filter['level_id'].split(',').length == 1) {
        queryParams['level_id'] = req.query.filter['level_id'];
      } else {
        queryParams['level_id'] = { [Op.in]: req.query.filter['level_id'].split(',') }
      }
    }
    
    let searchArray = ['name', 'instructions']
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
    
    let paginateData = {...requestQueryObject(req.query)};
    console.log(paginateData);
    [err, assessmentsData] = await to(assessments.findAndCountAll({...paginateData, ...{
        include: [{
          model: assessment_configurations,
          where: queryParams,
          require: false,
          include: [{
            model: levels,
            attributes: ['name'],
            require: false
          }]
        },
        {
          model: campaign_assessments,
          as: 'campaign_details',
          require: false,
          attributes: ['campaign_id']
        }],
        subQuery: false,
        distinct: true
      }
    }));



    if (err) return ReE(res, err, 422);
    if (assessmentsData) {
      return ReS(res, { data: assessmentsData }, 200);
    } else {
      return ReE(res, "No assessments data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllAssessments = getAllAssessments;

const getAssessment = async function (req, res) {
  let err, assessmentData, assessmentQuestionData;

  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "Assessment id params is missing" }, 422);
  }
  try {
    [err, assessmentData] = await to(assessments.findOne({ where: { id: req.params.assessment_id } }));
    if (err) return ReE(res, err, 422);
    if (assessmentData !== null) {
      [err, assessmentQuestionData] = await to(assessment_questions.findAll({
        where: { assessment_id: req.params.assessment_id },
        include:
          [
            {
              model: questions,
              include: [{
                model: question_options, attributes: ['id', 'question_id', 'option_key', 'option_value', 'option_type'],
              }]
            }
          ],

      }));
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: assessmentData, assessmentQuestionData }, 200);
    } else {
      return ReE(res, "No assessment data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getAssessment = getAssessment;

const updateAssessment = async function (req, res) {
  let err, assessmentData;
  let payload = req.body;
  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "Assessment id params is missing" }, 422);
  }
  try {
    [err, assessmentData] = await to(assessments.findOne({ where: { id: req.params.assessment_id } }));
    if (err) return ReE(res, err, 422);
    if (assessmentData == null) {
      return ReE(res, "No assessment data found", 404);
    } else {
      assessmentData.update(payload);


      let screenObject = payload.screening_question_ids.map(ele => {
        let newObject = {
          assessment_id: assessmentData.id,
          question_id: ele,
          type: 'SCREENING'
        }
        return newObject;
      })
      let mainsObject = payload.mains_question_ids.map(ele => {
        let newObject1 = {
          assessment_id: assessmentData.id,
          question_id: ele,
          type: 'MAINS'
        }
        return newObject1;
      })
      let assessmentQueVar = screenObject.concat(mainsObject);
      [err, assessmentQuestionData] = await to(assessment_questions.bulkCreate(assessmentQueVar));
     
      let plainAssessmentData  = assessmentData.get({plain: true});
      if (err) return ReE(res, err, 422);
      plainAssessmentData.assessment_questions = assessmentQuestionData.map(ele => {
        let obj = ele.get({plain: true});
        return obj;
      });
     
      return ReS(res, { data: plainAssessmentData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateAssessment = updateAssessment;

const deleteAssessment = async function (req, res) {
  let err, assessmentData;
  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "Id params is missing" }, 422);
  }
  try {
    [err, assessmentData] = await to(assessments.findOne({ where: { id: req.params.assessment_id } }));
    if (err) return ReE(res, err, 422);
    if (assessmentData == null) {
      return ReE(res, "No assessment data found", 404);
    } else {
      assessmentData.destroy();
      [err, response] = await to(assessment_configurations.destroy({where: { assessment_id: req.params.assessment_id }}));

      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "Assessment deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteAssessment = deleteAssessment;

const deleteBulkAssessment = async function (req, res) {
  let err;
  if(req.query && req.query.ids == undefined) {
    return ReE(res, {message: "IDs is required for delete operations"}, 422);
  }
  try {
    [err, response] = await to(assessments.destroy({where: { id: {[Op.in] : req.query.ids.split(',')} } }));
    [err, response2] = await to(assessment_configurations.destroy({where: { assessment_id: {[Op.in] : req.query.ids.split(',')} }}));

    if (err) return ReE(res, err, 422);
    return ReS(res, { data: "Assessment deleted successfully." }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteBulkAssessment = deleteBulkAssessment;

// create configuration for screening and mains
const createAssessmentConfiguration = async function (req, res) {
  let err, assessmentData, assessmentQuestionData;
  let body = req.body;
  body.assessment_type = req.params.assessment_type.toUpperCase();
  body.assessment_id = parseInt(req.params.assessment_id);
  body.skill_distributions = body.skill_distributions;
  [err, assessmentsData] = await to(assessments.findOne({id: body.assessment_id}));
  if(assessmentsData == null) {
    return ReE(res, "Assessment not found", 404);
  }
  [err, isAssementConfigurationExist] = await to(assessment_configurations.findAll({where: {assessment_id: body.assessment_id, assessment_type: body.assessment_type}, raw: true}));
  console.log(isAssementConfigurationExist);
  if(isAssementConfigurationExist.length > 0) {
    return ReE(res, `#${body.assessment_id} ${body.assessment_type.toLowerCase()} assessment ${isAssementConfigurationExist.length} ${isAssementConfigurationExist.length > 1 ?  'entries' : 'entry'} already is exist`, 422);
  }
  try {
    [err, screeningConfiguratonData] = await to(assessment_configurations.create(body));
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: screeningConfiguratonData  }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.createAssessmentConfiguration = createAssessmentConfiguration;


const getAssessmentConfiguration = async function (req, res) {
  let err, assessment_configurations_data;
  let payload = req.body;
  payload.assessment_id = parseInt(req.params.assessment_id);
  try {
    [err, assessment_configurations_data] = await to(assessment_configurations.findAll({ where :{assessment_id: payload.assessment_id} }));
    return ReS(res, { data: assessment_configurations_data  }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAssessmentConfiguration = getAssessmentConfiguration;

// questions 
const getAssessmentConfigurationQuestions = async function (req, res) {
  let err, assessment_configurations_data, skills_data;
  let payload = req.body;
  payload.assessment_id = parseInt(req.params.assessment_id);
  try {
    let type = req.params.assessment_type.toUpperCase();
    let assessment_id = parseInt(req.params.assessment_id);
    [err, assessment_configurations_data] = await to(assessment_configurations.findOne({ where :{ assessment_id: assessment_id, assessment_type: type}, raw: true }));

    let skillDistributions = assessment_configurations_data.skill_distributions;
    console.log(skillDistributions);

    
    let skillIds = skillDistributions.map(ele => {
      return ele.skill_id;
    });

    let skillWithCount = {};
    let skillSubjects = {}  
    skillDistributions.forEach(element => {
      console.log(element);
      skillWithCount[element.skill_id] = element.no_of_questions;
      skillSubjects[element.skill_id] = element.subject_ids ? element.subject_ids : null;
      
    });

    [err, skills_data] = await to(skills.findAll({ 
      where : { id: { [Sequelize.Op.in] : skillIds} },
      attributes: ['name', 'id'],
      raw: true }));

   
    let skillQuestions = skills_data.map(element => {
      let object = {...element};
      object.no_of_questions = skillWithCount[element.id];
      return object;
    });

   
    // 5E : 3M : 1H : 1VH = screening
    // 6E : 6M : 6H : 2VH = mains
    // 'EASY', 'MEDIUM', 'HIGH', 'VERY_HIGH'

    let distributions = {
      screening: [{limit: 5, difficulty_level: 'EASY'},
      {limit: 3, difficulty_level: 'MEDIUM'},
      {limit: 2, difficulty_level: 'HARD'}],
      mains: [{limit: 8, difficulty_level: 'EASY'},
      {limit: 6, difficulty_level: 'MEDIUM'},
      {limit: 6, difficulty_level: 'HARD'}]
    };

    let distributionsOrg = JSON.parse(JSON.stringify(distributions));
    
    let skill_questions_data = [];
    let questionsD = {};
    skill_questions_data = skillQuestions.map(async ele => {
      let obj = {...ele};

      console.log(obj);

      // let isSkillpsyhometry = [44, 46, 48];
      // distributions[req.params.assessment_type][0].limit = distributionsOrg[req.params.assessment_type][0].limit
      // if(isSkillpsyhometry.indexOf(ele.id) >= 0 ) {
      //   distributions[req.params.assessment_type][0].limit = 10;
      // }
     
      let subjectObjO = skillSubjects[ele.id] ? skillSubjects[ele.id] : null;
     
      // if(subjectObjO == null) {
      //   obj.questions = await Promise.all([
      //     await getQuestions(ele,distributions[req.params.assessment_type][0], type, assessment_configurations_data.level_id),
      //     await getQuestions(ele,distributions[req.params.assessment_type][1], type, assessment_configurations_data.level_id),
      //     await getQuestions(ele,distributions[req.params.assessment_type][2], type, assessment_configurations_data.level_id),
      //     await getQuestions(ele,distributions[req.params.assessment_type][3], type, assessment_configurations_data.level_id)
      //   ]);
      // } else {
        let finalSubjectQuery = [];

        let gradeIdsValues = [];
        [err, gradeIds] = await to(model.level_grades.findAll({where: {level_id: assessment_configurations_data.level_id}, attributes: ['grade_id'], raw: true}));
        if(gradeIds) {
          gradeIdsValues = gradeIds.map(h => { return h.grade_id } );
        }

        if(type.toLowerCase() == 'screening') {
          if(ele.name.toLowerCase() === 'core skill') {
            finalSubjectQuery = await getCoreSkillQuestions(obj, gradeIdsValues, assessment_configurations_data, subjectObjO);

            console.log("core-skill", finalSubjectQuery);
          }
          if(ele.name.toLowerCase() === 'communication skills') {

            let strandsData = [];
            [err, strandsData] = await to(strands.findAll({where: { strand_text : {
              [Op.in]: ['Written Communication', 'Oral Communication', 'Effective Listening']
            } }, attributes: ['strand_text', 'id'], raw: true}));
            
            finalSubjectQuery = await getCommunicationSkill(obj, strandsData, assessment_configurations_data);
          }
        }

        if(type.toLowerCase() == 'mains') {
          if(ele.name.toLowerCase() === 'core skill') {
            finalSubjectQuery = await getCoreSkillQuestions(obj, gradeIdsValues, assessment_configurations_data, subjectObjO);
          }
          if(ele.name.toLowerCase() === 'communication skills') {
            let strandsData = [];
            [err, strandsData] = await to(strands.findAll({where: { strand_text : {
              [Op.in]: ['Written Communication', 'Oral Communication', 'Effective Listening']
            } }, attributes: ['strand_text', 'id'], raw: true}));
            
            finalSubjectQuery = await getCommunicationSkill(obj, strandsData, assessment_configurations_data, 'mains');
          }
          if(ele.name.toLowerCase() === 'pedagogy') {
            finalSubjectQuery = await getPedagogySkill(obj, assessment_configurations_data);
           
          }
          if(ele.name.toLowerCase() === 'psychometric') {
            console.log("===================(()==================");
            finalSubjectQuery = [{
              level_id: assessment_configurations_data.level_id,
              skill_id: obj.id,
              limit: obj.no_of_questions,
              set_number: randomIntFromInterval(1, 3),
              isPsy: true
            }];
           
          }
          if(ele.name.toLowerCase() === 'digital literacy') {
            let arrayData = [{key: 'Digital content knowledge', limit: 5} ,{key: 'Digital application', limit: 5}, {key: 'Troubleshooting', limit: 2}];
            [err, strandsData] = await to(strands.findAll({where: { strand_text : {
              [Op.in]: arrayData.map(ele => { return ele.key })
            } }, attributes: ['strand_text', 'id'], raw: true}));
            
            finalSubjectQuery = await getDigitalSkill(obj,strandsData,arrayData, assessment_configurations_data);
           // console.log(finalSubjectQuery, strandsData);
          }

          // console.log("====*******=====", finalSubjectQuery);
          
        }

        obj.questions = await Promise.all( 
          finalSubjectQuery.map(async fq => {
            if(fq && fq.isPsy) {
              console.log(fq, "===============================");
              return await getPsyQuestions(ele, fq, type, assessment_configurations_data.level_id);
            } else {
              return await getQuestions(ele, fq, type, assessment_configurations_data.level_id);
            }
          })
        );

        obj.filterData = finalSubjectQuery; 
    // }

        obj.subjectIds = subjectObjO;
      
      return obj;
    });

    let question_ids = [];
    Promise.all(skill_questions_data).then(async function(values) {
      
      
      let newData  = values.map(async ele => {
        let obj = {...ele};
        let questionList = [];
        if(obj.questions) {
          obj.questions.forEach(e => {
            questionList = questionList == undefined ? [] : questionList
            e = e == undefined ? [] : e
            questionList = [...e, ...questionList];
          });
        }
        obj.questions = questionList;
        let diff = obj.no_of_questions - questionList.length;
        if(diff > 0) {

          let strandsData = [];

          [err, strandsData] = await to(strands.findAll({where: { strand_text : {
            [Op.in]: ['Written Communication', 'Oral Communication', 'Effective Listening']
          } }, attributes: ['strand_text', 'id'], raw: true}));
          

          let filterObj = {level_id: assessment_configurations_data.level_id, limit: diff};
          if(obj.subjectIds) {
            filterObj.subject_ids = obj.subjectIds.map(ele => { return ele.subject_id; });
          }
          obj.question_remaining = await getQuestions({id: obj.id}, filterObj, null, assessment_configurations_data.level_id, question_ids);
        } else {
          obj.question_remaining = [];
        }
        return obj; 
      });

      let finalData = await Promise.all(newData);

      assessment_configurations_data.skill_questions = finalData.map(ele => {
        let obj = {...ele};
        let questionList = [];
        if(obj.questions) {
          //  obj.questions.forEach(e => {
          //   questionList = questionList == undefined ? [] : questionList
          //   e = e == undefined ? [] : e
          //   questionList = [...e, ...questionList];
          // });
        }
        obj.questions = [...obj.question_remaining,...obj.questions].filter(ele => ele != undefined);
        questionList = obj.questions;
        obj.questions_count = questionList.length;
        obj.question_ids = questionList.map(ele => { return ele.id });
        
        if(questionList) {
          questionList.forEach(k => {
            question_ids.push(k.id);
          });
        }
        return obj; 
      });

      assessment_configurations_data.question_ids = question_ids;
      assessment_configurations_data.total_questions = question_ids.length;
      return ReS(res, { data: assessment_configurations_data }, 200);
    });
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAssessmentConfigurationQuestions = getAssessmentConfigurationQuestions;

function getSubObj(dd, subjectObjO, subjectLength) {
  let easy = Math.floor(dd.limit / subjectLength);
  let subjRand = randomIntFromInterval(1, subjectLength)
  return subjectObjO.map((element, index) => {
    let obj = {...element};
    if(subjectLength == 1) {
      obj.limit = dd.limit;
    } else {
      if((index+1) == subjRand) {
        obj.limit = (dd.limit - easy)
      } else {
        obj.limit = easy
      }
    }
    
    obj.difficulty_level = dd.difficulty_level;
    return obj;
  });

}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}


async function getQuestions(ele, k = null, type, level_id, isQuestionList = []) {
  let err, questionsData;

    let where = { skill_id: ele.id };
    if(k && k.subject_id) {
      where.subject_id = k.subject_id;
    }
   
    if(k && k.subject_ids) {
      where.subject_id = { [Op.in]: k.subject_ids };
    }
   
    if(k && k.complex) {
      where.complexity_level = k.complex;
    }

    if(k && k.grade_id) {
      where.grade_id = k.grade_id;
    }
   
    if(k && k.bloom) {
      where.blooms_taxonomy = k.bloom;
    }
    
    if(k && k.level_id) {
      where.level_id = k.level_id;
    }

    if(k && k.strand_id) {
      where.strand_id = k.strand_id;
    }
    
    console.log("where", where);

    if(isQuestionList.length > 0) {
      where.id  = {
        [Op.notIn]: isQuestionList
      }; 
    }

    [err, questionsData] = await to(questions.findAll({ 
    where : where,
    include: [{
      model: question_options
    },
    { model: model.skills, attributes: ['name'] },
    { model: model.levels, attributes: ['name'] },
    { model: model.subjects, attributes: ['name'] }],
    order: Sequelize.literal('random()'),
    limit: k.limit }));

    return questionsData;
  
}

async function getPsyQuestions(ele, k, type, level_id) {
  let err, questionsData;

    let where = { skill_id: ele.id };
    
    if(k.level_id) {
      where.level_id = k.level_id;
    }

    if(k.set_number) {
      where.set_number = k.set_number;
    }
    
    console.log("where", where);
    [err, questionsData] = await to(psy_questions.findAll({ 
    where : where,
    include: [{
      model: psy_question_options
    },
    { model: model.skills, attributes: ['name'] },
    { model: model.levels, attributes: ['name'] }],
    order: Sequelize.literal('random()'),
    limit: k.limit }));

    return questionsData;
  
}

async function getPedagogySkill(obj, assessment_configurations_data) {
  let oneFourthPart = Math.ceil(obj.no_of_questions / 3);
  let matrixProblem  = [
    { complex: 'P1', bloom: 'UNDERSTAND', limit: 3, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P2', bloom: 'UNDERSTAND', limit: 2, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P3', bloom: 'UNDERSTAND', limit: 2, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P1', bloom: 'APPLY', limit: 2, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P2', bloom: 'APPLY', limit: 1, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P3', bloom: 'APPLY', limit: 1, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P1', bloom: 'ANALYZE', limit: 2, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P2', bloom: 'ANALYZE', limit: 1, level_id: assessment_configurations_data.level_id}, 
    { complex: 'P3', bloom: 'ANALYZE', limit: 1, level_id: assessment_configurations_data.level_id}
    ];
  let finalObjectValue = [];

  matrixProblem.forEach(e => {
    finalObjectValue.push({
      ...e,
      ...{
        complex: e.complex,
        limit: e.limit
      }
    });
  });

  // let highRatio = finalObjectValue;
  // let ratio2 = getRatioLimitValue(oneFourthPart, highRatio);

  return [...[], ...finalObjectValue];
}
async function getDigitalSkill(obj, strands, strandData, assessment_configurations_data) {
  strandData  = strandData.map(ele => {
    let findObje = strands.find(e => e.strand_text == ele.key);
    ele.strand_id = findObje && findObje.id ? findObje.id : 0;
    return ele;
  })
  return [...[], ...strandData];
}

async function getCommunicationSkill(obj, strands, assessment_configurations_data, type = 'screening') {
  let finalSubjectQuery = [];
  
  let isListening = strands.filter(ele => ele.strand_text == 'Effective Listening');

  let oneFourthPart = isListening ? Math.ceil(obj.no_of_questions / 4) : 0;
  let first3rd = obj.no_of_questions - oneFourthPart;
 
  let matrixProblem  = [{ complex: 'P1'}, { complex: 'P2'}];
  if(type == "mains") {
    matrixProblem  = [{ complex: 'P1'}, { complex: 'P2'}, { complex: 'P3'}];
  }
  let finalObjectValue = [];

  strands.forEach(ele => {
    matrixProblem.forEach(e => {
      finalObjectValue.push({
        ...ele,
        ...{
          strand_id: ele.id,
          complex: e.complex
        }
      });
    });
  });

  let lowRatio = finalObjectValue.filter(ele => ele.strand_text == 'Effective Listening');
  let highRatio = finalObjectValue.filter(ele => ele.strand_text != 'Effective Listening');

  let ratio1 = getRatioLimitValue(oneFourthPart, lowRatio);
  let ratio2 = getRatioLimitValue(first3rd, highRatio);

  return [...ratio1, ...ratio2];
}

function getRatioLimitValue(numberOfQuestion, setGrid) {
  let finalSubjectQuery = [];
  let finalLimit = Math.ceil(numberOfQuestion / setGrid.length);

  console.log("======ratio", finalLimit, setGrid.length);

  let totalLimit = 0;
  let count = 0;
  setGrid.forEach(el => {
    count = count + 1;
    let assignlimit = totalLimit <= numberOfQuestion ? parseInt(finalLimit) : 0;
    totalLimit = totalLimit + parseInt(assignlimit);
    
    if(assignlimit > 0) {
      finalSubjectQuery.push({
        ...el,
        ...{
          limit: finalLimit
        }
      });
    }
  });

  if(totalLimit != numberOfQuestion) {
    finalSubjectQuery[finalSubjectQuery.length - 1].limit = finalSubjectQuery[finalSubjectQuery.length - 1].limit - (totalLimit - numberOfQuestion);
  }
  return finalSubjectQuery;
}


async function getCoreSkillQuestions(obj, gradeIdsValues, assessment_configurations_data, subjectObjO) {
  let finalSubjectQuery = [];
  let gradeValue = gradeIdsValues;
  let gridValue = [{ bloom: 'UNDERSTAND', complex: 'P1'},
  { bloom: 'APPLY', complex: 'P1'},
  { bloom: 'ANALYZE', complex: 'P1'},
  { bloom: 'UNDERSTAND', complex: 'P2'}]
  let gradeLimit = obj.no_of_questions / gradeValue.length;
  let finalLimit = Math.ceil(gradeLimit / gridValue.length);

  let totalLimit = 0;
  let count = 0;
  gradeValue.forEach(e => {
    gridValue.forEach(el => {
      count = count + 1;
      let assignlimit = totalLimit <= obj.no_of_questions ? parseInt(finalLimit) : 0;
      totalLimit = totalLimit + parseInt(assignlimit);
      
      if(assignlimit > 0) {
        finalSubjectQuery.push({
          ...el,
          ...{
            grade_id: e,
            subject_ids: subjectObjO.map(el => { return el.subject_id }),
            level_id: assessment_configurations_data.level_id,
            limit: finalLimit
          }
        });
      }
    });
  });

  if(totalLimit != obj.no_of_questions) {
    finalSubjectQuery[finalSubjectQuery.length - 1].limit = finalSubjectQuery[finalSubjectQuery.length - 1].limit - (totalLimit - obj.no_of_questions);
  }
  return finalSubjectQuery;
}


// ************************************************** USER SIDE API **************************************************

const blockSchoolInventory = async function (req, res) {
  let err, assessmentData, assessmentQuestionData;
  try {
    await blockInventoryFunction(req.params.user_id);
    return ReS(res, { data: "inventory block"  }, 200);
    
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.blockSchoolInventory = blockSchoolInventory;


const blockInventoryFunction = async function (user_id) {

  let [err, isUserBlocked] = await to(inventory_blocks.findOne({
    where: { user_id: user_id, status: "BLOCKED" }
  }));

  console.log(isUserBlocked);
  
  if(isUserBlocked) {
    return false;
  }

  [err, userAssessment] = await to(user_assessments.findAll({ 
    where: { screening_status: 'PASSED', mains_status: 'PENDING', user_id: user_id },
    attributes: ['id', 'user_id', 'assessment_id', 'mains_status'],
    raw: true
  }));

  if(userAssessment == null) {
    return false;
  }

  let assessment_id = userAssessment.map(ele => { return ele.assessment_id; });
  [err, campaign_ids] = await to(model.campaign_assessments.findAll({ 
    where: { assessment_id: {
      [Op.in]: [...new Set(assessment_id)]
    } },
    attributes: ['campaign_id'],
    raw: true
  }));

  let campaignIds = campaign_ids.map(ele => {
    return ele.campaign_id
  });
  campaignIds = [...new Set(campaignIds)];

  [err, schoolsData] = await to(model.campaigns.findAll({ 
    where: { id: {
      [Op.in]: [...new Set(campaignIds)]
    } },
    attributes: ['school_ids'],
    raw: true
  }));

  let schoolIds = [];
  schoolsData.forEach(ele => {
    schoolIds = [...schoolIds, ...ele.school_ids];
  });

  let uniqueSchools = [...new Set(schoolIds)];


  [err, schoolCodes] = await to(model.schools.findAll({ 
    where: { id: {
      [Op.in]: [...new Set(uniqueSchools)]
    } },
    attributes: ['school_code'],
    raw: true
  }));

  let inventoryCode = schoolCodes.map(ele => {
    return parseInt(ele.school_code.replace(/[^\d]/g, ''))
  });


  [err, finalInventory] = await to(model.school_inventories.findAll({ 
    where: { code: {
      [Op.in]: [...new Set(inventoryCode)]
    } },
    raw: true
  }));

  

  console.log(finalInventory);

  let index = 0;
  let getNumberOfPCwithCamera = finalInventory.filter(ele => ele.no_of_pc_camera_labs > 0);
  let blockLaptopWithCamera = await recursiveInventorySearch(index, getNumberOfPCwithCamera, 'no_of_pc_camera_labs', 'PC_WITH_CAMERA');
  console.log("========", blockLaptopWithCamera);
  if(blockLaptopWithCamera != -1) {

    await sendMailToUsers(user_id, getNumberOfPCwithCamera[blockLaptopWithCamera], 'PC_WITH_CAMERA');

  } else {
    let no_of_laptop_camera_labs = finalInventory.filter(ele => ele.no_of_laptop_camera_labs > 0);
    let no_of_laptop_camera_labsData = await recursiveInventorySearch(index, no_of_laptop_camera_labs, 'no_of_laptop_camera_labs', 'LAPTOP_WITH_CAMERA');
    if(no_of_laptop_camera_labsData != -1) {

      console.log("no_of_laptop_camera_labs", no_of_laptop_camera_labsData);
      await sendMailToUsers(user_id, no_of_laptop_camera_labs[no_of_laptop_camera_labsData], 'LAPTOP_WITH_CAMERA');

    } else {
      let no_of_pc_labs = finalInventory.filter(ele => ele.no_of_pc_labs > 0);
      let no_of_labsData = await recursiveInventorySearch(index, no_of_pc_labs, 'no_of_pc_labs', 'PC');
      if(no_of_labsData != -1) {

        console.log("no_of_pc_labs", no_of_labsData);
        await sendMailToUsers(user_id, no_of_pc_labs[no_of_labsData], 'PC');

      } else {
        let no_of_laptop_labs = finalInventory.filter(ele => ele.no_of_laptop_labs > 0);
        let no_of_laptopData = await recursiveInventorySearch(index, no_of_laptop_labs, 'no_of_laptop_labs', 'LAPTOP');
        if(no_of_laptopData != -1) {

          console.log("no_of_laptop_labs", no_of_laptopData);
          await sendMailToUsers(user_id, no_of_laptop_labs[no_of_laptopData], 'LAPTOP');

        }
      }
    }
  }

} 


let sendMailToUsers = async function (user_id, schoolData, inventoryType) {
   
    let obj = {
      user_id: user_id,
      code: schoolData.code,
      status: "BLOCKED",
      inventory_type: inventoryType
    };
    console.log(schoolData, obj);
    let [err, response] = await to(inventory_blocks.create(obj));
    console.log(err);
    [err, schoolData] = await to(model.schools.findOne({
      where: { school_code: {
        [Op.iLike]: `%${schoolData.code}%`
      } },
      attributes: ['address']
    }));


    let parameters = {
      date: moment().add(7,'days').format('DD-MM-YYYY'),
      time: `10:00AM - 12:00PM`,
      location: schoolData.address
    };
    let subjectHead = "Screening Test Result - Vibgyor Group of Schools";
    let html = ejs.render(
      fs.readFileSync(__dirname + `/../../views/passed_screening.ejs`).toString(),
      parameters
    );

    [err, userInfo] = await to(users.findOne({ where: { id :  user_id }, attributes: ['email'], raw: true }));
    
    console.log("=================", html, userInfo.email);
    if(userInfo && userInfo.email) {
     
      var subject = subjectHead;
      try {
        let response = await mailer.send(userInfo.email, subject, html);
        console.log("mail reponse", response);
        return true;
      } catch(err) {
        console.log(err);
        return true;
      }
    } else {
      return true;
    }
}

/* ====================================================
For claculating scores, saving to db and mail for SINLGE user 
=========================================================*/
const setAssessmentAnalytics = async (req, res) => {
  let err, assessmentResultData;
  if (req.body && req.body.assessment_id == undefined) {
    return ReE(res, { message: "assessment_id is missing" }, 422);
  }
  if (req.body && req.body.user_id == undefined) {
    return ReE(res, { message: "user_id is missing" }, 422);
  }
  let assessment_id = req.body.assessment_id;
  let user_id = req.body.user_id;

  try {
    [skillScores, subjectScores, totalScored, percentile, result, type] = await calculateSkillScores(assessment_id, user_id);
    
    // skillScores.subjectScores = subjectScores; 
    // throw new Error("working ");
    let assessmentResultPayload = {};

    assessmentResultPayload.user_id         = user_id;
    assessmentResultPayload.assessment_id   = assessment_id;
    assessmentResultPayload.skill_scores    = skillScores;
    assessmentResultPayload.subject_scores  = subjectScores;
    assessmentResultPayload.percentile      = percentile;
    assessmentResultPayload.result          = result;
    assessmentResultPayload.type            = type;
    
    let resultLink =  process.env.FRONTEND_URL+`/#/assessment/${assessment_id}/${type.toLowerCase()}/result`;
    let subject    = `${type == 'MAINS'? 'Mains' : 'Screening'} Assessment Result Notification - Access Your Results Now!`;

    // get user info
    [err, userData] = await to(users.findOne({where : {id: user_id}, raw:true }));
    // console.log("the result link", userData);
    
    // console.log("assessmentResultPayload", assessmentResultPayload);
    if(req.body.force_mail) sendResultMail(userData, resultLink, subject);

    [err, assessmentResultData] = await to(assessment_results.findOne({ 
      where: { user_id: user_id, assessment_id: assessment_id }
    }));
    if(assessmentResultData) { return ReS(res, { data: assessmentResultData }, 200); }
    else {
      [err, assessmentResultData] = await to(assessment_results.create(assessmentResultPayload));
      if(err) return ReE(res, err, 422);
      if(assessmentResultData)
        sendResultMail(userData, resultLink, subject);
    }

    return ReS(res, { data: assessmentResultData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.setAssessmentAnalytics = setAssessmentAnalytics;

const sendResultMail = async (userInfo, resultLink, subject ) => {
  parameters = { name: userInfo.first_name, result_link: resultLink };
  let html = await ejs.render(
    fs.readFileSync(__dirname + `/../../views/results.ejs`).toString(),
    parameters
  );
  console.log(" here ", html);
  if(userInfo && userInfo.email) {
    try {
      let response = await mailer.send(userInfo.email, subject, html);
      // console.log("mail reponse", response);
      return true;
    } catch(err) {
      throw new Error('Email not sent');
    }
  } else {
    throw new Error('Email not found');
  }
}

const calculateSkillScores = async (assessment_id, user_id) => {
  let err, assessmentConfigData, userResponseData, questionData, skillsData, subjectsData;

  [err, assessmentConfigData] = await to(assessment_configurations.findOne({
    where: { assessment_id: assessment_id }, raw:true
  }));

  // console.log("assessmentConfigData", assessmentConfigData);

  let assessmentSkillId = [];
  let assessmentSubjectId = [];
  assessmentConfigData.skill_distributions.map(obj => {
    assessmentSkillId.push(obj.skill_id);
    if(obj.subject_ids) {
      obj.subject_ids.map(sobj => { assessmentSubjectId.push(sobj.subject_id); });
    }
  } );
  // console.log("assessmentConfigData.skill_distributions", assessmentConfigData.skill_distributions);
  [err, userResponseData] = await to(user_assessment_responses.findOne({
    where: { user_id: user_id, assessment_id: assessment_id },
    raw: true
  }));
  let userResponse =  JSON.parse(userResponseData.response_json);

  [err, assessmentQuestionData] = await to(assessment_questions.findAll({ where: { assessment_id: assessment_id}, attributes:['question_id'], raw:true }));
  // console.log("assessmentQuestionData", assessmentQuestionData);
  
  // get question and their skills data
  let questionIds = assessmentQuestionData.map(ele => ele.question_id);
  // console.log("question ids ", questionIds);
  [err, questionData] = await to(questions.findAll({where: { id: { [Op.in]: questionIds }}, raw:true }));
  
  [err, skillsData ]= await to(skills.findAll({where:{ id: { [Op.in]: assessmentSkillId } }, raw:true, attributes:['id', 'name'] }));
  let skillMap = {};
  let skillScores = {};
  if(skillsData) { 
    skillsData.forEach(ele => { 
      skillMap[ele.id] = ele.name; 
      skillScores[ele.name] = 0;
    });
  }

  [err, subjectsData ]= await to(subjects.findAll({where:{ id: { [Op.in]: assessmentSubjectId } }, raw:true, attributes:['id', 'name'] }));
  let subjectMap = {};
  let subjectScores = {};
  if(subjectsData) { 
    subjectsData.forEach(ele => { 
      subjectMap[ele.id] = ele.name; 
      subjectScores[ele.name] = 0;
    });
  }

  questionData.forEach(qe => {
    let skill     = skillMap[qe.skill_id];
    let subject   = subjectMap[qe.subject_id];
    if(userResponse[qe.id] && qe.question_type == 'MULTIPLE_CHOICE'){
      userResponse[qe.id].map( ans => { qe.correct_answer.includes(ans) ? calculateScore(assessmentConfigData, skill, skillScores, subject, subjectScores) : ''; } );
    }
    else if(userResponse[qe.id] && qe.question_type == 'MATCH_THE_FOLLOWING'){
      Object.keys(userResponse[qe.id]).forEach(function(key, index) {
        if(lowercaseKeyValue(userResponse[qe.id])[key] == qe.correct_answer[key]) { calculateScore(assessmentConfigData, skill, skillScores, subject, subjectScores); }
      });
    }
    else {
      if(userResponse[qe.id] && userResponse[qe.id].toLowerCase() == qe.correct_answer.toLowerCase()) { calculateScore(assessmentConfigData, skill, skillScores, subject, subjectScores); }
    }
    // console.log("the question id is ",qe.question_type, qe.id);
  });

  // console.log("the questions ", questionData);
  // console.log("the score skill now ", skillScores);
  // console.log("the score subject now ", subjectScores);
  // throw new Error("work in progress");

  let totalScored = 0;
  Object.keys(skillScores).forEach(ele => {
    totalScored += skillScores[ele];
  });

  let percentile  = ((totalScored/(assessmentConfigData.correct_score_answer * assessmentConfigData.total_no_of_questions))*100).toFixed(2);
  // let totalScore = 
  let result = percentile > parseFloat(assessmentConfigData.passing_criteria) ? 'PASSED' : 'FAILED' ;
  return [skillScores, subjectScores, totalScored, percentile, result, assessmentConfigData.assessment_type];
}

const calculateScore = (config, skill, skillScores, subject, subjectScores) => {
  if(config.correct_score_answer) {
    skillScores[skill] += config.correct_score_answer;
    // TODO: fix CoreSkill Mapping here 
    if(skill=="Core Skill" || skill == 45)
      subjectScores[subject] += config.correct_score_answer;
  }
}

const timeRanges = () => {
  let num = _.random(2,4);
  return "("+ num + '-' + (num+1) + ' minutes)';
}

const getTopicMap = csvData => {
  const topicMap = new Map();

  let section = 1;
  for (const row of csvData) {
    // section += 0.1;
    const topic = row.topic;
    const lessonNo = row.section_no;// section.toFixed(1);
    const subtopic = row.subTopics;
    const timing = timeRanges();

    if (!topicMap.has(topic)) {
      topicMap.set(topic, []);
    }

    // topicMap.get(topic).push([lessonNo, subtopic]);
    topicMap.get(topic).push([subtopic, timing]);
  }
  return topicMap;
}

const s3Topic = async (grade, subject, subject2) => {
  
    let jsonData = await fetchSubjectTopic(grade, subject, subject2);
    jsonData.shift();
    // console.log("The fetched s3 JSON Data", jsonData);
    // console.log("no of rows", jsonData.length);
    let chosenTopicNo = _.random(0,(jsonData.length-1));
    // console.log("chose random no ", chosenTopicNo);
    let topicName = jsonData[chosenTopicNo].topic;
    
    let topicMap = getTopicMap(jsonData);
    // console.log("topic name MAP ", topicName);
    let chosenTopic = topicMap.get(topicName);
    chosenTopic.unshift(['Introduction', '(1-2 minutes)']);
    chosenTopic.push(['Conclusion and wrap-up', '(1-2 minutes)']);

    return { topic: topicName, description: chosenTopic };
}

/* ====================================================
For claculating scores, saving to db and mail for MULTIPLE user 
=========================================================*/
// TODO: total calculation
const userAssessmentsResult = async function (req, res) {
  let err, assessmentsData,userAssessmentData;
  payload = req.body;
  
  if(req.params && (req.params.assessment_id == undefined)) {
    return ReE(res, { message: "Assessment and user id is required." }, 422);
  }
  if(req.query && (req.query.type == undefined)) {
    return ReE(res, { message: "Assessment type is required in query parameter." }, 422);
  }
  // if(req.query && (req.query.user_id == undefined)) {
  //   return ReE(res, { message: "user_id is required in query parameter." }, 422);
  // }

  let assessment_type = req.query.type.toUpperCase();
  let assessment_id   = req.params.assessment_id;

  let userAssessmentWhere = {};
  // if user_ids not provided
  let assessmentUserIds = [];
  if(req.query && (req.query.user_id == undefined)) {
    // find users who [FINISHED, PASSED, FAILED] the assessment 
    let userAssessmentStatus = ["FINISHED", "PASSED", "FAILED"];
    [err, userAssessmentData] = await to(user_assessments.findAll({ 
      where: { assessment_id: assessment_id, status: { [Op.in]: userAssessmentStatus} }, raw: true }));
    if(userAssessmentData) {
      userAssessmentData.map(adata => { 
        // console.log("the assessmnet data ", adata);
        assessmentUserIds.push(adata.user_id); 
      });
    }

    console.log("elegible user for result ", assessmentUserIds);
  }
  else {
    assessmentUserIds = req.query.user_id.split(",");
  }
  
  userAssessmentWhere = { user_id: { [Op.in]: assessmentUserIds } };

  // if(req.query && req.query.user_id) {
  // }

  let whereAssessmentConfig = {};
  if(req.query && req.query.type) {
    whereAssessmentConfig = { assessment_type: assessment_type };
  }
  
  [err, assessmentsData] = await to(assessments.findAll(
    {
      where: { id: req.params.assessment_id },
      attributes: ['id','name'],
      include: [
      {
        model: assessment_configurations,
        where: whereAssessmentConfig,
        attributes: ['skill_distributions','total_no_of_questions', 'correct_score_answer', 'passing_criteria', 'assessment_type']
      },
      {
        model: user_assessment_responses,
        where: userAssessmentWhere,
        attributes: ['user_id','response_json'],
        include: [{
          model: users, attributes: ['id','first_name', 'email']
        }]
      },
      {
        model: assessment_questions,
        attributes: ['question_id'],
        include: [ 
        {
          model: psy_questions,
          attributes: ['id', 'question_type', 'score_type','level_id', 'grade_id'],
          include:[
            { model: psy_question_options, as: 'options', attributes: ['id','option_key', 'score_value'] },
            { model: skills, attributes:['id', 'name']},
            { model: levels, attributes:['id', 'name']}
          ]
        },
        { 
          model: questions, 
          // where: { id : {[Op.lt]: 100000000 }},
          attributes : ['id','question_type', 'correct_answer', 'skill_id', 'level_id', 'grade_id', 'subject_id', 'lo_ids'],
          include: [
            {model: subjects, attributes:['id','name']},
            {model: skills, attributes:['id','name']},
            {model: levels, attributes:['id','name']},
            {model: grades, attributes:['id','name']}
          ]
        }
      ],
      }
    ]
    }
  ));
  if(err) return ReE(res, err, 422);


  // return ReS(res, { data: assessmentsData }, 200);


  let skillScores     = {};
  let subjectScores   = {};
  let userInfo        = {};
  let assessmentConfig;
  let skillIdMap      = {};
  let levelHeatMap    = {};
  let gradeHeatMap    = {};
  let subjectHeatMap  = {};
  let skillTotals     = {};
  let subjectsMap     = {};
  let gradesMap       = {};

  // Compare assessment type questions to assessment type answer
  let questionType, assessmentType, correct_qa;
  let assessmentResult = assessmentsData.map(ele => {
    let obj = {...ele.get({plain: true})};
    if(obj.user_assessment_responses.length > 0) {
      assessmentConfig = obj.assessment_configurations[0];
      
      obj.user_assessment_responses.map(uar => {
        if(!uar.user) return;
        // console.log("the user response user", uar.user);
        let user_response = uar.response_json;
        let user_id = uar.user_id;
        levelHeatMap[user_id] = [];
        gradeHeatMap[user_id] = [];
        subjectHeatMap[user_id] = [];
        user_response = JSON.parse(user_response);
        userInfo[user_id] = {};
        userInfo[user_id]['email'] = uar.user.email;
        userInfo[user_id]['first_name'] = uar.user.first_name;

        // return ReS(res, { data: assessmentsData }, 200);
        skillScores[user_id] = {};
        subjectScores[user_id] = {};
        // uar.assessment_configurations = obj.assessment_configurations.find(e => uar.type == e.assessment_type);
        // build questions by user answered assessment type
        let questions = ele.assessment_questions.filter(as => {
          return as.type == uar.type;
        }).map(q => {
          if(q.question) {

            let skill             = q.question.skill.name;
            let subject           = q.question.subject ? q.question.subject.name : null;
            let skill_id          = q.question.skill.id;
            skillIdMap[skill_id]  = skill;
            skillTotals[skill]    = 0;
            skillScores[user_id][skill]         = 0; // initalize skill based score
            subjectScores[user_id][subject]     = 0; // initalize subject based score
            subjectsMap[q.question.subject_id]  = subject;
            gradesMap[q.question.grade_id]      = q.question.grade ? q.question.grade.name : null;

            questionType = q.question.question_type ? q.question.question_type : null ;
            correct_qa = q.question.correct_answer;
            if(questionType == 'MULTIPLE_CHOICE') { correct_qa = q.question.correct_answer.split(','); }
            if(questionType == 'MATCH_THE_FOLLOWING') { 
              correct_qa = JSON.parse(q.question.correct_answer);
              correct_qa = lowercaseKeyValue(correct_qa);
              // console.log("question match the following answer: corrected",q.question.correct_answer,correct_qa);
            }

            // console.log("=============== processed question ",JSON.parse(JSON.stringify(q.question)));
            return {id: q.question_id, correct_answer: correct_qa, type: questionType, level_id: q.question.level_id,
              skill: skill, skill_id: skill_id,  subject: subject, subject_id: q.question.subject_id,
              lo_ids: q.question.lo_ids, is_psycho: false, grade_id: q.question.grade_id
            };
          }
          // for pys_questions
          else if(q.psy_question) {
            let skill = q.psy_question.skill.name;
            skillIdMap[q.psy_question.skill.id] = skill;
            skillScores[user_id][skill] = 0;
            let optMap = {};
            q.psy_question.options.map(ele => {  optMap[ele.option_key] = ele.score_value; });
            // console.log("the option map for qe",q.question_id, optMap);
            return { 
              is_psycho: true, id:q.question_id, set_number: q.psy_question.set_number, level_id: q.psy_question.level_id,
              score_type: q.psy_question.score_type, optionsMap: optMap, skill: skill, grade_id: q.psy_question.grade_id
            };
          }
          else {
            // console.log("===================================== unlinked questions ", JSON.parse(JSON.stringify(q)));
          }

        });
        // console.log("00000000 ------------------ Result Skill score initaizlied obj",skillScores);
        let ob = {};
        
        let score = 0;
        // console.log("=============== processed question ",JSON.parse(JSON.stringify(questions)));
        questions.forEach(qe => {
          // console.log(`The question (${qe.id}) has level id [${qe.level_id}]`);
          // console.log("the filtered question ",JSON.parse(JSON.stringify(questions)));
          if(qe && !qe.is_psycho) {
            skillTotals[qe.skill] += 1;
            ob[qe.id] = qe.correct_answer;
            if(user_response[qe.id] && qe.type == 'MULTIPLE_CHOICE'){
              // console.log(`The question (${qe.id}) of type MCQ and userresponse is [${user_response[qe.id]}]`);
              let are_same = _.isEqual(qe.correct_answer.sort(), user_response[qe.id].sort());
              if(are_same) {
                levelHeatMap[user_id].push(qe.level_id);
                gradeHeatMap[user_id].push(qe.grade_id);
                subjectHeatMap[user_id].push(qe.subject_id);
                calculateScore(assessmentConfig, qe.skill, skillScores[user_id], qe.subject, subjectScores[user_id]);
              }
            }
            // else if(user_response[qe.id] && qe.type == 'MATCH_THE_FOLLOWING'){
            //   // FIXME: calculation is wrong (should check )
            //   Object.keys(user_response[qe.id]).forEach(function(key, index) {
            //     levelHeatMap[user_id].push(qe.level_id);
            //     gradeHeatMap[user_id].push(qe.grade_id);
            //     subjectHeatMap[user_id].push(qe.subject_id);
            //     if(lowercaseKeyValue(user_response[qe.id])[key] == qe.correct_answer[key]) { calculateScore(assessmentConfig, qe.skill, skillScores[user_id], qe.subject, subjectScores[user_id]); }
            //   });
            // }
            else {
              if(user_response[qe.id] && user_response[qe.id].toLowerCase() == qe.correct_answer.toLowerCase()) { 
                levelHeatMap[user_id].push(qe.level_id);
                gradeHeatMap[user_id].push(qe.grade_id);
                subjectHeatMap[user_id].push(qe.subject_id);
                calculateScore(assessmentConfig, qe.skill, skillScores[user_id], qe.subject, subjectScores[user_id]); 
              }
            }
          }
          else if(qe && qe.is_psycho){
            // console.log("the psy options in qno", qe.id, user_response[qe.id]);
            calculatePschometricScore(skillScores[user_id], qe.skill, qe.optionsMap, user_response[qe.id]);
          }
          // console.log("question type and response ",user_id, qe.id, qe.type, qe.skill_id, qe.correct_answer, user_response[qe.id]);
        });
        uar.questionAnswer = ob;
        uar.score = score;
        levelHeatMap[user_id]   = levelHeatMap[user_id].filter(ele => ele !== -1);
        gradeHeatMap[user_id]   = gradeHeatMap[user_id].filter(ele => ele !== -1);
        subjectHeatMap[user_id] = subjectHeatMap[user_id].filter(ele => ele !== -1);
      });
      return obj;
    } else {
      return null
    }
    return obj;
  }).filter(e => e != null);
  
  let [totalScore, assessmentTotal, userPercentile, result ] = await calculateFinalScores(skillScores, assessmentConfig, skillIdMap);

  // console.log(" skill totals ", skillTotals);
  // levelHeatMap = levelHeatMap.filter(ele => ele !== -1);

  // console.log(" Level Heat Map ", levelHeatMap);
  // console.log(" Grade Heat Map ", gradeHeatMap); 
  // console.log(" Subject Heat Map ", subjectHeatMap); 
  // console.log(" Subject Map ", subjectsMap); 
  // console.log(" Grades Map ", gradesMap); 
  // getHighestCount

//  console.log("1111111 ------------------ Result Skill score obj",skillScores);
//   console.log("2222222 ------------------ Result Subject score obj",subjectScores);
//  console.log("333333333 ------------------ Result total score",totalScore);
//   console.log("444444444 ------------------ Result passed/failed",result);
  
  let resultPayload = { 
    skill_totals: skillTotals,
    skill_scores: skillScores, 
    subject_scores: subjectScores, 
    total_scores: totalScore,
    assessment_total: assessmentTotal,
    percentiles: userPercentile,
    user_results: result,
    type: assessment_type,
    assessment_id: assessment_id,
    user_info: userInfo,
    req_query : req.query,
    // recommended_level: getHighestCount(levelHeatMap),
    recommended_grade: getHighestCount(gradeHeatMap,gradesMap),
    recommended_subject: getHighestCount(subjectHeatMap,subjectsMap),
  };

  let insertResult = await saveToDbAndMail(resultPayload);

  return ReS(res, { data: resultPayload }, 200);
  // assessmentResult.forEach(async ele => {
  //   ele.user_assessment_responses.map(async k => {
  //     let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/result/user_assessments/${req.query.type.toUpperCase()}`, k);
  //   });
  // });
  // return ReS(res, { data: assessmentResult }, 200);
}
module.exports.userAssessmentsResult = userAssessmentsResult

const calculatePschometricScore = async(skillScores, skill, optionMap, user_response) => {
  // console.log("====================== calclulating psy score ");
  // console.log(skill, user_response, optionMap);
  if(user_response && optionMap[user_response])
   {skillScores[skill] += optionMap[user_response];}
}

const saveToDbAndMail = async(resultPayload) => {
  let err, assessmentResultData;
  let assessmentResultPayload = [];
  let userRecommendationPayload = {};
  let userRecommendationUserIds = [];
  Object.keys(resultPayload.skill_scores).map(user_id => {
    let obj = {}; 
    let urObj = {};
    let skill_totals = resultPayload.skill_totals;
    obj.user_id         = user_id;
    obj.assessment_id   = resultPayload.assessment_id;
    obj.type            = resultPayload.type;
    obj.skill_scores    = resultPayload.skill_scores[user_id];
    obj.subject_scores  = resultPayload.subject_scores[user_id];
    obj.percentile      = resultPayload.percentiles[user_id];
    obj.result          = resultPayload.user_results[user_id];
    obj.total           = resultPayload.assessment_total;
    obj.total_scored    = resultPayload.total_scores[user_id];
    // excluding psychometric
    obj.skill_total     = Object.keys(resultPayload.skill_scores[user_id]).filter(skill => skill!=='Psychometric').map(skill => skill_totals[skill]);
    assessmentResultPayload.push(obj);
    let type = (resultPayload.type).toLowerCase();
    urObj[`${type}_score`] = resultPayload.total_scores[user_id];
    urObj[`${type}_score_total`] = resultPayload.assessment_total;
    urObj.user_id = user_id;
    urObj.status = "PENDING";
    userRecommendationPayload[user_id] = urObj;
    userRecommendationUserIds.push(parseInt(user_id));
  });
  
  // console.log("user recommendation User IDS used for Update/Create ", userRecommendationUserIds);
  // console.log("user recommendation payload for bulk insert ", userRecommendationPayload);
  await saveToUserRecommendation(userRecommendationUserIds,userRecommendationPayload);
  if(resultPayload.type === 'MAINS') { await saveToDemoVideo(resultPayload); }
  
  // console.log("assessment result payload for bulk insert ", assessmentResultPayload);
  let resultLink =  process.env.FRONTEND_URL+`/#/assessment/${resultPayload.assessment_id}/${resultPayload.type.toLowerCase()}/result`;
  let subject    = `${resultPayload.type == 'MAINS'? 'Mains' : 'Screening'} Assessment Result Notification - Access Your Results Now!`;

  // update user assessment status
  let  userIds = Object.keys(resultPayload.user_results);
  let userAssessmentData;
  [err, userAssessmentData] = await to(user_assessments.findAll({
    where: { user_id: {[Op.in]:userIds }, assessment_id: resultPayload.assessment_id }
  }).then(rows=>{
    rows.forEach(row => {
      if(resultPayload.type == "SCREENING") {
        row.screening_status = resultPayload.user_results[row.user_id];
      }
      if(resultPayload.type == "MAINS") {
        row.mains_status = resultPayload.user_results[row.user_id];
      }
      row.total_score = resultPayload.total_scores[row.user_id];
      row.status = resultPayload.user_results[row.user_id];
      row.save();
    });
  }));

  // console.log(`find assessment result with type ${resultPayload.type} `);
  // console.log("find assessment result with user ids ", userIds);
  // update result 
  let updatedAssessmentResultIds = [];
  [err, assessmentResultData] = await to(assessment_results.findAll({ where: { user_id: { [Op.in]: userIds }, type: (resultPayload.type).toUpperCase() } }) );
  // console.log("the assessment result data", assessmentResultData);

  if(assessmentResultData) {
    assessmentResultData.forEach(row => {
      // console.log("looping  assessmentResultData ", row.user_id);
      // row.skill_total = _.random(100,400);
      // row.save();
        updatedAssessmentResultIds.push(parseInt(row.user_id));
        if(resultPayload.req_query && resultPayload.req_query.force_mail && resultPayload.req_query.force_mail == 1){
          sendResultMail(resultPayload.user_info[ele.user_id], resultLink, subject);
        }
    });
  }

  // console.log("the updated assessment result user ids ",updatedAssessmentResultIds);
  //filter payload (only insert which are not updated above)
  let insertPayload = assessmentResultPayload.filter(ele => {
    return !updatedAssessmentResultIds.includes(parseInt(ele.user_id));
  });

  // console.log("insert payload data for assessment result ", insertPayload);
  // insert result
  [err, assessmentResultData] = await to(assessment_results.bulkCreate(insertPayload).then(row => {
    row.map(ele => {
      // send mail on new row insert
      sendResultMail(resultPayload.user_info[ele.user_id], resultLink, subject);
    })
  }));  
  if(err) throw new Error("Could not insert to assessment.result");

  return assessmentResultData;
}

const saveToUserRecommendation = async (userRecommendationUserIds,userRecommendationPayload) => {
  
  let err, userRecommendationData;
  // userRecommendationUserIds.map(ele => parseInt(ele));
  // console.log("user recommendation User IDS used for Update/Create ", userRecommendationUserIds);
  let updatedUserRecommendationIds = [];
  [err, userRecommendationData] = await to(user_recommendations.findAll({ where: { user_id: {[Op.in]: userRecommendationUserIds} }}) );

  if(userRecommendationData) {
    userRecommendationData.forEach(row => {
        // console.log("the user id in findAll user recommendation ",row.user_id);
      if(userRecommendationPayload[row.user_id]) {
        updatedUserRecommendationIds.push(row.user_id);
        let urp = userRecommendationPayload[row.user_id];
        Object.keys(urp).forEach(prop => { row[prop]= urp[prop]; })
        row.save();
      }
    });
  }
  if(err) { throw new Error("failed to find records for user_recommendation"); }

  // console.log("updated IDs ", updatedUserRecommendationIds);
  
  // find user Ids which are not updated(we have to create new rows for these userIds);
  let insertPayload = [];
  Object.keys(userRecommendationPayload).map(user_id => {
    if(!updatedUserRecommendationIds.includes(parseInt(user_id))) {
      insertPayload.push(userRecommendationPayload[user_id]);
    }
  });

  // console.log("the insert payload is ", insertPayload);
  if(insertPayload.length > 0) {
    [err, userRecommendationData] = await to(user_recommendations.bulkCreate(insertPayload));
  }
}

const saveToDemoVideo = async (payload) => {
  let err, demoData;
  let updatedIds = [];
  let currentUserIds = Object.keys(payload.user_info).map(id => parseInt(id));
  [err, demoData] = await to(demovideo_details.findAll({ 
    where: {assessment_id: payload.assessment_id, user_id: {[Op.in]: currentUserIds } } 
  }));
  if(demoData) {
    demoData.forEach(row => { updatedIds.push(row.user_id); });
  }
  const createIds = _.difference(currentUserIds, updatedIds);
  let insertPayload = [];

    let s3data = {};
    for(let index in createIds) {
      let user_id = createIds[index];
      let grade = payload.recommended_grade[user_id].name || 'Grade 6';
      let subject = (payload.recommended_subject[user_id].name) || 'English';
      subject = subject.replace(" ","_").trim();
      s3data = await s3Topic(grade,subject, 'English'); // English is backup subject
      let obj = {};
      obj.user_id         = user_id;
      obj.assessment_id   = payload.assessment_id;
      obj.demo_topic      = s3data.topic;
      obj.demo_description = s3data.description;
      obj.subject_id      = payload.recommended_subject[user_id].id;
      obj.grade_id        = payload.recommended_grade[user_id].id;
      if(payload.user_results[user_id] === 'PASSED') { 
        // console.log(`the user id ${user_id} is ${payload.user_results[user_id]}`); 
        insertPayload.push(obj);
      }
    }
    // console.log("Demo Insert Payload ", insertPayload);
    [err, demoData] = await to(demovideo_details.bulkCreate(insertPayload));
    if(err) { throw new Error("Could not create Demo topic/Description"); }
}

// const updateUserResult
const calculateFinalScores = async (userSkillScores, assessmentConfigData, skillIdMap) => {
  // console.log("====== Calculating for Assessment Type ", assessmentConfigData);
  let userTotal = {};
  let userResult = {};
  let userPercentile = {};
  let assessmentTotal = calculateAssessmentTotal(assessmentConfigData);
  // console.log("The assessment total is excluding psychometric",assessmentTotal);
  // console.log("User skill Scores ", userSkillScores);
  Object.keys(userSkillScores).map(user => {
    let totalScored = 0;
    Object.keys(userSkillScores[user]).forEach(skill => {
      // console.log("the skill now is", skill);
      if(skill !== 'Psychometric')
        totalScored += userSkillScores[user][skill];
    });
    userTotal[user] = totalScored;
    let percentile  = ((totalScored/(assessmentTotal))*100).toFixed(2);
    let result = percentile > parseFloat(assessmentConfigData.passing_criteria) ? 'PASSED' : 'FAILED' ;
    // passing criteria for mains

    if(assessmentConfigData.assessment_type == "MAINS") {
      // console.log("assessment config",assessmentConfigData);
      // console.log("skill scores",userSkillScores[user]);
      // console.log("skill mAP",skillIdMap);
      
      let skillQuestionMap = {};
      assessmentConfigData.skill_distributions.map(row => skillQuestionMap[skillIdMap[row.skill_id]] = row.no_of_questions );
      // console.log("skill Question MAP",skillQuestionMap);
      let skillPercent = {};
      let userSkill = userSkillScores[user];
      Object.keys(userSkill).forEach(skill => {
        let skillScore = userSkill[skill];
        let skillTotal = skillQuestionMap[skill];
        skillPercent[skill] = ((skillScore/skillTotal)*100).toFixed(2);
      });
      
      isPsychoPass = userSkill.Psychometric < 57 ? false : true ;
      console.log(user, " has passed psychometric ? ",  isPsychoPass);

      // TODO: pyschometric key 
      if(skillPercent.Psychometric) { delete skillPercent.Psychometric; }
      // console.log("skill percent ",skillPercent);

      // Check if user has scored more than passing_criteria in every subject
      const isPassed = Object.values(skillPercent).every(score => parseInt(score) > assessmentConfigData.passing_criteria);
      result = (isPassed && isPsychoPass) ? 'PASSED' : 'FAILED';
    }
    userResult[user] = result;
    userPercentile[user] = percentile;
  })
  return [userTotal, assessmentTotal, userPercentile, userResult];
}

const calculateAssessmentTotal = (assessmentConfig) => {
  let total = 0;
  console.log("skill distribution ",assessmentConfig.skill_distributions);
  // console.log("Assessment ID ",assessmentConfig.assessment_id);
  let skillDistribution = assessmentConfig.skill_distributions;
  // let skillDistribution = JSON.parse(assessmentConfig.skill_distributions);
  skillDistribution.forEach(ele => {
    // console.log("the element ", ele);
    // TODO: core skill ID value
    // if(ele.skill_id == 45) { // Core skill
    //   total += ele.no_of_questions;
    // }
    if(ele.skill_id == psychometric_skill_id) {// Psychometric 
      // total += (ele.no_of_questions*4);
    }
    else {
      total += ele.no_of_questions;
    }
  });

  return total;
}

let recursiveInventorySearch = async function (index, schoolInventory, type, blockType) {
  if(schoolInventory[index]) {
    let [err, inventory_blocks_response] = await to(inventory_blocks.count({
      where: { code: schoolInventory[index].code, status: "BLOCKED", inventory_type: blockType}
    }));
    if(schoolInventory[index][type] > inventory_blocks_response) {
      return index;
    } else {
      return -1;
    }
  }
};

// ************************************************** USER SIDE API **************************************************

const getUserAssessment = async function (req, res) {
  let err, assessmentData, assessmentQuestionData, userAssessmentData, screening_status, mains_status;
  console.log(req.user.id);
  if (req.params && req.params.assessment_id == undefined) {
    return ReE(res, { message: "Assessment id params is missing" }, 422);
  }
  try {
    [err, assessmentData] = await to(assessments.findOne({ 
      where: { id: req.params.assessment_id },
      include: [{
        model: user_assessments,
        where: { user_id: req.user.id },
        required: false
      }],
      nest: true,
      raw: true }));
    if (err) return ReE(res, err, 422);
    
    screening_status = (assessmentData.user_assessments && assessmentData.user_assessments.screening_status) ? assessmentData.user_assessments.screening_status : '';
    mains_status = (assessmentData.user_assessments && assessmentData.user_assessments.mains_status) ? assessmentData.user_assessments.mains_status : '';

    if (assessmentData != null) {

      console.log("teststet", assessmentData);

      [err, assessmentConfig] = await to(assessment_configurations.findOne({
        where: { assessment_id: assessmentData.id },
        raw: true
      }));

      let skill_distributions_id = assessmentConfig.skill_distributions ? assessmentConfig.skill_distributions.map(ele => { return ele.subject_ids == undefined ? ele.skill_id : null }).filter(e => e != null) : [];
      let subject_ids = [];
      if(assessmentConfig && assessmentConfig.skill_distributions) {
        assessmentConfig.skill_distributions.forEach(ele => { 
          if(ele.subject_ids) {
            subject_ids = [...subject_ids, ...ele.subject_ids.map(e => e.subject_id)];
          }
        })
      }


      [err, skillsData] = await to(skills.findAll({
        where: { id: { [Sequelize.Op.in] : skill_distributions_id} },
        attributes: ['name'],
        raw: true
      }));

      [err, subjectData] = await to(subjects.findAll({
        where: { id: { [Sequelize.Op.in]: subject_ids } },
        attributes: ['name'],
        raw: true
      }));


      [err, assessments_test] = await to(assessment_configurations.findAll({
        where: { assessment_id: assessmentData.id },
        include: [
          {
            model: levels,
            attributes: ['name'],
            require: false
          }
        ]
      }));

      [err, logAssessmentData] = await to(user_assessment_logs.findOne({
        where: { user_id: req.user.id, assessment_id: assessmentData.id },
        attributes: [ 'id', 'assessment_id', 'elapsed_time', 'assessment_type', 'answered_question']
      }));
      logAssessmentData = logAssessmentData || [];

      let finalOutput = {...assessmentData};
      finalOutput.skills = [...skillsData.map(ele => { return ele.name }), ...subjectData.map(ele => { return ele.name })];
      finalOutput.tests = assessments_test;
      finalOutput.assessment_log = logAssessmentData;

      if(finalOutput.user_assessments.type == 'SCREENING') {
        finalOutput.screening_status = finalOutput.user_assessments.status;
      }
      if(finalOutput.user_assessments.type == 'MAINS') {
        finalOutput.mains_status = finalOutput.user_assessments.status;
      }
     
      if(finalOutput.user_assessments && finalOutput.user_assessments.status) {
        finalOutput.status = finalOutput.user_assessments.status;
        finalOutput.type = finalOutput.user_assessments.type;
        delete finalOutput.user_assessments;
      } else {
        delete finalOutput.user_assessments;
      }

      if (err) return ReE(res, err, 422);
      return ReS(res, { data: finalOutput }, 200);
    } else {
      return ReE(res, "No assessment data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getUserAssessment = getUserAssessment;

const getAllUserAssessments = async function (req, res) {
  let err, assessmentsData;
  try {
    [err, assessmentsData] = await to(assessments.findAll({ attributes: [...custom_attributes.assessments.attributes] }));
    if (err) return ReE(res, err, 422);
    if (assessmentsData && assessmentsData.length > 0) {
      return ReS(res, { data: assessmentsData }, 200);
    } else {
      return ReE(res, "No assessments data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllUserAssessments = getAllUserAssessments;


const getAssessmentConfigurationUsers = async function (req, res) {
  let assessment_id  = req.params.assessment_id;
  let assessment_type  = req.params.assessment_type.toUpperCase();
  attributes = ['status', 'type', 'user_id', 'screening_result_notified', 'mains_result_notified'];

  try {
    [err, assessment_configurations_data] = await to(assessment_configurations.findOne({ 
      where: { assessment_id: assessment_id, assessment_type: assessment_type },
      include: [{
        model: user_assessments,
        where: { type: assessment_type },
        attributes: attributes,
        include: [{
          model: users
        }]
      }]
    }));
    if(assessment_configurations_data == null) {
      assessment_configurations_data = {}
    }
    let obj = {...assessment_configurations_data.get({plain: true})};
    obj.user_assessments = obj.user_assessments.map(ele => {
      return ele.user ? ele : null;
    }).filter(k => k != null);

    return ReS(res, { data: obj  }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
  

};
module.exports.getAssessmentConfigurationUsers = getAssessmentConfigurationUsers;
