const { campaigns,campaign_schools, campaign_assessments,assessment_configurations,user_assessment_logs, users, demovideo_details, levels, user_interviews, user_interview_feedbacks, user_assessments, assessment_results,  user_recommendations, schools} = require("../../models");
const { sequelize } = require('../../models');
const authService = require("../../services/auth.service");
const { to, ReE, ReS, capitalizeWords, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash, getUUID } = require('../../services/util.service');
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
campaign_assessments.belongsTo(campaign_schools, { foreignKey: 'campaign_id', targetKey: 'campaign_id'});
assessment_configurations.belongsTo(user_assessments, { foreignKey: "assessment_id", sourceKey: "assessment_id" });
user_assessments.hasOne(user_assessment_logs, { foreignKey: "assessment_id", sourceKey: "assessment_id" });
assessment_configurations.belongsTo(levels, {foreignKey: 'level_id' });
demovideo_details.belongsTo(user_recommendations, {foreignKey: 'user_id', targetKey:'user_id'});

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
      { model: user_recommendations, attributes: ['status']},
      { model: user_interview_feedbacks, attributes: ['offer_selection']}
    ];
    filter.order = [['id', 'desc']];
    if(req.query.user_type) {
      filter.where.user_type = req.query.user_type;
    }
    if(req.query.campaign_ids || req.query.school_ids) {
      filter.include = filter.include.map(ele => {
        // console.log("the model in filter now is ", ele.model);
        // if(ele.model == 'user_assessments')
        //   ele.required = true;  
        ele.required = true;
        return ele;
      } ); 

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
      if(obj && obj.user_assessments) {
        obj.user_assessments.forEach(ua => {
          if(ua.assessment_configuration) {
            let aConfig   = ua.assessment_configuration;
            let type      = aConfig.assessment_type;
            let result    = ua.status;
            let level     = aConfig.level.name;
            // console.log("assessmentconfig id",ua.assessment_id, level, type, result);
            // let type_count= type.toLowerCase()+_+'total';
            usr[level][type]++;
            sr[level][type] += (result == 'PASSED') ? 1 : 0;
            // sr[level][type]++;
            if(obj && obj.demo_video) {
              obj.demo_video.forEach(elem => {
                if(elem.status == 'RECOMMENDED') { idsr[level].demo_video_count++; }
              });
            }
            if(obj && obj.user_recommendation && obj.user_recommendation.status && obj.user_recommendation.status == 'SELECTED') {
              idsr[level].interview_count++;
            }
            if(ua.user_assessment_log && ua.user_assessment_log.elapsed_time) {
              let c = ua.user_assessment_log.elapsed_time;
              et[level][type].push(c);
            }
          }
        });
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
      console.log("total screening time ", lev, totalScreeningTme);
      let avgScreeningTime  = (et[lev]['SCREENING'].length > 0) ? ((totalScreeningTme)/et[lev]['SCREENING'].length).toFixed(0) : 0;
      report.time_to_answer.push({level: lev, screening_count: avgScreeningTime});
    });

    // return ReS(res, {data: { report: report, user_data: userData}}, 200);
    return ReS(res, {data: report}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}

module.exports.assessmentAnalytics = async(req, res) => {
  let reportData;
  try {
    reportData = {"users_attended_assessment":24,"users_in_progress":50,"user_cleared_assessment":100,"user_failed_assessment":10,"success_rate_difficulty":[{"difficulty":"Easy","count":300},{"difficulty":"Medium","count":400},{"difficulty":"Hard","count":500}],"pass_rate_grades":[{"grade":"Grade 1","pass_rate":50},{"grade":"Grade 2","pass_rate":20},{"grade":"Grade 3","pass_rate":10},{"grade":"Grade 4","pass_rate":60},{"grade":"Grade 5","pass_rate":40},{"grade":"Grade 6","pass_rate":30},{"grade":"Grade 7","pass_rate":40},{"grade":"Grade 8","pass_rate":70},{"grade":"Grade 9","pass_rate":20},{"grade":"Grade 10","pass_rate":10},{"grade":"Grade 11","pass_rate":20},{"grade":"Grade 12","pass_rate":30}],"blooms_taxonomy":[{"taxonomy":"Understand","avg_marks":50},{"taxonomy":"Analyze","avg_marks":20},{"taxonomy":"Apply","avg_marks":10}],"average_scores":[{"subject":"IQ","percentile":50},{"subject":"EQ","percentile":95},{"subject":"Pedagogy","percentile":30},{"subject":"Digital Literacy","percentile":40},{"subject":"Communication Skills","percentile":55},{"subject":"Psychometric","percentile":70},{"subject":"Hard Skills","percentile":80},{"subject":"Core Skill","percentile":30}],"dropout_rate":[{"grade":"Grade 1","rate":30},{"grade":"Grade 2","rate":10},{"grade":"Grade 3","rate":50},{"grade":"Grade 4","rate":20},{"grade":"Grade 5","rate":30},{"grade":"Grade 6","rate":40},{"grade":"Grade 7","rate":10},{"grade":"Grade 8","rate":20},{"grade":"Grade 9","rate":10},{"grade":"Grade 10","rate":50},{"grade":"Grade 11","rate":60},{"grade":"Grade 12","rate":10}],"assessment_status":[{"status":"Cleared","count":90},{"status":"In Progress","count":70},{"status":"Not Cleared","count":10}]};
    return ReS(res, {data: reportData}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}

module.exports.assessmentUserAnalytics = async(req, res) => {
  let reportData;
  try {
    reportData = {"count":288,"rows":[{"name":"Dhrumil White","email":"dhrumil@gmail.com","assessment_score":30,"assessment_score_total":40,"time_taken":"50 mins 56 secs","status":"cleared"},{"name":"Devon Black","email":"devon@gmail.com","assessment_score":31,"assessment_score_total":40,"time_taken":"40 mins 56 secs","status":"cleared"}]};
    // [err, reportData] = await to(user_recommendations.findAndCountAll({
    //   attributes: ['screening_score', 'screening_score_total', 'mains_score', 'mains_score_total', 'status']
    // }))
    return ReS(res, {data: reportData}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}