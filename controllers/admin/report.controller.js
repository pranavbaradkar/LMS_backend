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
    reportData = {"total_sign_up":5200,"screening_cleared":4800,"mains_cleared":2400,"demo_cleared":1000,"interview_cleared":500,"conversion":[{"offer_selection":"YES","count":47},{"offer_selection":"NO","count":56},{"offer_selection":"MAYBE","count":156}],"interview":[{"level":"Foundational","demo_video_count":1000,"interview_count":500},{"level":"Preparatory","demo_video_count":1000,"interview_count":500},{"level":"Middle","demo_video_count":1000,"interview_count":500},{"level":"Secondary","demo_video_count":1000,"interview_count":500},{"level":"Sr. Secondary","demo_video_count":1000,"interview_count":500}],"success":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"users":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"time_to_answer":[{"level":"Foundational","screening_count":1000,"mains_count":500},{"level":"Preparatory","screening_count":1000,"mains_count":500},{"level":"Middle","screening_count":1000,"mains_count":500},{"level":"Secondary","screening_count":1000,"mains_count":500},{"level":"Sr. Secondary","screening_count":1000,"mains_count":500}],"platform":[{"platform":"Web App","count":500},{"platform":"Mobile App","count":700},{"platform":"IOS","count":400}]};
    return ReS(res, {data: reportData}, 200);

  } catch (err) {
  return ReE(res, err, 422);
  }
}