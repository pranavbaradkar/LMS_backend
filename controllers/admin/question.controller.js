const model = require('../../models');
const { lo_banks, topics, strands, sub_strands, lo_questions, lo_question_options, levels,grades,subjects, learning_objectives, questions, skills, question_options, question_mtf_answers, question_los } = require("../../models");
const { to, ReE, ReS, toSnakeCase,cleanLoText, requestQueryObject } = require("../../services/util.service");

const axios = require('axios');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const fs = require('fs');
const WordExtractor = require("word-extractor");
const excelReader = require('read-excel-file/node');
const path = require("path");
const { result, where } = require('underscore');
const { serialize } = require('v8');
questions.belongsTo(model.skills, { foreignKey: 'skill_id' });
questions.belongsTo(model.levels, { foreignKey: 'level_id' });
questions.belongsTo(model.subjects, { foreignKey: 'subject_id' });
questions.hasMany(question_options, { foreignKey: 'question_id', as: "questionOptions" });
questions.hasMany(question_mtf_answers, { foreignKey: 'question_id'});


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
  } else if (!payload.correct_answer) {
    return ReE(res, "Correct answer is required.", 422);
  } else if (!payload.question_options) {
    return ReE(res, "Options is required.", 422);
  }
  try {
    [err, skillData] = await to(skills.findOne({ where: { id: payload.skill_id } }));
    if (err) return ReE(res, err, 422);
    if (skillData !== null) {
      [err, questionData] = await to(questions.create(payload));
      if (err) return ReE(res, err, 422);

      console.log(questionData);

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
      

      if (err) return ReE(res, err, 422);
      let questionLoDataObject = [];
      if(payload.lo_ids) {
        questionLoDataObject = payload.lo_ids.map(ele => {
          return {
            question_id: questionData.id,
            lo_id: ele,
          }
        });
        console.log(questionLoDataObject);
        // return false;
        [err, questionLoData] = await to(question_los.bulkCreate(questionLoDataObject));
        if (err) return ReE(res, err, 422);
  
      }
      return ReS(res, { data: questionData, question_options: questionOptionData, lo: questionLoDataObject }, 200);
    } else {
      return ReE(res, "Skill not found with this id", 404);
    }
  } catch (err) {
    console.log(err);
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

    //whereIncludeSearch = { name: { [Op.like]: `%${req.query.search}%`} };
  }
 
  if(orData.length > 0) {
    queryParams = {...queryParams,...{[Op.or]: orData}}
  } else {
    queryParams = {...queryParams }
  }


  let paginateData = {...requestQueryObject(req.query, queryParams)};
  console.log("testest", paginateData);

  let questionInclude = [
    { model: model.skills, attributes: ['name'], require: false,
    where: whereIncludeSearch },
    { model: question_options, require: false },
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
    [err, questionData] = await to(questions.findAndCountAll({...paginateData, ...{
        include: questionInclude,
        distinct: true
      }
    }
    ));
    if (err) return ReE(res, err, 422);
    if (questionData) {
      return ReS(res, { data: questionData }, 200);
    } else {
      return ReE(res, "No questions data found", 404);
    }
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
    [err, questionData] = await to(questions.findOne({ where: { id: req.params.question_id } }));
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
      questionData.update(payload);

      if(payload.question_options && payload.question_options.length > 0) {
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

const loBankImport = async function(req, res) {

  let excelObj = await excelReader(path.join(__dirname +  `/../../public/assets/${req.body.file_name}`));

  let responseB = await addToLoBank(req, res, excelObj);
  let responseQ = await addToLoQuestion(req, res, excelObj);

  resData = {};
  if(responseB && responseB.lo_bank[2] && responseB.lo_bank[2][2]) {
    resData.lo_bank = "inserted to Lo_bank";
  }
  if(responseQ && responseQ.questions && responseQ.questions[2]) {
    resData.questions = "inserted to Lo_question";
  }

  return ReS(res, { data: resData }, 200);
};
module.exports.loBankImport = loBankImport;

const addToLoBank = async (req, res, excelObj) => {
  let err, strandsData, subStrandsData, loBankData;  
  let level_id = req.body.level_id;
  let grade_id = req.body.grade_id;
  let subject_id = req.body.subject_id;
  let skill_id = req.body.skill_id;

  excelMapX = ['A','B','C','D','E', 'F','G','H','I','J','K','L','M'];
  let bsubjects = {};
  let bstrands = {};
  let bstrands_text = "";
  let bsub_strands = {};
  let bsub_strands_text = "";
  let btopics = {};

  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0) {

      subject_name = single_row[3].replace(/ /g, "_").toLowerCase();
      bsubjects[subject_name] = {};

      bstrands_name = single_row[4].replace(/ /g, "_").toLowerCase();
      strands_text = single_row[4];
      bstrands[bstrands_name] = {};
      bstrands[bstrands_name].strand_text = strands_text;
      bsubjects[subject_name].strands = bstrands;

      bsub_strands_name = single_row[5].replace(/ /g, "_").toLowerCase();
      bsub_strands_text = single_row[5];
      bsub_strands[bsub_strands_name] = {};
      bsub_strands[bsub_strands_name].sub_strand_text = bsub_strands_text;


      btopics_name = single_row[6].replace(/ /g, "_").toLowerCase();
      btopics_text = single_row[6];
      btopics[btopics_name] = {};
      btopics[btopics_name].topic_text = btopics_text;
      
    }
  }); // end foreach 

  // console.log(">>>>>>>>>>>>>>> unique Strands obj",bstrands);
  let bulkStrandPayload=[];
  Object.keys(bstrands).forEach(ind => {
    bulkStrandPayload.push({...bstrands[ind], level_id: level_id, grade_id: grade_id, subject_id: subject_id });
  })
  console.log(">>>>>>>>>>>>>>> bulk Strand Payload",bulkStrandPayload[(bulkStrandPayload.length-1)]);
  // insert strands
  [err, strandsData] = await to(strands.bulkCreate(bulkStrandPayload));
  let strandsMap = {};
  strandsData.map(row => {
    let obj = {...row.get({plain: true})};
    let strand_text = obj.strand_text.replace(/ /g, "_").toLowerCase();
    bstrands[strand_text].strand_id = obj.id;
    return obj;
  });
  strandsMap = bstrands;
  // console.log(">>>>>>>>>>>>>>> the strand obj with ID ",strandsMap);

  // console.log("<<<<<<<<<<<<<<< Unique Sub-Strands obj ",bsub_strands);
  let bulkSubStrandPayload=[];

  let uniqueSubStrand = {};
  let uniqueLo = {};
  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0) {
      bstrands_text = single_row[4].replace(/ /g, "_").toLowerCase();
      let id = strandsMap[bstrands_text].strand_id;
      let key = bstrands_text+id;
      uniqueSubStrand[key] = {};
      uniqueSubStrand[key].sub_strand_text = single_row[5];
      uniqueSubStrand[key].strand_id = id;

      // populate unique lo here
      for(i=7;i<12;i++) {
        if(single_row[i] && single_row[i]!="") {
          let uniqueKey = single_row[i].replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
          uniqueLo[uniqueKey] = { lo_text: cleanLoText(single_row[i]) };
        }
      }
    }
  });
  // console.log("bulk payload for sub strand uniq ", uniqueSubStrand);

   Object.keys(uniqueSubStrand).forEach(ind => {
    bulkSubStrandPayload.push({...uniqueSubStrand[ind] });
  })
  
  // bulkSubStrandPayload
  console.log("bulk payload for sub strand ", bulkSubStrandPayload[(bulkSubStrandPayload.length-1)]);
  
  // insert sub_strands
  [err, subStrandsData] = await to(sub_strands.bulkCreate(bulkSubStrandPayload));
  let subStrandsMap = {};
  subStrandsData.map(row => {
    let obj = {...row.get({plain: true})};
    let sub_strand_text = obj.sub_strand_text.replace(/ /g, "_").toLowerCase();
    bsub_strands[sub_strand_text].sub_strand_id = obj.id;
    return obj;
  });
  subStrandsMap = bsub_strands;
  // console.log("<<<<<<<<<<<<<<< the sub strand obj with ID ",subStrandsMap);

  bulkTopicsPayload = [];
  excelObj.forEach((single_row, row_no) => {
    if (row_no > 0) {
      bstrands_text = single_row[4].replace(/ /g, "_").toLowerCase();
      bsub_strands_text = single_row[5].replace(/ /g, "_").toLowerCase();
      bulkTopicsPayload.push({
        topic_text  : single_row[6],
        level_id    : level_id,
        grade_id    : grade_id,
        subject_id  : subject_id,
        skill_id    : skill_id,
        strand_id   : strandsMap[bstrands_text].strand_id,
        sub_strand_id : subStrandsMap[bsub_strands_text].sub_strand_id
      })
    }
  });
    console.log("================ bulk payload for topic ", bulkTopicsPayload[(bulkTopicsPayload.length-1)]);
  // insert sub_strands
  [err, topicData] = await to(topics.bulkCreate(bulkTopicsPayload));
  let topicsMap = {};
  topicData.map(row => {
    let obj = {...row.get({plain: true})};
    let topic_text = obj.topic_text.replace(/ /g, "_").toLowerCase();
    btopics[topic_text].topic_id = obj.id;
    return obj;
  });
  topicsMap = btopics;
  // console.log(">>>>>>>>>>>>>>>>> the topics obj with ID ",topicsMap);

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
  [err, loBankData] = await to(lo_banks.bulkCreate(loBankPayload));
  if(err) { return ReE(res, err, 422); }

  return {
    strand: [bulkStrandPayload, strandsMap],
    sub_strand: [uniqueSubStrand,bulkSubStrandPayload, subStrandsMap],
    topics: [bulkTopicsPayload,topicsMap],
    lo_bank: [uniqueLo, loBankPayload, loBankData]
  };

}

