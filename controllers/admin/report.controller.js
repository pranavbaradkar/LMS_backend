const { questions,assessment_questions, user_assessment_responses,campaign_schools, schools, campaign_assessments,assessment_configurations,user_assessment_logs, users, demovideo_details, levels, assessments, user_interview_feedbacks, user_assessments, assessment_results,  user_recommendations } = require("../../models");
const { to, ReE, ReS, capitalizeWords, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash, getUUID } = require('../../services/util.service');
const { getFullName, secondsToMinutesAndSeconds } = require('../../services/report.service');
var _ = require('underscore');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

const moment = require('moment');

const PSYCHOMETRIC_SKILL_ID = process.env.PSYCHOMETRIC_SKILL_ID || 48;
const PSYCHOMETRIC_ANSWER_MAX_VALUE = process.env.PSYCHOMETRIC_ANSWER_MAX_VALUE || 4;

users.hasOne(user_recommendations, {foreignKey: 'user_id'});
users.hasOne(user_interview_feedbacks, {foreignKey: 'user_id'});
campaign_assessments.hasMany(user_assessments, { foreignKey: "assessment_id", sourceKey: "assessment_id" });
user_assessments.belongsTo(campaign_assessments, { foreignKey: 'assessment_id', targetKey: 'assessment_id'});
user_assessments.belongsTo(assessments, { foreignKey: 'assessment_id'});
user_assessments.belongsTo(assessment_results, { foreignKey: 'user_id', targetKey: 'user_id'});
campaign_assessments.belongsTo(campaign_schools, { foreignKey: 'campaign_id', targetKey: 'campaign_id'});
assessment_configurations.belongsTo(user_assessments, { foreignKey: "assessment_id", sourceKey: "assessment_id" });
user_assessments.belongsTo(user_assessment_logs, { foreignKey: "user_id", targetKey: "user_id" });
assessment_configurations.belongsTo(levels, {foreignKey: 'level_id' });
demovideo_details.belongsTo(user_recommendations, {foreignKey: 'user_id', targetKey:'user_id'});
assessment_questions.belongsTo(questions, { foreignKey: 'question_id' });
questions.hasMany(assessment_questions);

module.exports.getSchoolDropdown = async (req, res) => {
  let err, schoolData;
  try {
    [err, schoolData] = await to(schools.findAll({
      attributes:['id','name']
    }));
    return ReS(res, {data: schoolData}, 200);
  } catch (err) {
    return ReE(res,err,422);
  }
};

