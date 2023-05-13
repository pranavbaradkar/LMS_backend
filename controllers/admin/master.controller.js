const model = require('../../models');
const { to, ReE, ReS, paginate }  = require('../../services/util.service');
const { masterTableMapping }  = require('../../config/constant');
const fs = require("fs");
const readXlsxFile = require('read-excel-file/node')
const path = require("path");

var Sequelize = require("sequelize");
const Op = Sequelize.Op;

model.talukas.belongsTo(model.districts, { foreignKey: 'district_id' });

// create meta data
const createMeta = async function (req, res) {
    let err, response, bulkOperation;
    let payload = req.body;
    let tableName = req.params.table;
    if(masterTableMapping[tableName] === undefined) {
      return ReE(res, {message: "bad request"}, 400);
    }
    try {
      let table = masterTableMapping[tableName];
      if(table && table.name) {
        table = table.name;
      }
      [err, response] = await to(model[table].create(payload));

      if (err) {
        console.log(err);
        return ReE(res, err, 422);
      }

      // levels 
      if(table == 'levels' && payload.gradeIds) {
        let level_grades_payload = payload.gradeIds.map(ele => {
          obj = {};
          obj.grade_id = ele;
          obj.level_id = response.id
          return obj;
        });
        console.log(level_grades_payload);
        [err, bulkOperation] = await to(model.level_grades.bulkCreate(level_grades_payload));
      }

      if(table == 'skills' && payload.subject_ids) {
        let skills_subject_payload = payload.subject_ids.map(ele => {
          obj = {};
          obj.subject_id = ele;
          obj.skill_id = response.id
          return obj;
        });
        [err, bulkOperation] = await to(model.subject_skills.bulkCreate(skills_subject_payload));
      }

      if(table == 'grades' && payload.subjectIds) {
        let grade_subjects_payload = payload.subjectIds.map(ele => {
          obj = {};
          obj.grade_id = response.id;
          obj.subject_id = ele
          return obj;
        });
        console.log(grade_subjects_payload);
        [err, bulkOperation] = await to(model.grade_subjects.bulkCreate(grade_subjects_payload));
      }
      
      // schools bulk operation
      if(table == 'schools' && payload.board_ids) {
        let reformPayload = payload.board_ids.map(ele => {
          let obj = {};
          obj.school_id = response.id;
          obj.board_id = ele
          return obj;
        });
        console.log(model.school_boards);
        [err, bulkOperation] = await to(model.school_boards.bulkCreate(reformPayload));
      }
      if(table == 'schools' && payload.grade_ids) {
        let reformPayload = payload.grade_ids.map(ele => {
          let obj = {};
          obj.school_id = response.id;
          obj.grade_id = ele
          return obj;
        });
        [err, bulkOperation] = await to(model.school_grades.bulkCreate(reformPayload));
      }
      if(table == 'schools' && payload.subject_ids) {
        let reformPayload = payload.subject_ids.map(ele => {
          let obj = {};
          obj.school_id = response.id;
          obj.subject_id = ele
          return obj;
        });
        [err, bulkOperation] = await to(model.school_subjects.bulkCreate(reformPayload));
      }

      return ReS(res, { data: response }, 200);
    } catch (err) {
      console.log(err);
      return ReE(res, err, 422);
    }
}
module.exports.createMeta = createMeta

