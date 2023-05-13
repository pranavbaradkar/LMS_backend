
const {  campaigns, campaign_assessments } = require("../models");
const { to } = require('./util.service');
const { Op } = require("sequelize");

module.exports.getLiveCampaignAssessments = async function() {
  let currentDate = new Date();
  let campaignData, err;
  [err, campaignData] = await to(campaigns.findAll({ 
    where: {
      start_time: {
        [Op.lte]: currentDate,
      },
      end_time: {
        [Op.gte]: currentDate,
      }
    },
    include: [{
        model: campaign_assessments,
        require: false,
        attributes: ['assessment_id'],
      }
    ],
    attributes: ['campaign_assessments.assessment_id'],
    raw: true
  }));
  return [...new Set(campaignData.map(ele => { return ele.assessment_id }))]
}