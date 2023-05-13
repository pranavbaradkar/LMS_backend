const model = require('../../models');
const { assessments, assessment_questions, campaign_assessments, questions, question_options, custom_attributes, assessment_configurations, skills, levels, user_assessments, users, inventory_blocks, user_assessment_responses, subjects } = require("../../models");
const { to, ReE, ReS, requestQueryObject, lowercaseKeyValue } = require('../../services/util.service');
const validator = require('validator');
const mailer = require("../../helpers/mailer"); 
const fs = require("fs");
var moment = require("moment");
var ejs = require("ejs");
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
var _ = require('underscore');
const axios = require('axios');

assessment_questions.belongsTo(questions, { foreignKey: "question_id" });
questions.hasMany(question_options, { foreignKey: "question_id" });
questions.belongsTo(model.skills, { foreignKey: 'skill_id' });
questions.belongsTo(model.levels, { foreignKey: 'level_id' });
questions.belongsTo(model.subjects, { foreignKey: 'subject_id' });

assessments.belongsTo(campaign_assessments, { foreignKey: "id", targetKey: "assessment_id",  as: 'campaign_details' });

assessments.hasMany(user_assessments, { foreignKey: "assessment_id" });

assessment_configurations.belongsTo(levels, { foreignKey: 'level_id' });
assessment_configurations.hasMany(user_assessments, {  sourceKey: 'assessment_id', foreignKey: "assessment_id" });
user_assessments.belongsTo(users, { foreignKey: "user_id" });


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
      {limit: 1, difficulty_level: 'HARD'},
      {limit: 1, difficulty_level: 'VERY_HARD'}],
      mains: [{limit: 6, difficulty_level: 'EASY'},
      {limit: 6, difficulty_level: 'MEDIUM'},
      {limit: 6, difficulty_level: 'HARD'},
      {limit: 2, difficulty_level: 'VERY_HARD'}]
    };

    let distributionsOrg = JSON.parse(JSON.stringify(distributions));
    
    let skill_questions_data = [];
    let questionsD = {};
    skill_questions_data = skillQuestions.map(async ele => {
      let obj = {...ele};

      console.log(obj);

      let isSkillpsyhometry = [44, 46, 48];
      distributions[req.params.assessment_type][0].limit = distributionsOrg[req.params.assessment_type][0].limit
      if(isSkillpsyhometry.indexOf(ele.id) >= 0 ) {
        distributions[req.params.assessment_type][0].limit = 10;
      }
     
      let subjectObjO = skillSubjects[ele.id] ? skillSubjects[ele.id] : null;
      console.log("skillquestion", obj, subjectObjO);
      if(subjectObjO == null) {
        obj.questions = await Promise.all([
          await getQuestions(ele,distributions[req.params.assessment_type][0]),
          await getQuestions(ele,distributions[req.params.assessment_type][1]),
          await getQuestions(ele,distributions[req.params.assessment_type][2]),
          await getQuestions(ele,distributions[req.params.assessment_type][3])
        ]);
      } else {
        let question = [];
        let subjectLength = subjectObjO.length;
        let allQuery = [];
        distributions[req.params.assessment_type].forEach(dd => {
          
          let subj = getSubObj(dd, subjectObjO, subjectLength);
          console.log("=============", subj);
          allQuery = [...subj, ...allQuery];
        });
       
        let finalSubjectQuery = allQuery.filter(ddd => ddd.limit > 0);
        console.log(finalSubjectQuery);

        obj.questions = await Promise.all( 
          finalSubjectQuery.map(async fq => {
            return await getQuestions(ele,fq);
          })
        );
        // console.log(subjectObjO);

        // await getQuestions(ele,distributions[req.params.assessment_type][0]),
        // await getQuestions(ele,distributions[req.params.assessment_type][1]),
        // await getQuestions(ele,distributions[req.params.assessment_type][2]),
        // await getQuestions(ele,distributions[req.params.assessment_type][3])
      }
      
      return obj;
    });

    let question_ids = [];
    Promise.all(skill_questions_data).then(function(values) {
      assessment_configurations_data.skill_questions = values.map(ele => {
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
        obj.questions_count = questionList.length;
        if(questionList) {
          questionList.forEach(k => {
            question_ids.push(k.id);
          });
        }
        return obj; 
      });
      assessment_configurations_data.question_ids = question_ids;
      assessment_configurations_data.total_questions = question_ids.length;
      return ReS(res, { data: assessment_configurations_data  }, 200);
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

async function getQuestions(ele, k) {
  let err, questionsData;

  let where = { skill_id: ele.id , difficulty_level: k.difficulty_level };
  if(k.subject_id) {
    where.subject_id = k.subject_id;
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
    let isSkillpsyhometry = [44, 46, 48];
    if(questionsData.length == 0 && isSkillpsyhometry.indexOf(ele.id) == -1) {
      delete where.difficulty_level;
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
    }
    return questionsData;
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



const userAssessmentsResult = async function (req, res) {
  let err, assessmentsData;
  payload = req.body;

  if(req.params && (req.params.assessment_id == undefined)) {
    return ReE(res, { message: "Assessment and user id is required." }, 422);
  }

  let userAssessmentWhere = {}
  if(req.query && req.query.user_id) {
    userAssessmentWhere = { user_id: { [Op.in]: req.query.user_id.split(",") } }
  }

  let assessmentConfig = {};
  if(req.query && req.query.type) {
    assessmentConfig = { assessment_type: req.query.type.toUpperCase() };
  }
  
  [err, assessmentsData] = await to(assessments.findAll(
    {
      where: { id: req.params.assessment_id },
      include: [{
        model: assessment_configurations,
        where: assessmentConfig
      },
      {
        model: user_assessment_responses,
        where: userAssessmentWhere
      },
      {
        model: assessment_questions,
        include: [ { model: questions }]
      }]
    }
  ));

  // return ReS(res, { data: assessmentsData }, 200);

  // Compare assessment type questions to assessment type answer
  let questionType, assessmentType, correct_qa;
  let assessmentResult = assessmentsData.map(ele => {
    let obj = {...ele.get({plain: true})};
    if(obj.user_assessment_responses.length > 0) {
      let user_response = obj.user_assessment_responses[0].response_json;
      user_response = JSON.parse(user_response);
      
      obj.user_assessment_responses.map(uar => {
        // uar.assessment_configurations = obj.assessment_configurations.find(e => uar.type == e.assessment_type);
        // build questions by user answered assessment type
        let questions = ele.assessment_questions.filter(as => {
          return as.type == uar.type;
        }).map(q => {
          if(q.question) {
            questionType = q.question.question_type ? q.question.question_type : null ;
            correct_qa = q.question.correct_answer;
            if(questionType == 'MULTIPLE_CHOICE') { correct_qa = q.question.correct_answer.toLowerCase().split(','); }
            if(questionType == 'MATCH_THE_FOLLOWING') { 
              correct_qa = JSON.parse(q.question.correct_answer);
              correct_qa = lowercaseKeyValue(correct_qa);
            }
          }
          else { questionType = 'SINGLE_CHOICE'; correct_qa = null;}
          
          // questionType = (q.question && q.question.question_type) ? q.question.question_type : null ;
          // correct_qa = questionType == 'MULTIPLE_CHOICE' ? q.question.correct_answer.toLowerCase().split(',') : q.question.correct_answer;
          return {id: q.question_id, correct_answer: correct_qa, type: questionType };
        });
        let ob = {};
        let score = 0;
        console.log("question answer",questions);
        questions.forEach(qe => {
          ob[qe.id] = qe.correct_answer;
          if(qe.type == 'MULTIPLE_CHOICE'){
            user_response[qe.id].map( ans => { qe.correct_answer.includes(ans) ? score++ : ''; } );
          }
          else if(qe.type == 'MATCH_THE_FOLLOWING'){
            Object.keys(user_response[qe.id]).forEach(function(key, index) {
              if(lowercaseKeyValue(user_response[qe.id])[key] == qe.correct_answer[key]) { score++; }
            });
          }
          else {
            if(user_response[qe.id].toLowerCase() == qe.correct_answer.toLowerCase()) { score++; }
          }
        });
        uar.questionAnswer = ob;
        // console.log(JSON.parse(user_response));
        uar.score = score;
      });
      return obj;
    } else {
      return null
    }
    return obj;
  }).filter(e => e != null);

  // console.log(assessmentResult);
  // let data = assessmentResult.map(async ele => {
  //   return Promise.all(
  //     ele.user_assessment_responses.map(async k => {
  //     return await recursiveResultSend(k, req);
  //     })
  //   );
  // });


    assessmentResult.forEach(async ele => {
    
      ele.user_assessment_responses.map(async k => {
        let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/result/user_assessments/${req.query.type.toUpperCase()}`, k);
      });
    });
  return ReS(res, { data: assessmentResult }, 200);
}
module.exports.userAssessmentsResult = userAssessmentsResult


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
  let err, assessmentData, assessmentQuestionData;
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

      let finalOutput = {...assessmentData};
      finalOutput.skills = [...skillsData.map(ele => { return ele.name }), ...subjectData.map(ele => { return ele.name })];
      finalOutput.tests = assessments_test;


      if(finalOutput.user_assessments && finalOutput.user_assessments.screening_status) {
        finalOutput.screening_status = finalOutput.user_assessments.screening_status;
        finalOutput.mains_status = finalOutput.user_assessments.mains_status;
        delete finalOutput.user_assessments;
      } else {
        finalOutput.screening_status = "PENDING";
        finalOutput.mains_status = "PENDING";
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
  let attributes = ['screening_status', 'user_id', 'screening_result_notified', 'mains_result_notified'];
  if(assessment_type == 'screening') {
    attributes = ['mains_status', 'user_id', 'screening_result_notified', 'mains_result_notified'];
  }

  try {
    [err, assessment_configurations_data] = await to(assessment_configurations.findOne({ 
      where: { assessment_id: assessment_id, assessment_type: assessment_type },
      include: [{
        model: user_assessments,
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