// update meta data
const updateMeta = async function (req, res) {
    let err, response;
    let payload = req.body;
    let tableName = req.params.table;
    if(masterTableMapping[tableName] === undefined) {
        return ReE(res, {message: "bad request"}, 400);
    }
    if(req.params && req.params.id == undefined) {
      return ReE(res, {message: "ID is required for update entry"}, 422);
    }
    try {
      let table = masterTableMapping[tableName];
      if(table && table.name) {
        table = table.name;
      }
      [err, response] = await to(model[table].findOne({where: {id: req.params.id}}));

      if(table == 'skills' && payload.subject_ids) {
        let deleteobj = await to(model.subject_skills.destroy({where: {skill_id: req.params.id}, force: true }));
        let skills_subject_payload = payload.subject_ids.map(ele => {
          obj = {};
          obj.subject_id = ele;
          obj.skill_id = req.params.id
          return obj;
        });
        [err, bulkOperation] = await to(model.subject_skills.bulkCreate(skills_subject_payload));
      }

      if(table == 'levels' && payload.gradeIds) {
        let deleteobj = await to(model.level_grades.destroy({where: {level_id: req.params.id}, force: true }));
        let level_grades_payload = payload.gradeIds.map(ele => {
          obj = {};
          obj.grade_id = ele;
          obj.level_id = response.id
          return obj;
        });
        console.log(level_grades_payload);
        [err, bulkOperation] = await to(model.level_grades.bulkCreate(level_grades_payload));
      }

      if(table == 'grades' && payload.subjectIds) {
        let deleteobj = await to(model.grade_subjects.destroy({where: {grade_id: req.params.id}, force: true }));
        let grade_subjects_payload = payload.subjectIds.map(ele => {
          obj = {};
          obj.grade_id = response.id;
          obj.subject_id = ele
          return obj;
        });
        console.log(grade_subjects_payload);
        [err, bulkOperation] = await to(model.grade_subjects.bulkCreate(grade_subjects_payload));
      }

      if(response == null) {
        return ReE(res, {message: "No data found"}, 422);
      }
      response.update(payload); 
      if (err) {
        return ReE(res, err, 422);
      }
      return ReS(res, { data: response }, 200);
    } catch (err) {
      return ReE(res, err, 422);
    }
}
module.exports.updateMeta = updateMeta

// update meta data
const deleteMeta = async function (req, res) {
  let err, response;
  let payload = req.body;
  let tableName = req.params.table;
  if(masterTableMapping[tableName] === undefined) {
      return ReE(res, {message: "bad request"}, 400);
  }
  if(req.params && req.params.id == undefined) {
    return ReE(res, {message: "ID is required for update entry"}, 422);
  }
  try {
    let table = masterTableMapping[tableName];
    if(table && table.name) {
      table = table.name;
    }
    [err, response] = await to(model[table].findOne({where: {id: req.params.id}}));
    if(response == null) {
      return ReE(res, {message: "No data found"}, 422);
    }
    response.destroy();
    if (err) {
      return ReE(res, err, 422);
    }
    return ReS(res, { data: "Row data has been deleted" }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.deleteMeta = deleteMeta


const bulkDeleteMeta = async function (req, res) {
  let err, response;
  let payload = req.body;
  let tableName = req.params.table;
  if(req.query && req.query.ids == undefined) {
    return ReE(res, {message: "IDs is required for update entry"}, 422);
  }
  try {
    let table = masterTableMapping[tableName];
    if(table && table.name) {
      table = table.name;
    }

    if(table === undefined) {
      return ReE(res, {message: "bad request"}, 400);
    }
    console.log("testst", table);
    [err, response] = await to(model[table].destroy({where: { id: {[Op.in]: req.query.ids.split(',')} } }));
    if (err) {
      return ReE(res, err, 422);
    }
    return ReS(res, { data: "Row data has been deleted" }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.bulkDeleteMeta = bulkDeleteMeta

const locationDistrictMasterImport = async function (req, res) {
  let response = null;
  const schema = {
    'District Name': {
      prop: 'district_name',
      type: String,
    },
  }
  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + `/../../public/assets/${req.body.filename}`)), { schema }).then( async (rows, errors) => {
     //console.log("test.............", JSON.stringify(rows,null, 4))
      var unique = Array.from(new Set(rows.rows.map(JSON.stringify))).map(JSON.parse);
      let data = unique.map(ele => {
        ele.state_id = req.body.state_id;
        return ele;
      });
      console.log("test...........", data, data.length);
      if(req.query && req.query.generate) {
        // await to(model.districts.destroy({
        //     where: {
        //       district_name: data.map(ele => {
        //         return ele.district_name
        //       })
        //     }
        //   })
        //   );
        [err, response] = await to(model.districts.bulkCreate(data));
      }
      return ReS(res, { data: data, count: data.length }, 200);
    });
    } catch (err) {
      return ReE(res, err, 422);
    }
}
module.exports.locationDistrictMasterImport = locationDistrictMasterImport;



const locationTalukasMasterImport = async function (req, res) {
  let response = null, data = null;
  const schema = {
    'District Name': {
      prop: 'district_name',
      type: String,
    },
    'Taluka': {
      prop: 'taluka_name',
      type: String,
    },
  }
  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + `/../../public/assets/${req.body.filename}`)), { schema }).then( async (rows, errors) => {
     //console.log("test.............", JSON.stringify(rows,null, 4))
      // var unique = Array.from(new Set(rows.rows.map(JSON.stringify))).map(JSON.parse);
      // let data = unique.map(ele => {
      //   ele.state_id = req.body.state_id;
      //   return ele;
      // });
      // console.log("test...........", data);
      // if(req.query && req.query.generate) {
      //   // await to(model.districts.destroy({
      //   //     where: {
      //   //       district_name: data.map(ele => {
      //   //         return ele.district_name
      //   //       })
      //   //     }
      //   //   })
      //   //   );
      //   [err, response] = await to(model.districts.bulkCreate(data));
      // }
      rows.rows = rows.rows.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.district_name === value.district_name && t.taluka_name === value.taluka_name
        ))
      )

      let getLetDistrictList = rows.rows.map(ele=>{ return ele.district_name; });

      [err, districtIds] = await to(model.districts.findAll({
        where: {district_name: {
          [Op.in]: [...new Set(getLetDistrictList)]
        }},
        raw: true
      }));

      let districtProcessIdss = {};
      districtIds.forEach(element => {
        districtProcessIdss[element.district_name] = element.id;
      });

      let payloadGenerate = rows.rows.map(ele => {
        return {
          district_id: districtProcessIdss[ele.district_name],
          taluka_name: ele.taluka_name
        }
      });

      if(req.query && req.query.generate) {
        [err, response] = await to(model.talukas.bulkCreate(payloadGenerate));
      }
      console.log( payloadGenerate.length);
      return ReS(res, { data: payloadGenerate, count: payloadGenerate.length }, 200);
    });
    } catch (err) {
      return ReE(res, err, 422);
    }
}
module.exports.locationTalukasMasterImport = locationTalukasMasterImport;