const addToLoQuestion = async (req, res, excelObj) => {
  let err, strandsData, subStrandsData, loBankData;  

  let level_id    = req.body.level_id;
  let grade_id    = req.body.grade_id;
  let subject_id  = req.body.subject_id;
  let skill_id    = req.body.skill_id;     

  let questionData;
  let questionPayload =[];
  let qTypeMap = { SCQ: 'SINGLE_CHOICE', MCQ: 'MULTIPLE_CHOICE', FIB: 'FILL_IN_THE_BLANKS', TF: 'TRUE_FALSE', MTF:'MATCH_THE_FOLLOWING' };
  excelObj.forEach((row, row_no) => {
    if (row_no > 0) {
      let qOptions = [];
      let correct_answer = row[20].replace(/[^a-zA-Z0-9]/g,'');
      for(i=65;i<69;i++){
        j = i - 49;
        let key_code = String.fromCharCode(i);
        let opt =  { 
          option_key: key_code,
          option_value: row[j],
          option_type: 'TEXT'
        };
        if(correct_answer == key_code) {opt.correct_answer = key_code; }
        qOptions.push(opt);
       }
       questionPayload.push({
        level_id            : level_id,
        grade_id            : grade_id,
        subject_id          : subject_id,
        question_type       : qTypeMap[row[12]],
        statement           : row[13],
        correct_answer      : correct_answer,
        answer_explanation  : row[21],
        blooms_taxonomy     : row[22].toUpperCase() == 'ANALYSE' ? 'ANALYZE': row[22].toUpperCase(),
        difficulty_level    : row[23].toUpperCase(),
        complexity_level    : row[24].toUpperCase(),
        question_options    : qOptions,
        // required by older questions table
        hint                : 'No Hint',
        answer_explanation  : 'No Explanation',
        correct_answer_score: 1,
        knowledge_level     : 'SHOULD_KNOW',
        skill_id            : skill_id,
        estimated_time      : 90,
      });
    }
  });
  console.log("last questionPayload",questionPayload[(questionPayload.length-1)]);

  [err, questionData] = await to(lo_questions.bulkCreate(questionPayload));
  if(err) return ReE(res, err, 422);

  let questionOptionsPayload = [];
  questionData.forEach((qrow, e) => {
    e++;
    let excel = excelObj[e];
    let obj = {...qrow.get({plain: true})};
    let correct_answer = excel[20].replace(/[^a-zA-Z0-9]/g,'');
      for(i=65;i<69;i++){
        j = i - 49;
        let key_code = String.fromCharCode(i);
        if(excel[j]) {
          let opt =  { 
            option_key: key_code,
            option_value: excel[j],
            option_type: 'TEXT',
            lo_question_id: obj.id
          };
          if(correct_answer == key_code) {opt.correct_answer = key_code; }
          questionOptionsPayload.push(opt);
        }
       } // end for
  });
  [err, qOptionsData] = await to(lo_question_options.bulkCreate(questionOptionsPayload));
  if(err) return ReE(res, err, 422);

    // insert to older db using axios post
    let promise = [];
    console.log("the last question payload for older question table", questionPayload[1]);
    questionPayload.forEach( async (element) => {
      let request = await axios.post(`${process.env.BASE_URL}/api/v1/admin/bypass/questions`, element);
    promise.push(request)
  });
  // console.log("the returned result from axios ",request);

  return {
    questions: questionData,
    question_options: qOptionsData
  };
<<<<<<< HEAD
}
=======
} 
>>>>>>> lob_squash
