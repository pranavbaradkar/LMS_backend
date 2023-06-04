const { to, ReE, ReS, getSignedUrl,  uploadVideoOnS3} = require('../services/util.service');
const { users } = require("../models");
var _ = require('underscore');

const Dashboard = function(req, res){
	let user = req.user.id;
	return res.json({success:true, message:'it worked', data:'user name is :'});
}
module.exports.Dashboard = Dashboard


const accountVerify = async function (req, res) {
  let err, user;

  if(req.body && req.body.invite_code == undefined || req.body.invite_code === null) {
    return ReE(res, "Invited code is required", 422);
  }

  [err, user] = await to(users.findOne({ where: { invite_code: req.body.invite_code }, attributes: ['invite_code'] }));
	console.log(user);
  if(user === null) {
    return ReE(res, "Invited code is invalid, please request knoggle support team", 422);
  }
  try {
    //user.save(['invite_code', 'status']);
		await users.update({invite_code: null, status: 'ACTIVE'}, {where: { invite_code:  req.body.invite_code }})
    return ReS(res, { message: "Account has been verify successfully" });
  } catch (err) {
    console.log(err);
    return ReE(
      res,
      "Something went wrong, please try again or please connect with Knoggles support team.",
      422
    );
  }
};
module.exports.accountVerify = accountVerify;


const getUserSignedUrl = async function (req, res) {
  let payload = req.body;
  console.log(payload);
  let url = null;

    let error = null;
    let required = ["context", "file_name", "mime_type", "business_type", "file_type"];
    let diff = _.difference(required, Object.keys(payload));
    if (diff.length > 0) {
      error = `${diff.join(',')} field${diff.length > 1 ? 's' : ''} ${diff.length > 1 ? 'are' : 'is'} required`;
    }
    if (error != null) {
      return ReE(res, error, 422);
    }
    if(payload.business_type == 'b2b' && (payload.business_name == undefined || payload.business_name == '')) {
      return ReE(res, "business name is required for b2b", 422 );
    }
    let businessName = payload.business_name == undefined ? '/vibgyor' : `/${payload.business_name}`;
    if(payload.business_type == 'b2c') {
      businessName = '';
    }
  
  let path = `${payload.context}/${payload.business_type}${businessName}/${payload.uuid}/${payload.file_type}`
  if(payload.context == "question-bank") {
    let educationLevel = payload.education_level == undefined ? 'k12' : payload.education_level;
    let options = payload.option_uuid ? `/options/${payload.option_uuid}` : '';
    path = `${payload.context}/${payload.business_type}${businessName}/${educationLevel}/${payload.question_uuid}${options}/${payload.file_type}`
  }
  url = await getSignedUrl(`${path}`, payload.file_name, payload.mime_type);
  return ReS(res, { data: url });
}
module.exports.getUserSignedUrl = getUserSignedUrl;



const uploadVideo = async function (req, res) {
  let userId = req.params.user_id;
  let assessment_id = req.params.assessment_id;
  const file = req.files;

  let path = `live_stream/${assessment_id}/${userId}`

  url = await uploadVideoOnS3(`${path}`, `video_${new Date().getTime()}.mp4`, req.files[0].mimetype, req.files[0].buffer);
  return ReS(res, { data: url });
}
module.exports.uploadVideo = uploadVideo;


