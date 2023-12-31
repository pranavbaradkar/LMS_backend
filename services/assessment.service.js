
const { user_assessments, assessments, user_assessment_slots } = require("../models");
const { to } = require('./util.service');
const { Op } = require("sequelize");
var _ = require('underscore');

module.exports.getStatus = async function(user_id) {
  let userAssessmentSlotData, user_assessment_screening, user_assessment_mains, user_assessment_data_mains, user_assessment_data_screening;
  let payloadStatus = {
    padc_status: false,
    padv_status: false,
    is_slot_selection: false,
    is_demo_video: false,
    screening_status: 'PENDING',
    mains_status: 'PENDING',
    is_mains_test_taken: false,
    is_screening_test_taken: false,
    mains_setup: {}
  };

  [err, userAssessmentSlotData] = await to(user_assessment_slots.findOne({ where: { user_id: user_id },attributes: ['slot', 'padv_video_link', 'video_link', 'demo_link'], raw: true }));
  
  if(userAssessmentSlotData) {
    if(userAssessmentSlotData.slot) {
      payloadStatus.is_slot_selection = true;
    }
    if(userAssessmentSlotData.video_link) {
      payloadStatus.video_link = true;
    }
    if(userAssessmentSlotData.padv_video_link) {
      payloadStatus.padv_video_link = true;
    }
    if(userAssessmentSlotData.demo_link) {
      payloadStatus.demo_link = true;
    }
    payloadStatus.mains_setup = userAssessmentSlotData;
  }

  let is_screening_test_taken = false;
  let is_mains_test_taken = false;

  [err, user_assessment_data_screening] = await to(user_assessments.findOne({ where: { user_id : user_id, status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']}, type: 'SCREENING' }, raw: true, order: [['id', 'desc']] }));
  [err, user_assessment_data_mains] = await to(user_assessments.findOne({ where: { user_id : user_id, status: { [Op.in]: ['FINISHED', 'PASSED', 'FAILED']}, type: 'MAINS' }, raw: true, order: [['id', 'desc']] }));

  [err, user_assessment_screening] = await to(user_assessments.findOne({ where: { user_id : user_id, type: 'SCREENING' }, raw: true, attributes: ['status'], order: [['id', 'desc']] }));
  [err, user_assessment_mains] = await to(user_assessments.findOne({ where: { user_id : user_id, type: 'MAINS'}, attributes: ['status'], raw: true, order: [['id', 'desc']] }));
  
  if(user_assessment_screening) {
    payloadStatus.screening_status = user_assessment_screening.status;
  }
  if(user_assessment_mains) {
    payloadStatus.mains_status = user_assessment_mains.status;
  }
  
  if(user_assessment_data_mains) {
    is_mains_test_taken = true
  }

  if(user_assessment_data_screening) {
    is_screening_test_taken = true
  }

  payloadStatus.is_mains_test_taken = is_mains_test_taken;
  payloadStatus.is_screening_test_taken = is_screening_test_taken;

  return payloadStatus;
}

const gradePsyScore = (score) => {
  if (score >= 0 && score <= 28) {
    return "Below average";
  } else if (score >= 29 && score <= 56) {
    return "Average";
  } else if (score >= 57 && score <= 84) {
    return "Appropriate";
  } else if (score >= 85 && score <= 112) {
    return "Excellent";
  } else {
    return "Invalid score";
  }
}
module.exports.gradePsyScore = gradePsyScore;

const getHighestCount = (userOjbect, userObjectMap) => {
  let resObj = {};
  Object.keys(userOjbect).forEach(user => {
    resObj[user] = getHighestCountPerUser(userOjbect[user], userObjectMap);
  })
  return resObj;
}
module.exports.getHighestCount = getHighestCount;

const getHighestCountPerUser = (userObj, userObjectMap) => {
  const count = {};
  userObj.forEach(element => {
  count[element] = (count[element] || 0) + 1;
  });

  let highestCount = 0;
  let elementsWithHighestCount = [];

  for (const element in count) {
  if (count[element] > highestCount) {
      highestCount = count[element];
      elementsWithHighestCount = [element];
  } else if (count[element] === highestCount) {
      elementsWithHighestCount.push(element);
  }
  }
  // select only one 
  elementsWithHighestCount = elementsWithHighestCount[_.random(0, (elementsWithHighestCount.length-1))];
  return {id:elementsWithHighestCount, name: userObjectMap[elementsWithHighestCount]};
}