module.exports.dashboardReport = async(req, res) => {
  let err, userData, reportData;
  
  try {
    const currentDate = moment();
    // Calculate the start_time of the last seven days
    // FIXME: change the date back to 7 days insted of 365
    const startOfLastSevenDays = moment(currentDate).subtract(365, 'days').startOf('day');
    // Calculate the end_time of the last seven days (end of today)
    const endOfLastSevenDays = moment(currentDate).endOf('day');
    
    let filter = {};
    let startDate = req.query.start_date || startOfLastSevenDays.format('YYYY-MM-DD');
    let endDate = req.query.end_date || endOfLastSevenDays.format('YYYY-MM-DD');
    filter.where = { created_at: { [Op.between]: [startDate, endDate] } };
    
    filter.attributes = ['id', 'user_type'];
    let user_assessments_filter = { 
      model: user_assessments, attributes: ['id','assessment_id', 'status', 'type'],
      where: { status: {[Op.in]: ['PASSED', 'FAILED', 'FINISHED'] }},
      include: [
        { 
          paranoid: false,
          model: assessment_configurations, attributes:['id','level_id', 'assessment_type'],
          include: [ { model: levels, attributes:['id', 'name'] } ]
        },
        {
          model: user_assessment_logs, attributes: ['assessment_id','elapsed_time']
        }
      ]
    };
    filter.include = [
      { model: assessment_results, attributes: ['assessment_id', 'type', 'result'] },
      user_assessments_filter,
      { model: demovideo_details, as: 'demo_video', attributes: ['status']},
      { model: user_recommendations, attributes: ['id','status']},
      { model: user_interview_feedbacks, attributes: ['offer_selection']}
    ];
    filter.order = [['id', 'desc']];
    if(req.query.user_type && req.query.user_type !== "ALL") {
      filter.where.user_type = req.query.user_type;
    }
    if((req.query.campaign_ids && req.query.campaign_ids!="ALL") || (req.query.school_ids && req.query.school_ids!="ALL")) {
      filter.include = filter.include.map(ele => {
        // console.log("the model in filter now is ", ele.model);
        // if(ele.model == 'user_assessments')
        //   ele.required = true;  
        ele.required = true;
        return ele;
      }); 

      let user_assessment_filter_include = { 
        required: true,
        model: campaign_assessments, attributes: ['campaign_id', 'assessment_id'],
        where: { deleted_at: null }
        // include
      };
      if(req.query.campaign_ids && req.query.campaign_ids != -1){
        let campaign_where = { [Op.in]: (req.query.campaign_ids).split(",") };
        user_assessment_filter_include.where.campaign_id = campaign_where;
      }
      if(req.query.school_ids && req.query.school_ids != -1){
        // TE("Am I here?");
        user_assessment_filter_include.include = {
          required: true, where: { deleted_at : null },
          model: campaign_schools
        };
        let school_where = { [Op.in]: (req.query.school_ids).split(",") };
        user_assessment_filter_include.include.where.school_id = school_where;
      }

      user_assessments_filter.include.push(user_assessment_filter_include);
    }
    // console.log("the filter",JSON.stringify(filter));
    // console.log("the filter user_assessment ",filter.include[1]);
    // console.log("the filter user_assessment > campaign_assessment ",filter.include[1].include[0]);
    [err, userData] = await to(users.findAndCountAll(filter));
    if(err) return ReE(res, err, 422);

    let report                    = {};
    report.total_sign_up          = 0;
    report.screening_cleared      = 0;
    report.mains_cleared          = 0;
    report.demo_cleared           = 0;
    report.interview_cleared      = 0;
    report.platform               = [{"platform":"Web App","count":500},{"platform":"Mobile App","count":700},{"platform":"IOS","count":400}];
    report.conversion             = [];
    let offer_selection_yes       = 0;
    let offer_selection_no        = 0;
    let offer_selection_maybe     = 0;
    let success_rate              = [];
    let allLevels                 = ["Pre-Primary","Foundational","Preparatory","Middle","Secondary","Senior Secondary"];
    let sr                        = {}; // success rate for mains/screening
    let idsr                      = {}; // interview demo success rate
    let usr                       = {}; // user appeared for mains/screening
    let et                        = {}; // elapsed time for mains/screening
    allLevels.forEach(lev => { 
      sr[lev]   = { "level":lev, "SCREENING": 0, "MAINS": 0};
      usr[lev]  = { "level":lev, "SCREENING": 0, "MAINS": 0 }; // {"level":lev, "screening_count": 0, "mains_count": 0 }
      idsr[lev] = { "level": lev,"demo_video_count":0,"interview_count":0}; 
      et[lev]   = { "level":lev, "SCREENING": [], "MAINS": []};
    } );
    
    userData.rows.forEach((row, index) => {
      report.total_sign_up++;
      let obj = row.get({plain: true});
      if(obj && obj.assessment_results) {
        obj.assessment_results.forEach(elem => {
          if(elem == 'SCREENING' && elem.result == 'PASSED') { report.screening_cleared++; }
          if(elem == 'MAINS' && elem.result == 'PASSED') { report.mains_cleared++; }
        });
      }
      if(obj && obj.user_interview_feedback && obj.user_interview_feedback.offer_selection) {
        if(obj.user_interview_feedback.offer_selection == 'YES') { offer_selection_yes++; }
        if(obj.user_interview_feedback.offer_selection == 'NO') { offer_selection_no++; }
        if(obj.user_interview_feedback.offer_selection == 'MAYBE') { offer_selection_maybe++; }
      }

      //================================ level based data
      let mainsLevel;
      // if(obj.id == 3975) { console.log("the user =================",obj); }
      if(obj && obj.user_assessments) {
        obj.user_assessments.forEach(ua => {
          if(ua.assessment_configuration) {
            let aConfig   = ua.assessment_configuration;
            let type      = aConfig.assessment_type;
            let result    = ua.status;
            let level     = aConfig.level.name;
            if(type=='MAINS')  { mainsLevel    = level; }
            // console.log("assessmentconfig id",ua.id, ua.assessment_id, level, type, result, mainsLevel);
            // let type_count= type.toLowerCase()+_+'total';
            usr[level][type]++;
            sr[level][type] += (result == 'PASSED') ? 1 : 0;
            // sr[level][type]++;
            if(ua.user_assessment_log && ua.user_assessment_log.elapsed_time) {
              let c = ua.user_assessment_log.elapsed_time;
              et[level][type].push(c);
            }
          }
        });
        if(obj && obj.demo_video) {
          obj.demo_video.forEach(elem => {
            if(elem.status == 'RECOMMENDED') { idsr[mainsLevel].demo_video_count++; }
          });
        }
        if(obj && obj.user_recommendation && obj.user_recommendation.status && obj.user_recommendation.status == 'SELECTED') {
          console.log("the interview selected record id",obj.id, mainsLevel, obj.user_recommendation.id);
          idsr[mainsLevel].interview_count++;
        }
      }
    });
    report.conversion.push({"offer_selection":"YES","count":offer_selection_yes});
    report.conversion.push({"offer_selection":"NO","count":offer_selection_no});
    report.conversion.push({"offer_selection":"MAYBE","count":offer_selection_maybe});
    report.interview      = Object.values(idsr);

    // console.log("the passed scr/mains", sr);
    // console.log("the appeared scr/mains ", usr);
    // console.log("the interview/demo success rate", idsr);
    // console.log("the interview/demo success rate", et);
    
    report.success          = [];
    report.users            = [];
    report.time_to_answer   = [];
    Object.keys(sr).forEach(lev => {
      let screeningTotal    = usr[lev]['SCREENING'];
      let screeningRate     = (screeningTotal >0) ? ((sr[lev]['SCREENING']/screeningTotal)*100).toFixed(2) : 0;
      let mainsTotal        = usr[lev]['MAINS'];
      let mainsRate         = (mainsTotal > 0) ? ((sr[lev]['MAINS']/mainsTotal)*100).toFixed(2) : 0;
      report.success.push({level: lev, screening_count: screeningRate, mains_count: mainsRate });
      report.users.push({level: lev, screening_count: screeningTotal, mains_count: mainsTotal });

      let totalScreeningTme = et[lev]['SCREENING'].reduce((total, val) => total+val,0);
      // console.log("total screening time ", lev, totalScreeningTme);
      let avgScreeningTime  = (et[lev]['SCREENING'].length > 0) ? ((totalScreeningTme)/et[lev]['SCREENING'].length).toFixed(0) : 0;
      // report.time_to_answer.push({level: lev, screening_count: avgScreeningTime});
      let totalMainsTme = et[lev]['MAINS'].reduce((total, val) => total+val,0);
      // console.log("total mains time ", lev, totalMainsTme);
      let avgMainsTime  = (et[lev]['MAINS'].length > 0) ? ((totalMainsTme)/et[lev]['MAINS'].length).toFixed(0) : 0;
      report.time_to_answer.push({level: lev, screening_count: avgScreeningTime, mains_count: avgMainsTime});
    });

    // return ReS(res, {data: { report: report, user_data: userData}}, 200);
    return ReS(res, {data: report}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}

module.exports.assessmentUserAnalytics = async(req, res) => {
  let err, userData;
  try {
    // reportData = {"count":288,"rows":[{"name":"Dhrumil White","email":"dhrumil@gmail.com","assessment_score":30,"assessment_score_total":40,"time_taken":"50 mins 56 secs","status":"cleared"},{"name":"Devon Black","email":"devon@gmail.com","assessment_score":31,"assessment_score_total":40,"time_taken":"40 mins 56 secs","status":"cleared"}]};

    let conditions = {};
    conditions.where = { assessment_id: req.params.assessment_id };
    if(req.query.status) {
      conditions.where.status = { [Op.in]: req.query.status.split(",") };
    }
    let include_users = { model: users, attributes:['id', 'profile_pic', 'first_name', 'middle_name', 'last_name', 'email']};
    let include_assessment = {
      model: assessments, attributes: ['id', 'name'],
      where: { id: req.params.assessment_id }, paranoid: false
    };
    if(req.query.search) {
      include_users.where = { [Op.or] : [
        { first_name: { [Op.substring]: req.query.search } },
        { middle_name: { [Op.substring]: req.query.search } },
        { last_name: { [Op.substring]: req.query.search } },
      ]};
      // include_assessment.where[[Op.or]] = { name: { [Op.substring]: req.query.search } };
    }
    conditions.attributes = ['id', 'assessment_id', 'status', 'type'];
    conditions.include = [
      include_users,
      { 
        model: user_assessment_logs, attributes: ['id', 'assessment_id', 'user_id', 'elapsed_time'],
        where: { assessment_id: req.params.assessment_id }
      },
      { 
        model: assessment_results, attributes:  ['id', 'assessment_id', 'user_id', 'total_scored', 'total'],
        where: { assessment_id: req.params.assessment_id }
      },
      include_assessment
    ];

    [err, userData] = await to(user_assessments.findAndCountAll(conditions));
    if(err) return ReE(res, err, 422);

    let finalData = [];
    
    userData.rows.forEach(row =>{
      let obj = row.get({plain: true});
      if(obj.user) {
        let fd  = {};
        fd.full_name              = getFullName(obj.user).trim();
        fd.email                  = obj.user.email;
        fd.profile_pic            = obj.user.profile_pic;
        fd.assessment_score_total = (obj.assessment_result && obj.assessment_result.total) ? obj.assessment_result.total : 0;
        fd.assessment_score       = (obj.assessment_result && obj.assessment_result.total_scored) ? obj.assessment_result.total_scored : 0;
        fd.time_taken             = (obj.user_assessment_log && obj.user_assessment_log.elapsed_time) ? secondsToMinutesAndSeconds(obj.user_assessment_log.elapsed_time) : 0;
        fd.status                 = obj.status;
        finalData.push(fd);
      }
    });

    return ReS(res, {data: userData}, 200);
    // return ReS(res, {data: {count: userData.count, rows:finalData}}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}

const assessmentAnalytics = async(req, res) => {
  let err, reportData;
  try {
    reportData = {"users_attended_assessment":24,"users_in_progress":50,"user_cleared_assessment":100,"user_failed_assessment":10,"success_rate_difficulty":[{"difficulty":"Easy","count":300},{"difficulty":"Medium","count":400},{"difficulty":"Hard","count":500}],"pass_rate_grades":[{"grade":"Grade 1","pass_rate":50},{"grade":"Grade 2","pass_rate":20},{"grade":"Grade 3","pass_rate":10},{"grade":"Grade 4","pass_rate":60},{"grade":"Grade 5","pass_rate":40},{"grade":"Grade 6","pass_rate":30},{"grade":"Grade 7","pass_rate":40},{"grade":"Grade 8","pass_rate":70},{"grade":"Grade 9","pass_rate":20},{"grade":"Grade 10","pass_rate":10},{"grade":"Grade 11","pass_rate":20},{"grade":"Grade 12","pass_rate":30}],"blooms_taxonomy":[{"taxonomy":"Understand","avg_marks":50},{"taxonomy":"Analyze","avg_marks":20},{"taxonomy":"Apply","avg_marks":10}],"average_scores":[{"subject":"IQ","percentile":50},{"subject":"EQ","percentile":95},{"subject":"Pedagogy","percentile":30},{"subject":"Digital Literacy","percentile":40},{"subject":"Communication Skills","percentile":55},{"subject":"Psychometric","percentile":70},{"subject":"Hard Skills","percentile":80},{"subject":"Core Skill","percentile":30}],"dropout_rate":[{"grade":"Grade 1","rate":30},{"grade":"Grade 2","rate":10},{"grade":"Grade 3","rate":50},{"grade":"Grade 4","rate":20},{"grade":"Grade 5","rate":30},{"grade":"Grade 6","rate":40},{"grade":"Grade 7","rate":10},{"grade":"Grade 8","rate":20},{"grade":"Grade 9","rate":10},{"grade":"Grade 10","rate":50},{"grade":"Grade 11","rate":60},{"grade":"Grade 12","rate":10}],"assessment_status":[{"status":"Cleared","count":90},{"status":"In Progress","count":70},{"status":"Not Cleared","count":10}]};
//     let appeared = await usersAppeared(req, res);
//     // let userAssessments = await usersAssessment(req, res);
//     // [err, reportData] = await to();
//     if(err) return ReE(res, err, 422);

// // console.log("the user assessments ", JSON.parse(JSON.stringify(userAssessments)));

//     let finalData                       = appeared;
//     // finalData.users_attended_assessment = appeared;
//     // finalData.users_in_progress = userAssessments;

//     return ReS(res, {data: {final: finalData, temp: reportData}}, 200);
    return ReS(res, {data: reportData}, 200);
  } catch (err) {
  return ReE(res, err, 422);
  }
}
module.exports.assessmentAnalytics = assessmentAnalytics;


const usersAppeared = async (req, res) => {
  let err, reportData;
  try {
    let conditions = {};
    conditions.where = { status : { [Op.in]: ['PASSED','FAILED', 'FINISHED']}}
    conditions.group = ['status'];
    conditions.attributes = ['status',[Sequelize.fn("COUNT", Sequelize.col("id")), "user_count"]] ;
    [err, reportData] = await to(user_assessments.findAll(conditions));

    let statusList    = {
      'PASSED': 'user_cleared_assessment',
      'FAILED': 'user_failed_assessment',
      'FINISHED': 'users_in_progress',
    };
    let response                        = {};
    response.users_attended_assessment  = 0;
    Object.values(statusList).forEach(status => { response[status] = 0; } );
    if(reportData) {
      reportData.forEach(row => {
        let obj = row.get({plain:true});
        response.users_attended_assessment += parseInt(obj.user_count);
        response[statusList[obj.status]]    = parseInt(obj.user_count);
      });
    }
    return response;
    // return ReS(res, {data: reportData}, 200);
  } catch (err) {
  return ReE(res, err, 422);
  }
}
module.exports.usersAppeared = usersAppeared;

const template = async (req, res) => {
  let err, reportData;
  try {
    [err, reportData] = await to();
    if(err) return ReE(res, err, 422);
    return ReS(res, {data: reportData}, 200);
  } catch (err) {
  return ReE(res, err, 422);
  }
}
module.exports.template = template;


const passRateChart = async (req, res) => {
  let err, reportData;
  try {
    let conditions = {};
    conditions.attributes = ['id', 'user_id', 'assessment_id', 'status' ];
    [err, reportData] = await to(user_assessments.findAll(conditions));
    if(err) return ReE(res, err, 422);
    return ReS(res, {data: reportData}, 200);
  } catch (err) {
  return ReE(res, err, 422);
  }
}
module.exports.passRateChart = passRateChart;

//generateAnswersAnalytics
const temporary = async (req, res) => {
  let err,userAssessmentData,reportData, questionData;
  try {
    const uaCondition       = {};
    uaCondition.attributes  = [[Sequelize.fn('DISTINCT', Sequelize.col('assessment_id')) ,'assessment_id']];
    uaCondition.order       = [['assessment_id', 'ASC']];
    uaCondition.include     = [
                                {}
                              ];
    [err, userAssessmentData] = await to(user_assessment_responses.findAll(uaCondition));
    if(err) return ReE(res, err, 422);
    let assessmentIds = userAssessmentData.map(row => row.assessment_id);
    
    // let condition           = {};
    // condition.where         = { assessment_id: {[Op.in] : assessmentIds }};
    // condition.order         = [['assessment_id', 'ASC'],['question_id', 'ASC'] ];
    // // condition.attributes    = [[Sequelize.fn('DISTINCT', Sequelize.col('question_id')) ,'question_id'], 'assessment_id'];
    // condition.attributes    = ['question_id', 'assessment_id'];
    // condition.include       = [
    //                             { model: questions, attributes: ['grade_id', 'blooms_taxonomy', 'skill_id', 'difficulty_level'] }
    //                           ];
    // [err, questionData]     = await to(assessment_questions.findAll(
    //   condition
    //   // {
    //   // where: { assessment_id: {[Op.in] : assessmentIds }},
    //   // order:[['assessment_id', 'ASC'],['question_id', 'ASC'] ],
    //   // attributes: ['question_id', 'assessment_id'],
    //   // include:[
    //   //   { model: questions, attributes: ['grade_id', 'blooms_taxonomy', 'skill_id', 'difficulty_level'] }
    //   // ]}
    // ));
    if(err) return ReE(res, err, 422);

    return ReS(res, {data: { debug: userAssessmentData, reportData:reportData }}, 200);
    // return ReS(res, {data: reportData}, 200);
  } catch (err) {
  return ReE(res, err, 422);
  }
}
module.exports.temporary = temporary;