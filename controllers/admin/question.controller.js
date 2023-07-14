const model = require('../../models');
const { question_views, psy_questions, psy_question_options,lo_banks, topics, strands, sub_strands, levels,grades,subjects, learning_objectives, questions, skills, question_options, question_mtf_answers, question_los } = require("../../models");
const { to, ReE, ReS, toSnakeCase,cleanLoText, requestQueryObject } = require("../../services/util.service");

const axios = require('axios');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const fs = require('fs');
const WordExtractor = require("word-extractor");
const excelReader = require('read-excel-file/node');
const path = require("path");
var _ = require('underscore');
const { result, where } = require('underscore');
const { serialize } = require('v8');
const PSYCHOMETRIC_SKILL_ID = process.env.PSYCHOMETRIC_SKILL_ID || 48;

questions.belongsTo(model.skills, { foreignKey: 'skill_id' });
questions.belongsTo(model.levels, { foreignKey: 'level_id' });
questions.belongsTo(model.subjects, { foreignKey: 'subject_id' });
questions.hasMany(question_options, { foreignKey: 'question_id', as: "questionOptions" });
questions.hasMany(question_mtf_answers, { foreignKey: 'question_id'});

question_views.belongsTo(model.skills, { foreignKey: 'skill_id' });
question_views.belongsTo(model.levels, { foreignKey: 'level_id' });
question_views.belongsTo(model.subjects, { foreignKey: 'subject_id' });
question_views.hasMany(question_options, { foreignKey: 'question_id', as: "questionOptions" });
question_views.hasMany(psy_question_options, { foreignKey: 'psy_question_id', sourceKey:'id' });
question_views.hasMany(question_mtf_answers, { foreignKey: 'question_id'});


const createQuestion = async function (req, res) {
  let err, loData, questionData, skillData, questionOptionData, questionLoData;
  let payloadBody = req.body;
  let payload = {};
  for (const val in payloadBody) {
    payload[val] = payloadBody[val];
  }
  if (!payload.statement) {
    return ReE(res, "Statement is required.", 422);
  } else if (!payload.hint) {
    return ReE(res, "hint is required.", 422);
  } else if (!payload.answer_explanation) {
    return ReE(res, "Answer explanation is required.", 422);
  } else if (!payload.correct_answer && !payload.is_psychometric) {
    return ReE(res, "Correct answer is required.", 422);
  } else if (!payload.question_options) {
    return ReE(res, "Options is required.", 422);
  }
  try {
    [err, skillData] = await to(skills.findOne({ where: { id: payload.skill_id } }));
    if (err) return ReE(res, err, 422);
    if (skillData !== null) {
      
      if(!payload.is_psychometric) {
        payload.lo_ids = payload.lo_ids.join(",");
        [err, questionData] = await to(questions.create(payload));
      } else {
        payload.lo_ids = payload.lo_ids.join(",");
        payload.correct_answer = '0';
        payload.score_type = 1;
        [err, questionData] = await to(psy_questions.create(payload));
      }
      if (err) return ReE(res, err, 422);

      if(!payload.is_psychometric) {
        let metaObject = payload.question_options.map(ele => {
          return {
            question_id: questionData.id,
            option_key: ele.option_key,
            option_value: ele.option_value,
            option_type: ele.option_type,
            is_correct: ele.is_correct ? ele.is_correct : false,
            correct_answer: ele.correct_answer ? ele.correct_answer : null
          }
        });
        [err, questionOptionData] = await to(question_options.bulkCreate(metaObject));

        if(payload.question_mtf_answers) {
          let answerMetaObject = payload.question_mtf_answers.map(ele => {
            return {
              question_id: questionData.id,
              answer_key: ele.answer_key,
              answer_value: ele.answer_value,
              answer_type: ele.answer_type
            }
          });
          [err, questionOptionResponse] = await to(question_mtf_answers.bulkCreate(answerMetaObject));
        }
      } else if(payload.is_psychometric) {
        let metaObject = payload.question_options.map(ele => {
          return {
            psy_question_id: questionData.id,
            option_key: ele.option_key,
            option_value: ele.option_value,
            option_type: ele.option_type,
            score_value: ele.score_value != '' && ele.score_value != null ? parseInt(ele.score_value) : 0 ,
          }
        });
        [err, questionOptionData] = await to(psy_question_options.bulkCreate(metaObject));
      }
      

      if (err) return ReE(res, err, 422);
      let questionLoDataObject = [];
      let questionLoData = [];
      if(payload.lo_ids && payload.lo_ids.length > 0) {
        questionLoDataObject = payload.lo_ids.map(ele => {
          return {
            question_id: questionData.id,
            lo_id: ele,
          }
        });
        // console.log(questionLoDataObject);
        // return false;
        [err, questionLoData] = await to(question_los.bulkCreate(questionLoDataObject));
        if (err) return ReE(res, err, 422);
      }
     
      
      return ReS(res, { data: questionData, question_options: questionOptionData, lo: questionLoDataObject }, 200);
    } else {
      return ReE(res, "Skill not found with this id", 404);
    }
  } catch (err) {
    // console.log(err);
    return ReE(res, err, 422);
  }
}
module.exports.createQuestion = createQuestion

