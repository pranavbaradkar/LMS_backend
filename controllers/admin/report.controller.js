const { interviewers, roles,subjects, boards, schools, levels, user_teaching_interests, users, demovideo_details, user_interviews, user_interview_feedbacks, user_assessments, assessment_results, academics, professional_infos, custom_attributes, school_inventories, user_recommendations, assessment_configurations } = require("../../models");
const model = require('../../models');
const authService = require("../../services/auth.service");
const { to, ReE, ReS, capitalizeWords, toSnakeCase, paginate, snakeToCamel, requestQueryObject, randomHash, getUUID } = require('../../services/util.service');
var _ = require('underscore');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

const PSYCHOMETRIC_SKILL_ID = process.env.PSYCHOMETRIC_SKILL_ID || 48;
const PSYCHOMETRIC_ANSWER_MAX_VALUE = process.env.PSYCHOMETRIC_ANSWER_MAX_VALUE || 4;

module.exports.dashboardReport = async(req, res) => {
  let reportData;
  try {
    if(req.query && req.query.user_type=='TEACHER') { 
      reportData = {"total_sign_up":400,"screening_cleared":900,"mains_cleared":300,"demo_cleared":500,"interview_cleared":100,"conversion":[{"offer_selection":"YES","count":47},{"offer_selection":"NO","count":56},{"offer_selection":"MAYBE","count":156}],"interview":[{"level":"Foundational","demo_video_count":1000,"interview_count":500},{"level":"Preparatory","demo_video_count":1000,"interview_count":500},{"level":"Middle","demo_video_count":1000,"interview_count":500},{"level":"Secondary","demo_video_count":1000,"interview_count":500},{"level":"Sr. Secondary","demo_video_count":1000,"interview_count":500}],"success":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"users":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"time_to_answer":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"platform":[{"platform":"Web App","count":500},{"platform":"Mobile App","count":700},{"platform":"IOS","count":400}]};
    }
    else {
      reportData = {"total_sign_up":5200,"screening_cleared":4800,"mains_cleared":2400,"demo_cleared":1000,"interview_cleared":500,"conversion":[{"offer_selection":"YES","count":47},{"offer_selection":"NO","count":56},{"offer_selection":"MAYBE","count":156}],"interview":[{"level":"Foundational","demo_video_count":1000,"interview_count":500},{"level":"Preparatory","demo_video_count":1000,"interview_count":500},{"level":"Middle","demo_video_count":1000,"interview_count":500},{"level":"Secondary","demo_video_count":1000,"interview_count":500},{"level":"Sr. Secondary","demo_video_count":1000,"interview_count":500}],"success":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"users":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"time_to_answer":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"platform":[{"platform":"Web App","count":500},{"platform":"Mobile App","count":700},{"platform":"IOS","count":400}]};
    }
    return ReS(res, {data: reportData}, 200);

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
    reportData = {"count":288,"rows":[{"name":"Dhrumil White","screening_time":"50 mins 32 secs","screening_score":30,"screening_score_total":40,"mains_score":120,"mains_score_total":150,"status":"cleared"},{"name":"Devon Black","screening_time":"50 mins 32 secs","screening_score":31,"screening_score_total":40,"mains_score":110,"mains_score_total":150,"status":"cleared"}]};
    // [err, reportData] = await to(user_recommendations.findAndCountAll({
    //   attributes: ['screening_score', 'screening_score_total', 'mains_score', 'mains_score_total', 'status']
    // }))
    return ReS(res, {data: reportData}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}