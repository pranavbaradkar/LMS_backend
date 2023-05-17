const {to} = require('await-to-js');
const pe = require('parse-error');
const axios = require('axios');
var AWS = require('aws-sdk');
var config = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "ap-south-1"
};
AWS.config.update(config);
const { Op } = require('sequelize');

s3Client = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if(err) return [pe(err)];

    return [null, res];
};

module.exports.isBlank = (str) => {

    if (str === null || (str && str.length === 0) || str === " ") return true;
    return false;
  
  }

module.exports.ReE = function(res, err, code){ // Error Web Response
    console.log(err);
    if(typeof err == 'object' && typeof err.message != 'undefined'){
        err = err.message;
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json({success:false, error: err, message: "No recipients defined" });
};

module.exports.ReS = function(res, data, code){ // Success Web Response
    let send_data = { success:true, error : "NA" };
    let response = {};
    // console.log(data)
    if(data && data.data && typeof data == 'object') {
     //   console.log(data);
        if(data.data) {
            response.data = typeof data.data.get == 'function' ? data.data.get({plain: true}) : data.data;
        } else {
            response = data;
        }
        //console.log(response.data);
        // remove empty data
        if(response.data.rows) {
            response.data.rows = response.data.rows.map(ele => {
               // console.log(typeof ele.get);
                let res = typeof ele.get == 'function' ?  ele.get({plain: true}) : ele;
                for (const val in res) {
                    res[val] = res[val] == null ? '' : res[val];
                }
                return res;
            })
        } else {
            let obj = {};
            // console.log(Array.isArray(response.data));
            for (const val in response) {
                if(response[val] == null) {
                    obj[val] = "";
                } else if(Array.isArray(response[val])) {
                    //console.log(response[val]);
                    obj[val] = response[val];
                    obj[val] = obj[val].map(kld => {
                        let singleobj = typeof kld.get == 'function' ? kld.get({plain: true}) : kld;
                      // console.log(singleobj);
                        for (const kl in singleobj) {
                            singleobj[kl] =  singleobj[kl] == null ? '' : singleobj[kl];
                        }
                        return singleobj;
                    });
                    // for (const kl in response[val]) {
                    //     obj[val][kl] =  response[val][kl] == null ? '' : response[val][kl];
                    // }
                } else if(typeof response[val] == 'object')  {
                   /// console.log(response[val]);
                    obj[val] = {};
                    for (const kl in response[val]) {
                        obj[val][kl] =  response[val][kl] == null ? '' : response[val][kl];
                    }
                }
            }
            response = {...response, ...obj};
        }
        
        send_data = Object.assign(response, send_data);//merge the objects
    } else if(typeof data == 'object') {
        send_data = Object.assign(data, send_data);//merge the objects
    }

    if(typeof code !== 'undefined') res.statusCode = code;

    return res.json(send_data)
};

module.exports.TE = TE = function(err_message, log){ // TE stands for Throw Error
    if(log === true){
        console.error(err_message);
    }

    throw new Error(err_message);
};


module.exports.paginate = function  (query = {}, { page, pageSize }) {
    const offset = (page-1) * pageSize;
    const limit = pageSize;
    return {
        ...query,
        offset,
        limit
    };
};

module.exports.requestQueryObject = function  (queryObject, where = {}) {
    let page = queryObject && queryObject.page ? parseInt(queryObject.page) : 1;
    let pageSize = queryObject && queryObject.pageSize ? parseInt(queryObject.pageSize) : 500;
    let orderby = queryObject && queryObject.orderBy ? queryObject.orderBy : 'id';
    let sortBy = queryObject && queryObject.sortBy ? queryObject.sortBy : 'desc';
    const offset = (page-1) * pageSize;
    const limit = pageSize;
    return {
        where,
        order: [[orderby, sortBy]],
        offset,
        limit
    };
};

module.exports.randomHash = async function (length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports.toSnakeCase = (str) => {
    return str.slice(0,1).toLowerCase() + str.split('').slice(1).map((char) => {
        if (char == char.toUpperCase()) return '_' + char.toLowerCase();
        else return char;
    }).join('');
}

module.exports.snakeToCamel = (str) => {
    return (str.slice(0, 1).toLowerCase() + str.slice(1))
      .replace(/([-_ ]){1,}/g, ' ')
      .split(/[-_ ]/)
      .reduce((cur, acc) => {
        return cur + acc[0].toUpperCase() + acc.substring(1);
      });
}

module.exports.getFilterObject = (req, key, finalObj) => {
    if(req.query.filter && req.query.filter[key]) {
        let filter = {}
        if(req.query.filter[key] && req.query.filter[key].split(',').length == 1) {
            filter[key] = req.query.filter[key];
        } else {
            filter[key] = { [Op.in]: req.query.filter[key].split(',') }
        }
        finalObj.where = {...finalObj.where, ...filter};
    }
    return finalObj;
}

module.exports.getFilterObjectWithKey = (req, key) => {
    let filter = {}
    if(req.query.filter && req.query.filter[key]) {
        if(req.query.filter[key] && req.query.filter[key].split(',').length == 1) {
            filter[key] = parseInt(req.query.filter[key]);
        } else {
            filter[key] = { [Op.in]: req.query.filter[key].split(',') }
        }
    }
    return {...filter};
}

module.exports.validatePhoneNo = (phone_number) => {
    var tendigitnum = /^\d{10}$/;
    return !tendigitnum.test(phone_number); 
}

module.exports.sendSMS = async (phoneNumber, otp) => {
    let smsSend = await axios.get(`https://103.229.250.200/smpp/sendsms?username=vibgyorerp&password=erJ*N(69b&from=VIBSMS&to=${phoneNumber}&text=Dear Teacher ${otp} is your OTP for verification on Knoggles -VIBGYOR`);
    return smsSend;
}



module.exports.getSignedUrl = async (path, fileName, contentType) => {
   
    const key = fileName;
    const s3Params = {
        Bucket: `${process.env.BUCKET}/${path}`,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        Expires: 20 * 60, // 10 minutes
        // CacheControl: `max-age=31536000`,
        // 'Metadata': {
        //     'user_id': userId
        // }
        // "content-length-range": [1024, 5242880], // allows file-size from 1KB to 5MB.
    }

    const uploadURL = await new Promise(function (resolve, reject) {
        s3Client.getSignedUrl('putObject', s3Params, function (err, url) {
            if (err) {
                reject(err)
            } else {
                const returnData = {
                    signed_request: url,
                    url: `https://${process.env.BUCKET}.s3.amazonaws.com/${path}/${key}`
                };
                resolve(returnData)
            }
        })
    });
    return uploadURL;
}

module.exports.returnObjectEmpty = function (response) {
    let object = {}
    for (const kl in response) {
        object[kl] = response[kl] == null ? '' : response[kl];
    }
    return object;
}

module.exports.lowercaseKeyValue = function(obj) {
    return Object.keys(obj).reduce((accumulator, key) => {
      accumulator[key.toLowerCase()] = obj[key].toLowerCase();
      return accumulator;
    }, {});
  }