const getAllQuestions = async function (req, res) {
  let err, questionData;

  let orData = [];
  let queryParams = {};
  if(req.query && req.query.filter) {
    Object.keys(req.query.filter).forEach(ele => {
      if(req.query.filter[ele] != '' &&  req.query.filter[ele] && req.query.filter[ele].split(',').length == 1) {
        queryParams[ele] = req.query.filter[ele];
      } else if(req.query.filter[ele] != '') {
        queryParams[ele] = { [Op.in]: req.query.filter[ele].split(',') }
      }
    })
  }
  
  let searchArray = ['statement', 'answer_explanation', 'hint'];
  let whereIncludeSearch = {}
  if(req.query && req.query.search) {
    searchArray.forEach(ele => {
      let obj = {};
      obj[ele] = { [Op.iLike]: `%${req.query.search}%`};
      orData.push(obj);
    })

    // whereIncludeSearch = { name: { [Op.like]: `%${req.query.search}%`} };
  }
  
  if(orData.length > 0) {
    queryParams = {...queryParams,...{[Op.or]: orData}}
  } else {
    queryParams = {...queryParams }
  }


  let paginateData = {...requestQueryObject(req.query, queryParams)};
  console.log("testest", paginateData);
  paginateData.order = [['updated_at','DESC']];

  let questionInclude = [
    { model: model.skills, attributes: ['name'], require: false,
    where: whereIncludeSearch },
    { model: question_options, as: "questionOptions", require: false },
    { model: psy_question_options, require: false },
    { model: question_mtf_answers, require: false }
  ];
  if(Object.keys(whereIncludeSearch).length > 0) {
    questionInclude = [...questionInclude, ...[
      { model: model.levels, attributes: ['name'], require: false,
      where: whereIncludeSearch },
      { model: model.subjects, attributes: ['name'], require: false,
        where: whereIncludeSearch
      }
    ]]
  }

  try {
    [err, questionData] = await to(question_views.findAndCountAll({...paginateData, ...{
      include: questionInclude,
      distinct: true
    }
    }
    ));
    if(!questionData) return ReE(res, "No questions data found", 404);
    
    if (questionData) {
      questionData.rows = questionData.rows.map(ele => {
        let obj = {...ele.get({plain: true})};
        obj.question_options = (obj.questionOptions && obj.questionOptions.length > 0) ? _.sortBy(obj.questionOptions, 'option_key') : _.sortBy(obj.psy_question_options, 'option_key');
        obj.question_mtf_answers = _.sortBy(obj.question_mtf_answers, 'option_key');
        delete obj.questionOptions;
        delete obj.psy_question_options;
        return obj;
      })
    }

    return ReS(res, { data: questionData }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllQuestions = getAllQuestions;

const getQuestion = async function (req, res) {
  let err, questionData;

  if (req.params && req.params.question_id == undefined) {
    return ReE(res, { message: "question id params is missing" }, 422);
  }
  try {
    [err, questionData] = await to(questions.findOne({
      where: { id: req.params.question_id },
      include: [
        { model: model.skills, attributes: ['name'] },
        { model: model.levels, attributes: ['name'] },
        { model: model.subjects, attributes: ['name'] },
        { model: question_options },
        { model: question_mtf_answers }
      ],
      order: [[ question_options, 'id', 'asc' ]], 
    }));
    if (err) return ReE(res, err, 422);
    if (questionData !== null) {
      return ReS(res, { data: questionData }, 200);
    } else {
      return ReE(res, "No question data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getQuestion = getQuestion;

const updateQuestion = async function (req, res) {
  let err, questionData, questionLoDataDelete, questionLoData = [];
  let payload = req.body;
  if (req.params && req.params.question_id == undefined) {
    return ReE(res, { message: "Question id params is missing" }, 422);
  }
  try {
    if(!payload.is_psychometric) {
      [err, questionData] = await to(questions.findOne({ where: { id: req.params.question_id } }));
    }
    if(payload.is_psychometric) {
      [err, questionData] = await to(psy_questions.findOne({ where: { id: req.params.question_id } }));
    }
    if (err) return ReE(res, err, 422);
    if (questionData == null) {
      return ReE(res, "No question data found", 404);
    } else {

      if(payload.lo_ids) {
        let questionLoDataObject = payload.lo_ids.map(ele => {
          return {
            question_id: questionData.id,
            lo_id: ele,
          }
        });
       
        [err, questionLoDataDelete] = await to(question_los.destroy({
          where : {
            lo_id: {
              [Op.in]: payload.lo_ids,
            },
          }
        }));
        if (err) return ReE(res, err, 422);
        [err, questionLoData] = await to(question_los.bulkCreate(questionLoDataObject));
        if (err) return ReE(res, err, 422);
      }
      if(payload.lo_ids) {
        delete payload.lo_ids;
      }

      if(!payload.is_psychometric) {
        [err, questionData] = await to(questions.update(payload, { where: { id: req.params.question_id } }));
      }

      if(payload.is_psychometric) {
        payload.correct_answer = '0';
        payload.score_type = 1;
        [err, questionData] = await to(psy_questions.update(payload, { where: { id: req.params.question_id } }));
      }

      if(payload.question_options && payload.question_options.length > 0 && !payload.is_psychometric) {
        await to(question_options.destroy({where: {question_id: req.params.question_id}, force: true }));
        let optionsUpdate = []
        payload.question_options.forEach(async element => {
          let obj = {
            question_id: req.params.question_id,
            option_key: element.option_key,
            option_value: element.option_value,
            option_type: element.option_type,
            is_correct: element.is_correct ? element.is_correct : false,
            correct_answer: element.correct_answer ? element.correct_answer : null
          }
          optionsUpdate.push(obj);
        });
        await to(question_options.bulkCreate(optionsUpdate));
      }

      if(payload.question_options && payload.question_options.length > 0 && payload.is_psychometric) {
        await to(psy_question_options.destroy({where: {psy_question_id: req.params.question_id}, force: true }));
        let optionsUpdate = []
        payload.question_options.forEach(async element => {
          let obj = {
            psy_question_id: req.params.question_id,
            option_key: element.option_key,
            option_value: element.option_value,
            option_type: element.option_type,
            score_value: element.score_value != '' && element.score_value != null ? parseInt(element.score_value) : 0 ,
          }
          optionsUpdate.push(obj);
        });
        await to(psy_question_options.bulkCreate(optionsUpdate));
      }

      if(payload.question_mtf_answers && payload.question_mtf_answers.length > 0) {
        await to(question_mtf_answers.destroy({where: {question_id: req.params.question_id}, force: true }));
        let optionsUpdate = []
        payload.question_mtf_answers.forEach(async element => {
          let obj = {
            question_id: req.params.question_id,
            answer_key: element.answer_key,
            answer_value: element.answer_value,
            answer_type: element.answer_type
          }
          optionsUpdate.push(obj);
        });
        await to(question_mtf_answers.bulkCreate(optionsUpdate));
      }

      if (err) return ReE(res, err, 422);
      return ReS(res, { data: questionData, questionLoData}, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateQuestion = updateQuestion;

const deleteQuestion = async function (req, res) {
  let err, questionData;
  if (req.params && req.params.question_id == undefined) {
    return ReE(res, { message: "Id params is missing" }, 422);
  }
  try {
    [err, questionData] = await to(questions.findOne({ where: { id: req.params.question_id } }));
    if (err) return ReE(res, err, 422);
    if (questionData == null) {
      return ReE(res, "No question data found", 404);
    } else {
      questionData.destroy();
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "Question deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteQuestion = deleteQuestion;

const deleteBulkQuestion = async function (req, res) {
  let err;
  if(req.query && req.query.ids == undefined) {
    return ReE(res, {message: "IDs is required for delete operations"}, 422);
  }
  try {
    [err, response] = await to(questions.destroy({where: { id: {[Op.in] : req.query.ids.split(',')} } }));
    [err, response1] = await to(question_options.destroy({where: { question_id: {[Op.in] : req.query.ids.split(',')} } }));
    [err, response2] = await to(question_mtf_answers.destroy({where: { question_id: {[Op.in] : req.query.ids.split(',')} } }));
    
    if (err) return ReE(res, err, 422);
    return ReS(res, { data: "Questions deleted successfully." }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteBulkQuestion = deleteBulkQuestion;

const getFilterQuestion = async function (req, res) {
  let err, questionData;
  if (req.params && req.params.type == undefined) {
    return ReE(res, { message: "type params is missing" }, 422);
  }
  try {
    [err, questionData] = await to(questions.findAll({}));
    if (err) return ReE(res, err, 422);
    if (questionData && questionData.length > 0) {
      return ReS(res, { data: questionData }, 200);
    } else {
      return ReE(res, "No questions data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getFilterQuestion = getFilterQuestion;

const questionImport = async function (req, res) {
  try {
    const extractor = new WordExtractor();
    const extracted = extractor.extract(path.join(__dirname +  `/../../public/assets/${req.body.file_name}`));
    extracted.then(async function(doc) { 
        //console.log("test..................", doc.getBody());
        const lines = doc.getBody().split('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        let rawJson = {};
        let jsonPayloadMain = [];
        lines.forEach(function(line) {
          const single_data = line.split('\n');
          let optionJson = {};
          let optionMain = [];
          let explanation = false;
          let isQuestionNotConsider = false;
          single_data.forEach(function(single_line) {
            if (single_line.match(/TYPE:/i)) {
              isQuestionNotConsider = true;
            }
            if(isQuestionNotConsider) {
              return false;
            }
            if (single_line.match(/Question:/i)) {
              rawJson.statement = single_line.replace("Question: ",'').trim();
            }
           
            if (single_line.match(/Q\d+\)/)) {
              const pattern = /Q\d+\)\s/;
              rawJson.statement = single_line.trim().replace(pattern,"");
            }

            if (single_line.match(/Correct Answer:/i)) {
              rawJson.correct_answer = single_line.replace("Correct Answer: ",'').replace(".",'').replace("Option (",'').replace(")",'').trim().toUpperCase().replace("CORRECT ANSWER: ", "");
            }

            rawJson.correct_answer_score = 1;
            rawJson.estimated_time = 30;
            rawJson.hint = "N/A";
            rawJson.blooms_taxonomy = 'REMEMBER';
            rawJson.question_type = "SINGLE_CHOICE",
            rawJson.knowledge_level = "NICE_TO_KNOW";
            rawJson.complexity_level = "P1";
            rawJson.skill_id = req.body.skill_id;
            rawJson.level_id = req.body.level_id;
            
            if(req.body && req.body.subject_id) {
              rawJson.subject_id = req.body.subject_id;
            }
            
            if (single_line.match(/Explanation:/i)) {
              explanation = true;
              rawJson.answer_explanation = single_line.replace("Explanation: ",'');
            } else {
              if(single_line.match(/Difficulty Level/i) || single_line.match(/DIFFICULTY_LEVEL/i) || single_line.match(/Difficulty level/i) || single_line.match(/Difficult Level/i) || single_line.match(/Bloom's Taxonomy/i)) {
                
              } else {
                rawJson.answer_explanation = rawJson.answer_explanation + single_line;
              }
            }
            
            if (single_line.match(/Difficulty Level/i)) {
              explanation = false;
              let levelHard = single_line.replace("Difficulty Level- ",'').replace("Difficulty Level",'').replace(".",'').replace("-",'').replace(":",'').toUpperCase().trim().split(' ').join('_');
              console.log(levelHard.replace("DIFFICULTY_LEVEL_", ""));
              rawJson.difficulty_level = levelHard.replace("DIFFICULTY_LEVEL_", "");
              
            } else if (single_line.match(/DIFFICULTY_LEVEL/i)) {
              explanation = false;
              console.log("2",single_line);
              rawJson.difficulty_level = single_line.replace("DIFFICULTY_LEVEL_",'').replace(".",'').replace("-",'').toUpperCase().trim().replace(/_/g, ' ').split(' ').join('_');
             
            } else if (single_line.match(/Difficulty level/i)) {
              explanation = false;
              console.log("3",single_line);
              rawJson.difficulty_level = single_line.replace("Difficulty level- ",'').replace(".",'').replace("-",'').toUpperCase().trim().replace(/_/g, ' ').split(' ').join('_');
            } else if (single_line.match(/Difficult Level/i)) {
              explanation = false;
              console.log("3",single_line);
              rawJson.difficulty_level = single_line.replace("Difficult Level - ",'').replace(".",'').replace("-",'').toUpperCase().trim().replace(/_/g, ' ').split(' ').join('_');
            }
            
            if (!explanation && single_line.match(/a\) /i) && !single_line.match(/\(a\) /i)){
              optionJson.option_key = 'A';
              optionJson.option_value = single_line.replace("a) ",'').trim();
              optionJson.option_type = 'TEXT';
              optionMain.push({...optionJson});
            }
            if (!explanation && single_line.match(/b\) /i) && !single_line.match(/\(b\) /i)){
              optionJson.option_key = 'B';
              optionJson.option_value = single_line.replace("b) ",'').trim();
              optionJson.option_type = 'TEXT';
              optionMain.push({...optionJson});
            }
            if (!explanation && single_line.match(/c\) /i) && !single_line.match(/\(c\) /i) ){
              optionJson.option_key = 'C';
              optionJson.option_value = single_line.replace("c) ",'').trim();
              optionJson.option_type = 'TEXT';
              optionMain.push({...optionJson});
            }
            if (!explanation && single_line.match(/d\) /i) && !single_line.match(/\(d\) /i)){
              optionJson.option_key = 'D';
              optionJson.option_value = single_line.replace("d) ",'').trim();
              optionJson.option_type = 'TEXT';
              optionMain.push({...optionJson});
            }
          
            rawJson.question_options = optionMain;
          });

          if(rawJson.question_options.length > 0) {
            jsonPayloadMain.push({...rawJson});
          }
        });
        // console.log("test.............", JSON.stringify(jsonPayloadMain,null, 4))
        

        let morethan4 = jsonPayloadMain.map(ele => {
          return ele.question_options.length > 4 ? ele : null;
        }).filter(ele => ele != null);
        let lessthan4 = jsonPayloadMain.map(ele => {
          return ele.question_options.length < 4 ? ele : null;
        }).filter(ele => ele != null);

        let notConsiderContent = jsonPayloadMain.map(ele => {
          return ele.question_options.length < 4 || ele.question_options.length > 4 ? ele : null;
        }).filter(ele => ele != null);;

        let finalReviewData = jsonPayloadMain.map(ele => {
          return ele.question_options.length == 4 ? ele : null;
        }).filter(ele => ele != null);


        if(notConsiderContent.length > 0) {
          let string = "";
          notConsiderContent.forEach((element, index) => {
            string = string +  `Q${index+1}) ${element.statement}\n`;
          });
          fs.writeFile(path.join(__dirname +  `/../../public/assets/issues-${req.body.file_name}`), string, (err) => { if (err) throw err; });
        }

        if(req.query && req.query.dump) {
          let promise = [];
          finalReviewData.forEach( async (element) => {
            let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/bypass/questions`, element);
            promise.push(request)
          });
        }
        
        return ReS(res, {data: {lessthan4: lessthan4, notConsiderContent: notConsiderContent.length, lessthan4Count: lessthan4.length, morethan4Count: morethan4.length, morethan4: morethan4, count: finalReviewData.length, rows: finalReviewData}}, 200);
    });
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.questionImport = questionImport;

// TODO: find level grade subject from db
// TODO: media upload
const loBankImport = async function(req, res) {

  let excelObj = await excelReader(path.join(__dirname +  `/../../public/assets/${req.body.file_name}`));

  if(req.body.debug) 
  {
    let preTest = await testExcelFile(req, res, excelObj);
    return ReS(res, {test_result: preTest}, 200);
  }

  let responseB = await addToLoBank(req, res, excelObj);
  let responseQ = await addToLoQuestion(req, res, excelObj, responseB);

  resData = {};
  if(responseB && responseB.lo_bank[2] && responseB.lo_bank[2][2]) {
    resData.lo_bank = "inserted to Lo_bank";
  }
  if(responseQ && responseQ.questions && responseQ.questions[2]) {
    resData.questions = "inserted to Questions Table ";
  }

  return ReS(res, { data: resData }, 200);
};
module.exports.loBankImport = loBankImport;

const testExcelFile = async (req, res, excelObj, dataReturn) => {
  let qTypeMap = { "SCQ": 'SINGLE_CHOICE', "MCQ": 'MULTIPLE_CHOICE', "FIB": 'FILL_IN_THE_BLANKS', "TF": 'TRUE_FALSE', "MTF":'MATCH_THE_FOLLOWING' };
  if(dataReturn == 'question_type_map') { return qTypeMap;}

  let preTestLog = [];
  
  let level_id = 0;
  [err, levelData] = await to(levels.findOne({ where: {name: req.body.level_name }}));
  if(levelData) { level_id = levelData.id; preTestLog.push(`Level data Found with ID ${level_id}`);}
  else { preTestLog.push("ERROR: Level Data not found, Check the name of level field.") }
  
  let grade_id = 0;
  [err, gradeData] = await to(grades.findOne({ where: {name: req.body.grade_name }}));
  if(gradeData) { grade_id = gradeData.id; preTestLog.push(`Grade data Found with ID ${grade_id}`);}
  else { preTestLog.push("ERROR: Grade Data not found, Check the name of grade field.") }
  
  let subject_id = 0;
  [err, subjectData] = await to(subjects.findOne({ where: {name: req.body.subject_name }}));
  if(subjectData) { subject_id = subjectData.id; preTestLog.push(`subject data Found with ID ${subject_id}`);}
  else { preTestLog.push("ERROR: subject Data not found, Check the name of subject field.") }
  
  let skill_id = 0;
  [err, skillData] = await to(skills.findOne({ where: {name: req.body.skill_name }}));
  if(skillData) { skill_id = skillData.id; preTestLog.push(`skill data Found with ID ${skill_id}`);}
  else { preTestLog.push("ERROR: skill Data not found, Check the name of skill field.") }

  let expectedColumnOrder = ['NEP Category', 'Level/Grade', 'Pillar', "Subject","strand","substrand","Topic","LO1","LO2","LO3","LO4","LO5","Question Type","Question Statement","Media Type ","Media Link", "Option A", " Option B", "Option C", "Option D","Correct Answer","Answer Explanation","Blooms Tag","Difficulty Level Tag","Complexity Level Tag", "Review- Global comment", "Review- Specific Comment", "Review- Status"];
  
  excelMapX = ['A','B','C','D','E', 'F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  
  let excelColumnOrder = excelObj[0] ;
  let columnPair = [['Expected ', 'Excel Columns']];
  let questionType = {};
  excelColumnOrder.forEach((element, i) => {
    columnPair.push([expectedColumnOrder[i], excelColumnOrder[i]]);
  });
  let impColumns = [4,5,6,12,13,16,17,18,19,20,21,22,23,24];
  excelObj.forEach((row,ri) => {
    if(ri>0){
      ri++;
      if(!qTypeMap[row[12]]) { preTestLog.push(`ERROR: row no (${ri}) wrong question type found: ${row[12]}`); }
      row.forEach((cell, ci) => {
        if(impColumns.includes(ci) && !row[ci]) { preTestLog.push(`Empty value at ${expectedColumnOrder[ci]} ${ri} for ${row[12]} `); }
       });
    }
  })
  
    
  if(excelColumnOrder.length !== expectedColumnOrder.length) { 
    preTestLog.push('No of columns differ for excel. We expect ('+expectedColumnOrder.length+') columns ')
  }
  else { preTestLog.push("No of columns Match"); }

  return { log: preTestLog, data: [ questionType, columnPair] };
}


const addToLoBank = async (req, res, excelObj) => {
  let err, strandsData, subStrandsData, loBankData;  
  let level_id = req.body.level_id;
  let grade_id = req.body.grade_id;
  let subject_id = req.body.subject_id;
  let skill_id = req.body.skill_id;
  let log = [];

  excelMapxX = ['A','B','C','D','E', 'F','G','H','I','J','K','L','M'];
  let bsubjects = {};
  let bstrands = {};
  let bstrands_text = "";
  let bsub_strands = {};
  let bsub_strands_text = "";
  let btopics = {};

  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0) {

      bstrands_name = single_row[4] ? single_row[4].replace(/ /g, "_").toLowerCase() : '';
      if(bstrands_name) {
      strands_text = single_row[4];
      bstrands[bstrands_name] = {};
      bstrands[bstrands_name].strand_text = strands_text;
    }
      // bsubjects[subject_name].strands = bstrands;

      bsub_strands_name = single_row[5] ? single_row[5].replace(/ /g, "_").toLowerCase() : null;
      if(bsub_strands_name) {
        bsub_strands_text = single_row[5];
        bsub_strands[bsub_strands_name] = {};
        bsub_strands[bsub_strands_name].sub_strand_text = bsub_strands_text;
      }
      // btopics_name = single_row[6] ? single_row[6].replace(/ /g, "_").toLowerCase() : '';
      // btopics_text = single_row[6];
      // btopics[btopics_name] = {};
      // btopics[btopics_name].topic_text = btopics_text;
    }
  }); // end foreach 

  // console.log(">>>>>>>>>>>>>>> unique Strands obj",bstrands);
  
  let bulkStrandPayload=[];
  Object.keys(bstrands).forEach(ind => {
    bulkStrandPayload.push({strand_text: bstrands[ind].strand_text, level_id: level_id, grade_id: grade_id, subject_id: subject_id });
  })
  console.log(">>>>>>>>>>>>>>> bulk Strand Payload",bulkStrandPayload[(bulkStrandPayload.length-1)]);
  
  //do no insert for Hindi language
  if(req.body.language == "hindi") { bulkStrandPayload = []; }

  // insert strands
  [err, strandsData] = await to(strands.bulkCreate(bulkStrandPayload));
  if(err) { return ReE(res,{where: 'Strands Insert ', error: err}, 422); }
  let strandsMap = {"":-1};
  if(strandsData) {
  strandsData.map(row => {
    let obj = {...row.get({plain: true})};
    let strand_text = obj.strand_text.replace(/ /g, "_").toLowerCase();
    strandsMap[strand_text] = obj.id;
    return obj;
  });
  }
  else {
    log.push("Stand insert failed");
  }
  
  // console.log(">>>>>>>>>>>>>>> the strand Map  ",strandsMap);

  // console.log("<<<<<<<<<<<<<<< Unique Sub-Strands obj ",bsub_strands);
  let bulkSubStrandPayload=[];

  let uniqueSubStrand = {};
  let uniqueLo = {};
  let uniqueTopics = {};
  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0 && single_row[5]) {
      bstrand_text = single_row[4].replace(/ /g, "_").toLowerCase();
      bsub_strands_text = single_row[5].replace(/ /g, "_").toLowerCase();
      uniqueSubStrand[bsub_strands_text] = {};
      uniqueSubStrand[bsub_strands_text].text = single_row[5];
      uniqueSubStrand[bsub_strands_text].strand_id = strandsMap[bstrand_text];
    }
    if (row_no > 0) {
      // populate unique lo here
      for(i=7;i<12;i++) {
        if(single_row[i] && single_row[i]!="") {
          let uniqueKey = single_row[i].replace(/[^\u0900-\u097Fa-zA-Z0-9]/g,'').toLowerCase();
          uniqueLo[uniqueKey] = { lo_text: cleanLoText(single_row[i]) };
        }
      }
    }
  });
  // console.log("bulk payload for sub strand uniq ", uniqueSubStrand);

   Object.keys(uniqueSubStrand).forEach(ind => {
    // console.log("the uniqe Subsstrand ", ind, uniqueSubStrand[ind]);
      bulkSubStrandPayload.push({ sub_strand_text :uniqueSubStrand[ind].text, strand_id: uniqueSubStrand[ind].strand_id });
  })

  // return false;
  // bulkSubStrandPayload
  console.log("bulk payload for sub strand ", bulkSubStrandPayload[(bulkSubStrandPayload.length-1)]);
  
  //do no insert for Hindi language
  if(req.body.language == "hindi") { bulkSubStrandPayload = []; }

  // insert sub_strands
  [err, subStrandsData] = await to(sub_strands.bulkCreate(bulkSubStrandPayload));
  if(err) { return ReE(res, {where: 'Sub Strand Insert Error:', error: err}, 422); }

  let subStrandsMap = {"":-1};
    if(subStrandsData) { 
      subStrandsData.map(row => {
      let obj = {...row.get({plain: true})};
      let sub_strand_text = obj.sub_strand_text.replace(/ /g, "_").toLowerCase();
      subStrandsMap[sub_strand_text] = obj.id;
      return obj;
    });
  }  
  else { log.push("Sub Strand Insert failed"); }

  // console.log("<<<<<<<<<<<<<<< the Sub Strand obj Map ",subStrandsMap);

  loBankPayload = [];
  Object.keys(uniqueLo).forEach(loc=>{
    loBankPayload.push({
      lo_text: uniqueLo[loc].lo_text,
      level_id: level_id,
      grade_id: grade_id,
      subject_id: subject_id,
      skill_id : skill_id
    });
  })
  // console.log("the unique los ", uniqueLo);
  console.log("last payload for Lo Bank ", loBankPayload[(loBankPayload.length-1)]);
  
  // insert lo's to db
  let loMapData = {};
  [err, loBankData] = await to(lo_banks.bulkCreate(loBankPayload));
  if(err) { return ReE(res, err, 422); }
  if(!loBankData) { log.push("Inser to Lo Bank Failed"); }
  else {
    loBankData.map(row => {
      let obj = {...row.get({plain: true})};
      let lo_text = obj.lo_text.replace(/[^\u0900-\u097Fa-zA-Z0-9]/g,'').toLowerCase();
      loMapData[lo_text] = obj.id;
      return obj;
    });
  }
  // console.log("lo map data", loMapData);

  bulkTopicsPayload = [];
  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0 && single_row[0]) {
      // adding lo_id to topics
      let topicLos = [];
       for(lc=7;lc<12;lc++) {
         if(single_row[lc]) {
           let lo_code = single_row[lc].replace(/[^\u0900-\u097Fa-zA-Z0-9]/g,'').toLowerCase();
            topicLos.push(loMapData[lo_code]);
          }
        }
      bstrands_text = single_row[4] ? single_row[4].replace(/ /g, "_").toLowerCase() : '';
      bsub_strands_text = single_row[5] ? single_row[5].replace(/ /g, "_").toLowerCase() : '';
      // console.log("excel topic text line no ",row_no, single_row);
      // console.log("~~~~~~~~~~~~~~~~~sub strand map key ", bsub_strands_text);

      // populate unisqu topics here
      let topicCode = single_row[6].replace(/[^\u0900-\u097Fa-zA-Z0-9]/g,'').toLowerCase();
      topicCode += bstrands_text;
      topicCode += bsub_strands_text;
      topicCode += topicLos.join("_");
      // console.log("=================>>>>>>>>>>>>>>>>hindi code ",topicCode);
      
      //do no insert for Hindi language
      if(req.body.language == "hindi") { bstrands_text = ""; bsub_strands_text = ""; }

      uniqueTopics[topicCode] = {
        topic_text  : single_row[6],
        lo_id       : topicLos.join(","),
        level_id    : level_id,
        grade_id    : grade_id,
        subject_id  : subject_id,
        skill_id    : skill_id,
        strand_id   : strandsMap[bstrands_text],
        sub_strand_id : subStrandsMap[bsub_strands_text]
        }
    }
  });

  // create topics payload
  Object.keys(uniqueTopics).forEach((code) => {
    bulkTopicsPayload.push(uniqueTopics[code]);
  });

  // reduce further to concatenate lo_ids
  const reducedTopicPayload = Object.values(bulkTopicsPayload.reduce((accumulator, current) => {
    if (!accumulator[current.topic_text]) {
      accumulator[current.topic_text] = {
        topic_text  : current.topic_text,
        lo_id       : current.lo_id,
        level_id    : current.level_id,
        grade_id    : current.grade_id,
        subject_id  : current.subject_id,
        skill_id    : current.skill_id,
        strand_id   : current.strand_id,
        sub_strand_id : current.sub_strand_id
      };
    } else {
      accumulator[current.topic_text].lo_id += `,${current.lo_id}`;
    }
    return accumulator;
  }, {}));

  // console.log("================ bulk payload for topic ", bulkTopicsPayload);
  // console.log("================ooooooooooooo bulk payload for reduced topic ", reducedArray);
  // console.log("================ last bulk payload for topic ", bulkTopicsPayload[(bulkTopicsPayload.length-1)]);
  
  
  // insert topics
  [err, topicData] = await to(topics.bulkCreate(reducedTopicPayload));
  if(err) { return ReE(res, err, 422); }
  let topicsMap = {};
  if(topicData) {
    topicData.map(row => {
      let obj = {...row.get({plain: true})};
      let topic_text = obj.topic_text.replace(/ /g, "_").toLowerCase();
      topicsMap[topic_text] = obj.id;
      return obj;
    });
  }
  else { log.push('Topics insert failed'); }
    
  // console.log(">>>>>>>>>>>>>>>>> the topics obj with ID ",topicsMap);

  return {
    log: log,
    strand: [strandsMap, bulkStrandPayload],
    sub_strand: [subStrandsMap, uniqueSubStrand,bulkSubStrandPayload],
    topics: [topicsMap, bulkTopicsPayload],
    lo_bank: [loMapData, uniqueLo, loBankPayload, loBankData]
  };

}

const addToLoQuestion = async (req, res, excelObj, loBankData) => {
  let err, strandsData, subStrandsData; 
  let loBankMapData     = loBankData.lo_bank[0];
  let strandMapData     = loBankData.strand[0];
  let subStrandMapData  = loBankData.sub_strand[0];
  let topicMapData      = loBankData.topics[0];
  let strands_code      = '';
  let sub_strand_code  = '';
  let topic_code        = '';

  let level_id    = req.body.level_id;
  let grade_id    = req.body.grade_id;
  let subject_id  = req.body.subject_id;
  let skill_id    = req.body.skill_id;     

  let questionData;
  let questionPayload =[];
  let qTypeMap = { "SCQ": 'SINGLE_CHOICE', "MCQ": 'MULTIPLE_CHOICE', "FIB": 'FILL_IN_THE_BLANKS', "TF": 'TRUE_FALSE', "MTF":'MATCH_THE_FOLLOWING' };
  // console.log("maps of question type", qTypeMap);
  
  excelObj.forEach((row, row_no) => {
    if(!row[0]) { return; }
    if (row_no > 0) {
      let qOptions = [];

      // console.log("processing question insert on line ",row_no);
      // console.log("single row (correct_ans",row[20],") (difficulty", row[23], ") [COMPLEXITY LEVEL:", row[24],"]");
      let correct_answer = String(row[20]).replace(/\b(?:both)\b/ig,'').replace(/\b(?:option)\b/ig,'').replace(/[^a-zA-Z0-9,]/g,',').split(",").filter(e=> e!=='').join(",");
      let correctAnsArray = [];
      let loopLimit = 69;
      // type is mcq
      isMultipleType = qTypeMap[row[12]]=='MULTIPLE_CHOICE';
      isTrueFalseType = qTypeMap[row[12]]=='TRUE_FALSE';
      if(isMultipleType) {
        correctAnsArray = correct_answer.replace(/\b(?:both)\b/ig,'').replace(/\b(?:option)\b/ig,'').replace(/[^a-zA-Z0-9,]/g,',').split(",").filter(e=> e!=='');
      }
      if(isTrueFalseType) { loopLimit = 67;} // loop twice for true false 65 to 66
      for(i=65;i<loopLimit;i++){
        j = i - 49;
        let key_code = String.fromCharCode(i); // generate A,B,C,D
        let opt =  { 
          option_key: key_code,
          option_value: row[j],
          option_type: 'TEXT'
        };
        if(isMultipleType && correctAnsArray.includes(key_code)) { opt.correct_answer = key_code; opt.is_correct = true; }
        else if(correct_answer == key_code) {opt.correct_answer = key_code; opt.is_correct = true;}
        qOptions.push(opt);
       }

       // looping on lo1,lo2,lo3,lo4,lo5
       let questionLos = [];
       for(lc=7;lc<12;lc++) {
         if(row[lc]) {
          let lo_code = row[lc].replace(/[^\u0900-\u097Fa-zA-Z0-9]/g,'').toLowerCase();
          questionLos.push(loBankMapData[lo_code]);
        }
      }
      strands_code      = row[4].replace(/ /g, "_").toLowerCase();
      sub_strand_code   = row[5].replace(/ /g, "_").toLowerCase();
      //do no insert for Hindi language
      if(req.body.language == "hindi") { strands_code = ""; sub_strand_code = ""; }

      topic_code        = row[6].replace(/ /g, "_").toLowerCase();
      questionPayload.push({
        lo_ids              : questionLos.join(","),
        skill_id            : skill_id,
        level_id            : level_id,
        grade_id            : grade_id,
        subject_id          : subject_id,
        strand_id           : strandMapData[strands_code],
        sub_strand_id       : subStrandMapData[sub_strand_code],
        topic_id            : topicMapData[topic_code],
        question_type       : qTypeMap[row[12]],
        statement           : row[13],
        correct_answer      : correct_answer,
        answer_explanation  : row[21],
        blooms_taxonomy     : row[22] ? (row[22].toUpperCase() == 'ANALYSE' ? 'ANALYZE': row[22].toUpperCase()) : null,
        difficulty_level    : row[23] ? ((row[23].toLowerCase()=='difficult')? 'HARD' :row[23].toUpperCase()) : null ,
        complexity_level    : row[24].toUpperCase(),
        question_options    : qOptions,
        // required by older questions table
        hint                : 'No Hint',
        correct_answer_score: 1,
        knowledge_level     : 'SHOULD_KNOW',
        estimated_time      : 90,
        // proficiency_level   : ''
      });
    }
  });

  console.log("========================================= last questionPayload",questionPayload[(questionPayload.length-1)]);
  // console.log("All the payload questionPayload",JSON.stringify(questionPayload));
  
  // console.log("the question payload",questionPayload);

  [err, questionData] = await to(questions.bulkCreate(questionPayload));
  if(err) return ReE(res, err, 422);

  // remove label row in excel
  excelObj.shift();
  let questionOptionsPayload = [];
  let excelRow = 0;
  questionData.forEach((qrow) => {
    let excel = excelObj[excelRow];
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> excelRow ",excelRow,loCountInExcelRow[excelRow]);
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Question text ",excelRow, excel[13]);
    // console.log(" question type ============ ",excel[12]);
    let obj = {...qrow.get({plain: true})};
    let correct_answer = String(excel[20]).replace(/\b(?:both)\b/ig,'').replace(/\b(?:option)\b/ig,'').replace(/[^a-zA-Z0-9,]/g,',').split(",").filter(e=> e!=='').join(",");
    let correctAnsArray = [];
    let loopLimit = 69;
      // type is mcq
      isMultipleType = qTypeMap[excel[12]]=='MULTIPLE_CHOICE';
      isTrueFalseType = qTypeMap[excel[12]]=='TRUE_FALSE';
      if(isMultipleType) {
        correctAnsArray = correct_answer.replace(/\b(?:both)\b/ig,'').replace(/\b(?:option)\b/ig,'').replace(/[^a-zA-Z0-9,]/g,',').split(",").filter(e=> e!=='');
      }
      if(isTrueFalseType) { loopLimit = 67;}
      for(i=65;i<loopLimit;i++){
        j = i - 49;
        let key_code = String.fromCharCode(i); // Generate A,B,C,D
        if(String(excel[j])) {
          let opt =  { 
            // question: excel[13],
            // question_row_count: e,
            // excel_row_no: excelRow,
            // excel_row_lo_count: loCountInExcelRow[excelRow],
            option_key: key_code,
            option_value: excel[j],
            option_type: 'TEXT',
            question_id: obj.id
          };
          if(isMultipleType && correctAnsArray.includes(key_code)) { opt.correct_answer = key_code; opt.is_correct = true; }
          if(correct_answer == key_code) {opt.correct_answer = key_code; opt.is_correct = true;}
          questionOptionsPayload.push(opt);
        }
       } // end for
      //  console.log("------------------------------------------ the options ", questionOptionsPayload[e]);
      // // to match the options to lo_questions
      // if(loCountInExcelRow[excelRow] == 1){ excelRow++; }
      // else { loCountInExcelRow[excelRow]--; }
      excelRow++;
  });

  // console.log("question options ",JSON.stringify(questionOptionsPayload));
  
  // return ReE(res, "err", 422);
  [err, qOptionsData] = await to(question_options.bulkCreate(questionOptionsPayload));
  if(err) return ReE(res, err, 422);

  //   // insert to older db using axios post
  //   let promise = [];
  //   console.log("the last question payload for older question table", questionPayload[1]);
  //   questionPayload.forEach( async (element) => {
  //     let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/bypass/questions`, element);
  //   promise.push(request)
  // });
  // console.log("the returned result from axios ",request);

  return {
    questions: questionData,
    question_options: qOptionsData
  };
} 

//TODO: Fix strands text, sub_strand text duplicates on loading new content
const importPsychometry = async (req, res) => {
  let schema = {
      "Question Statement": {
        prop: "question",
        type: String
      },
      "Strand":{
        prop:'strand',
        type: String
      },
      "Sub-strand": {
        prop: 'sub_strand',
        type: String
      },
      "Topic" : {
        prop: 'topic',
        type: String
      },
      "Option A" : {
        prop: 'option_a',
        type: String
      },
      "Option B" : {
        prop: 'option_b',
        type: String
      },
      "Option C" : {
        prop: 'option_c',
        type: String
      },
      "Option D" : {
        prop: 'option_d',
        type: String
      },
      "Option E" : {
        prop: 'option_e',
        type: String
      },
      // if score title in excel is type [Option A score]
      "Option A score" : {
        prop: 'option_as',
        type: String
      },
      "Option B score" : {
        prop: 'option_bs',
        type: String
      },
      "Option C score" : {
        prop: 'option_cs',
        type: String
      },
      "Option D score" : {
        prop: 'option_ds',
        type: String
      },
      "Option E score" : {
        prop: 'option_es',
        type: String
      },
      // if score title in excel is type [Score A]
      "Score A" : {
        prop: 'option_as',
        type: String
      },
      "Score B" : {
        prop: 'option_bs',
        type: String
      },
      "Score C" : {
        prop: 'option_cs',
        type: String
      },
      "Score D" : {
        prop: 'option_ds',
        type: String
      },
      "Score E" : {
        prop: 'option_es',
        type: String
      },
      "Scoring Type" : {
        prop: 'scoring_type',
        type: String
      },
    };

 let excelData = await excelReader(fs.readFileSync( path.join(__dirname +  `/../../public/assets/${req.body.file_name}`) ), { schema }).then( async (rows, errors) => {
    if (rows.errors.length === 0 && rows.rows.length > 0){
      return rows.rows;
    }
  });
  let level_id = req.body.level_id || -1;
  let skill_id = req.body.skill_id || -1;
  let grade_id = req.body.grade_id || -1;
  let set_number = req.body.set_number || 1;
  let strandSet = new Set();
  let subs_strnadMap = {};
  let subStrandSet = new Set();
  let topic_strMap = {};
  let topic_subsMap = {};
  let topicSet = new Set();

  
  excelData.forEach(obj => {
    // let key_code = String.fromCharCode(66).toLowerCase(); // Generate A,B,C,D
    // let excelRow = excelData[0];
    // let rowCode = `option_${key_code}`;
    // let a = excelRow[`option_${key_code}`];
    // console.log("the rowcode and value ", rowCode, a);
    
    // return ReE(res, "working ", 422);
    let subCode = obj.sub_strand.replace(/ /g, "_").toLowerCase();
    let strCode = obj.strand.replace(/ /g, "_").toLowerCase();
    let topCode = obj.topic.replace(/ /g, "_").toLowerCase();
    subs_strnadMap[subCode] = strCode;
    topic_subsMap[topCode] = subCode;
    topic_strMap[topCode] = strCode;
    strandSet.add(obj.strand);
    subStrandSet.add(obj.sub_strand);
    topicSet.add(obj.topic);
  });
  

  let strandsData, strandMap = {};
  // to prevent duplicates on loading for diffrerent sets of pyschometric questions(delete from item from set to prevent insertPayload build)
  [err, strandsData] = await to(strands.findAll({ where: { strand_text: {[Op.in]: Array.from(strandSet) }, level_id: level_id }  }));
  if(strandsData) {
    strandsData.forEach(row => {
      strandSet.delete(row.strand_text);
      let code = row.strand_text.replace(/ /g, "_").toLowerCase();
      strandMap[code] = row.id;
    });
  }

  // create strands Payload
  let strandPayload = [];
  Array.from(strandSet).forEach(obj => {
    let rowS = { strand_text: obj, level_id : level_id, skill_id : skill_id, }
    strandPayload.push(rowS);
  });
  // insert strands
  let strandsInsertData;
  [err,strandsInsertData] = await to(strands.bulkCreate(strandPayload).then(rows=>{
    rows.forEach(row => {
      let code = row.strand_text.replace(/ /g, "_").toLowerCase();
      strandMap[code] = row.id;
    })
  }));
  if(err) return ReE(res, err, 422);
  // console.log("strands map ", strandMap);



  let subStrandsData, subStrandMap = {};
  // to prevent duplicates on loading for diffrerent sets of pyschometric questions(delete from item from set to prevent insertPayload build)
  [err, subStrandsData] = await to(sub_strands.findAll({ where: { sub_strand_text: {[Op.in]: Array.from(subStrandSet) }, strand_id: {[Op.in]: Object.values(strandMap)} }  }));
  if(subStrandsData) {
    subStrandsData.forEach(row => {
      subStrandSet.delete(row.sub_strand_text);
      let code = row.sub_strand_text.replace(/ /g, "_").toLowerCase();
      subStrandMap[code] = row.id;
    });
  }
  // create sub_strands Payload
  let subStrandPayload = [];
  Array.from(subStrandSet).forEach(obj => {
    let subCode = obj.replace(/ /g, "_").toLowerCase();
    let strandId = strandMap[subs_strnadMap[subCode]];
    let rowS = { sub_strand_text: obj, strand_id : strandId };
    subStrandPayload.push(rowS);
  })
  // console.log("the substrand payload ", subStrandPayload);

  // insert substrand 
  let subStrandsInsertedData;
  [err,subStrandsInsertedData] = await to(sub_strands.bulkCreate(subStrandPayload).then(rows=>{
    rows.forEach(row => {
      let code = row.sub_strand_text.replace(/ /g, "_").toLowerCase();
      subStrandMap[code] = row.id;
    })
  }));
  if(err) return ReE(res, err, 422);
  // console.log("sub strand map ", subStrandMap);



  let topicsData, topicMap = {};
  // to prevent duplicates on loading for diffrerent sets of pyschometric questions(delete from item from set to prevent insertPayload build)
  [err, topicsData] = await to(topics.findAll({ where: { 
      topic_text: {[Op.in]: Array.from(topicSet) },
      strand_id: {[Op.in]: Object.values(strandMap)},
      sub_strand_id: {[Op.in]: Object.values(subStrandMap)} 
  } }));
  if(topicsData) {
    topicsData.forEach(row => {
      topicSet.delete(row.topic_text);
      let code = row.topic_text.replace(/ /g, "_").toLowerCase();
      topicMap[code] = row.id;
    });
  }
  // create topics Payload
  let topicPayload = [];
  Array.from(topicSet).forEach(obj => {
    let topCode = obj.replace(/ /g, "_").toLowerCase();
    let strandId = strandMap[topic_strMap[topCode]];
    let subStrandId = subStrandMap[topic_subsMap[topCode]];
    let rowS = { topic_text: obj, level_id : level_id, skill_id : skill_id, grade_id: -1,
      strand_id : strandId, sub_strand_id: subStrandId
    };
    topicPayload.push(rowS);
  })
  // console.log("the topic payload ", topicPayload);

  // insert topic 
  let topicsInsertData;
  [err,topicsInsertData] = await to(topics.bulkCreate(topicPayload).then(rows=>{
    rows.forEach(row => {
      let code = row.topic_text.replace(/ /g, "_").toLowerCase();
      topicMap[code] = row.id;
    })
  }));
  if(err) return ReE(res, err, 422);
  // console.log("sub strand map ", topicMap);

  let questionPayload = [];
  excelData.forEach(obj => {    
    // let subCode = obj.sub_strand.replace(/ /g, "_").toLowerCase();
    // let strCode = obj.strand.replace(/ /g, "_").toLowerCase();
    let topCode = obj.topic.replace(/ /g, "_").toLowerCase();
    let topicId = topicMap[topCode];
    let strandId = strandMap[topic_strMap[topCode]];
    let subStrandId = subStrandMap[topic_subsMap[topCode]];
    let rowQ = {
      statement       : obj.question,
      set_number      : set_number,
      question_type   : 'SINGLE_CHOICE',
      score_type      : obj.scoring_type ? obj.scoring_type : 1,
      level_id        : level_id,
      grade_id        : grade_id,
      skill_id        : skill_id,
      strand_id       : strandId,
      sub_strand_id   : subStrandId,
      topic_id        : topicId,
    };
    questionPayload.push(rowQ);
  });
  // console.log("question payload ", questionPayload);
  // insert questions 
  let questionData, optionsPayload=[];
  [err, questionData] = await to(psy_questions.bulkCreate(questionPayload).then(rows=>{
    rows.forEach((row, index)=> {
      // console.log(row.id);
      for(i=65;i<70;i++){
        let key_code = String.fromCharCode(i).toLowerCase(); // Generate A,B,C,D
        // console.log("the key code ", key_code);
        excelRow = excelData[index];
        let obj = {
          psy_question_id   : row.id,
          option_key        : key_code.toUpperCase(),
          option_value      : excelRow[`option_${key_code}`],
          score_value       : excelRow[`option_${key_code}s`],
        };
        optionsPayload.push(obj);
      }
    });
  }));
  if(err) { return ReE(res, err, 422); }

  // console.log("psy question options payload", optionsPayload);
  // insert options Pay Load
  let optionsData;
  [err, optionsData] = await to(psy_question_options.bulkCreate(optionsPayload));
  if(err) { return ReE(res, err, 422); }

  return ReS(res, {data: excelData}, 200);
}
module.exports.importPsychometry = importPsychometry;