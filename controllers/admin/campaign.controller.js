const { clusters, levels, user_assessments,  campaigns, schools, users, campaign_assessments, assessments, assessment_configurations, campaign_levels } = require("../../models");
const model = require('../../models');
var Sequelize = require("sequelize");
const authService = require("../../services/auth.service");
const { to, ReE, ReS, toSnakeCase, requestQueryObject } = require("../../services/util.service");
var moment = require("moment");
const { Op } = require("sequelize");
const { include } = require("underscore");

let ist = "+05:30";

campaigns.hasMany(campaign_assessments, { foreignKey: "campaign_id" });
campaigns.hasMany(campaign_levels, { foreignKey: "campaign_id" });
campaign_assessments.hasMany(user_assessments, { foreignKey: "assessment_id", sourceKey: "assessment_id" });
campaign_levels.belongsTo(levels, { foreignKey: 'level_id' });
// ************************************************** CAMPAIGNS  API ***************************************************
const createCampaigns = async function (req, res) {
  let err, campaignData;
  let payload = req.body;
  payload.user_id = req.user.id;
  

  if (!payload.start_date && !payload.start_time) {
    return ReE(res, "Start date and time is required.", 422);
  } else if (!payload.end_date && !payload.end_time) {
    return ReE(res, "End date and time is required.", 422);
  } else if (!payload.audience_type) {
    return ReE(res, "Please enter a audience type.", 422);
  } else {

    try {
      //date format code
      let startDateTime = moment(payload.start_date, "DD-MM-YYYY");
      startDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      payload.start_date = startDateTime.format('YYYY-MM-DD HH:mm:ss');

      let endDateTime = moment(payload.end_date, "DD-MM-YYYY");
      endDateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      payload.end_date = endDateTime.format('YYYY-MM-DD HH:mm:ss');

      let start_time = payload.start_time.split(":");
      let end_time = payload.end_time.split(":");
      startDateTime.set({ hour: start_time[0], minute: start_time[1], second: 0, millisecond: 0 });
      endDateTime.set({ hour: end_time[0], minute: end_time[1], second: 0, millisecond: 0 });

      payload.end_time = endDateTime.format('YYYY-MM-DD HH:mm:ss');
      payload.start_time =  startDateTime.format('YYYY-MM-DD HH:mm:ss');

      //user assign school and cluster
      let clusterData = [];
      if(payload.cluster_ids && payload.cluster_ids.length > 0) {
        [err, schoolsResponse] = await to(schools.findAll({ where: { cluster_id: { [Op.in]: payload.cluster_ids } }, attributes: ['id', 'cluster_id'], raw: true }));
        if(schoolsResponse) {
          clusterData = schoolsResponse;
        }
      }

      let schoolData = [];
      if(payload.school_ids && payload.school_ids.length > 0) {
        [err, schoolsResponse] = await to(schools.findAll({ where: { id: { [Op.in]: payload.school_ids } }, attributes: ['id', 'cluster_id'], raw: true }));
        if(schoolsResponse) {
          schoolData = schoolsResponse;
        }
      }
      
      let finalSchoolData = [...clusterData, ...schoolData];
      let uniqueData = Array.from(new Set(finalSchoolData.map(JSON.stringify))).map(JSON.parse).map(ele => {
        return {school_id: ele.id, cluster_id: ele.cluster_id }
      });

      let payloadConvert = [
        {key: 'skill_ids', table: 'campaign_skills', column: 'skill_id'}, 
        {key: 'subject_ids', table: 'campaign_subjects', column: 'subject_id'}, 
        {key: 'level_ids', table: 'campaign_levels', column: 'level_id'}
      ];
      payloadConvert.map(ele => {return ele.key}).forEach(ele => {
        payload[ele] = payload[ele] ? payload[ele] : null
      });
     
      
      if(payload.school_ids) {
        payload.school_ids = uniqueData.map(ele => { return ele.school_id });
      }
      console.log(payload);
      [err, campaignData] = await to(campaigns.create(payload));
       
      if(campaignData) {
        payloadConvert.forEach(async ele => {
          if(ele.table && payload[ele.key]) {
            let data = payload[ele.key]
            let mapObj = data.map(e => {
              let dump = {};
              dump[ele.column] = parseInt(e)
              return dump;
            });
            await updateCampaignMeta(mapObj, campaignData.id, ele.table);
          }
        });

        if(payload.school_ids) {
          let mapObj = uniqueData.map(e => {
            return {school_id: e.school_id, cluster_id: e.cluster_id};
          });
          await updateCampaignMeta(mapObj, campaignData.id, 'campaign_schools');
        }
        if(payload.assessment_ids && payload.assessment_ids.length > 0) {
          let mapObj = payload.assessment_ids.map(e => {
            return {assessment_id: e};
          });
          await updateCampaignMeta(mapObj, campaignData.id, 'campaign_assessments');
        }
      }
      
      if(err) {
        return ReE(res, err, 422);
      } else {
        return ReS(res, { data: campaignData }, 200);
      }
     // return ReS(res, { data: campaignData }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
  }
}
module.exports.createCampaigns = createCampaigns;

const updateCampaignMeta = async function(insertData, campaign_id, table) {
  // console.log(table);
  if(insertData.length > 0 && campaign_id) {
    let objectData = insertData.map(ele => {
      let obj = {...{
        campaign_id: campaign_id,
      }, ...ele}
      return obj;
    });

    console.log(objectData);
    
    [bulkerr, bulkDestroy] = await to(model[table].destroy({where: {
      campaign_id: campaign_id
    }, force: true}));

    if(bulkerr == null) {
      [err, bulkCreate] = await to(model[table].bulkCreate(objectData));
     // console.log(bulkCreate);
    }
  }
}

const getAllUserCampaigns = async function (req, res) {
  let err, campaignData;

 [err, usercount] = await to(users.count({}));
  console.log(usercount);
  try {
    [err, campaignData] = await to(campaigns.findAll({ 
      where: { user_id: req.user.id },
      include: [{
          model: campaign_assessments,
          require: false,
          attributes: ['assessment_id'],
          include: [{
            model: user_assessments,
            attributes: ['screening_status', 'mains_status'],
          }]
        },
        {
          model: campaign_levels,
          require: false,
          attributes: ['level_id'],
          include: [{
            model: levels,
            attributes: ['name']
          }]
        }
      ]
    }));
    if (err) return ReE(res, err, 422);
    if (campaignData && campaignData.length > 0) {
      let liveCampaign = [];
      let scheduleCampaign = [];
      let expiredCampaign = [];

      let currentDate = moment.utc();
      campaignData.forEach(ele => {
        ele = ele.get({plain: true});

        ele.start_date = moment(ele.start_date).utcOffset(ist).format("DD-MM-YYYY");
        ele.end_date = moment(ele.end_date).utcOffset(ist).format("DD-MM-YYYY");
       
        
        ele.levels = ele.campaign_levels.map(ele => {
          return ele && ele.level ? ele.level.name : null;
        });
        delete ele.campaign_levels;
        let startDate = moment(ele.start_time).utc();
        let endDate = moment(ele.end_time).utc();
        
        console.log(currentDate.isAfter(startDate), currentDate.isBefore(endDate), endDate);
        if ((currentDate.isAfter(startDate) && currentDate.isBefore(endDate))) {
          liveCampaign.push(ele);
        } 
        if (currentDate.isAfter(endDate)) {
          expiredCampaign.push(ele);
        } 
        if (startDate.isAfter(currentDate)) {
          scheduleCampaign.push(ele);
        }
        ele.start_time = moment(ele.start_time).utcOffset(ist).format("HH:mm");
        ele.end_time = moment(ele.end_time).utcOffset(ist).format("HH:mm");

        let i = 0
        ele.campaign_assessments.forEach(e => {
          i = e.user_assessments.length + i;
        })

        ele.yet_to_attempt = usercount - i;
        ele.assessed = i;
        // console.log(ele);        
      });
      console.log(liveCampaign);
      return ReS(res, { data: {
        live_campaign: liveCampaign,
        scheduled_campaign: scheduleCampaign,
        expired_campaign: expiredCampaign
      } }, 200);
    } else {
      return ReE(res, "No campaigns data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
};
module.exports.getAllUserCampaigns = getAllUserCampaigns;

const getUserCampaign = async function (req, res) {
  let err, campaignData;

  if (req.params && req.params.campaign_id == undefined) {
    return ReE(res, { message: "campaigns info id params is missing" }, 422);
  }
  try {
    [err, campaignData] = await to(campaigns.findOne({ 
      where: { id: req.params.campaign_id },
      include: [{
        model: campaign_assessments,
        require: false,
        attributes: ['assessment_id']
        }] 
      })
    );
    if (err) return ReE(res, err, 422);
    if (campaignData !== null) {
      campaignData = campaignData.get({plain: true});
      campaignData.start_date = moment(campaignData.start_date).utcOffset(ist).format("DD-MM-YYYY");
      campaignData.end_date = moment(campaignData.end_date).utcOffset(ist).format("DD-MM-YYYY");
      campaignData.start_time = moment(campaignData.start_time).utcOffset(ist).format("HH:mm");
      campaignData.end_time = moment(campaignData.end_time).utcOffset(ist).format("HH:mm");
      campaignData.assessments = campaignData.campaign_assessments.map(ele => {
        return ele.assessment_id;
      });
      delete campaignData.campaign_assessments;
      return ReS(res, { data: campaignData }, 200);
    } else {
      return ReE(res, "No campaigns data found", 404);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getUserCampaign = getUserCampaign;

const updateUserCampaign = async function (req, res) {
  let err, campaignData;
  let payload = req.body;
  if (req.params && req.params.campaign_id == undefined) {
    return ReE(res, { message: "campaigns id params is missing" }, 422);
  }
  try {
    [err, campaignData] = await to(campaigns.findOne({ where: { id: req.params.campaign_id } }));
    if (err) return ReE(res, err, 422);
    if (campaignData == null) {
      return ReE(res, "No campaigns data found", 404);
    } else {

      //date format code
      let startDateTime = moment(`${payload.start_date} ${payload.start_time}`, "DD-MM-YYYY H:mm:ss").utc();
      payload.start_date = startDateTime;
      payload.start_time = startDateTime;
      
      let endDateTime = moment(`${payload.end_date} ${payload.end_time}`, "DD-MM-YYYY HH:mm:ss").utc();
      payload.end_date = endDateTime;
      payload.end_time = endDateTime;

      campaignData.update(payload);
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: campaignData }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.updateUserCampaign = updateUserCampaign;

const deleteUserCampaign = async function (req, res) {
  let err, campaignData;
  if (req.params && req.params.campaign_id == undefined) {
    return ReE(res, { message: "campaigns id params is missing" }, 422);
  }
  try {
    [err, campaignData] = await to(campaigns.findOne({ where: { id: req.params.campaign_id } }));
    if (err) return ReE(res, err, 422);
    if (campaignData == null) {
      return ReE(res, "No campaigns data found", 404);
    } else {
      campaignData.destroy();
      if (err) return ReE(res, err, 422);
      return ReS(res, { data: "campaigns deleted successfully." }, 200);
    }
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteUserCampaign = deleteUserCampaign;


const getCampaignAssessment = async function (req, res) {
  let err, assessmentsData;
  try {
    let queryParams = [];
    let level = {};

    if(req.body && req.body.level_ids) {
      level['level_id'] = { [Op.in]: req.body.level_ids }
      queryParams.push(level);
    }

    if(req.body && req.body.skill_ids) {
      
      let skill_distributions  = {
        [Op.or]: req.body.skill_ids.map(ele => {
          return { skill_distributions : { 
              [Op.contains] : [{
                  'skill_id': ele
                }]
              }
            }
        })
      };

      queryParams.push(skill_distributions);
    }

    if(req.body && req.body.subject_ids) {
      let skill_distributions  = {
        [Op.or]: req.body.subject_ids.map(ele => {
          return { skill_distributions : { 
              
              [Op.contains] : [
                { subject_ids:[{
                    'subject_id': ele
                  }]
                }
              ]
              }
            }
        })
      };

      queryParams.push(skill_distributions);
    }

    console.log(queryParams);

    let paginateData = {...requestQueryObject(req.query)};
   
    [err, assessmentsData] = await to(assessments.findAndCountAll({...paginateData, ...{
        include: [{
          model: assessment_configurations,
          where: {[Op.and] : queryParams},
          require: false,
          attributes: []
        }],
        distinct: true,
        attributes: ['id', 'name']
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
}
module.exports.getCampaignAssessment = getCampaignAssessment;