const locationTalukasCitiesMasterImport = async function (req, res) {
  let response = null, data = null;

  if(req.body && req.body.country_id == undefined) {
    return ReE(res, " Country id is required", 422);
  }
  const schema = {
    'District Name': {
      prop: 'district_name',
      type: String,
    },
    'Taluka': {
      prop: 'taluka_name',
      type: String,
    },
    'City': {
      prop: 'city_name',
      type: String,
    },
  }
  try {
    readXlsxFile(fs.readFileSync( path.join(__dirname + `/../../public/assets/${req.body.filename}`)), { schema }).then( async (rows, errors) => {
      
      // rows.rows = rows.rows.filter((value, index, self) =>
      //   index === self.findIndex((t) => (
      //     t.district_name == value.district_name && t.taluka_name == value.taluka_name && t.city_name == value.city_name
      //   ))
      // )

      console.log(rows.rows.length);

      let getLetDistrictList = rows.rows.map (ele => { return ele.taluka_name; });
      [err, districtIds] = await to(model.talukas.findAll({
        where: { taluka_name: {
          [Op.in]: [...new Set(getLetDistrictList)]
        }},
        include: [
          {
            model: model.districts,
            attributes: ['state_id']
          }
        ],
        raw: true
      }));

      let payloadGenerate = [];

      let districtProcessIdss = {};
      districtIds.forEach(element => {
        districtProcessIdss[element.taluka_name] = {
          state_id : element['district.state_id'],
          taluka_id: element['id'],
          district_id: element['district_id'] 
        };
      });

      payloadGenerate = rows.rows.map(ele => {
        return {
          district_id: districtProcessIdss[ele.taluka_name].district_id,
          state_id: districtProcessIdss[ele.taluka_name].state_id,
          taluka_id: districtProcessIdss[ele.taluka_name].taluka_id,
          city_name: ele.city_name,
          country_id: req.body.country_id
        }
      });
      console.log("cities", payloadGenerate.length);
      if(req.query && req.query.generate) {
        [err, response] = await to(model.cities.bulkCreate(payloadGenerate));
      }
      // console.log( payloadGenerate.length);
      return ReS(res, { data: payloadGenerate }, 200);
    });
    } catch (err) {
      return ReE(res, err, 422);
    }
}
module.exports.locationTalukasCitiesMasterImport = locationTalukasCitiesMasterImport;