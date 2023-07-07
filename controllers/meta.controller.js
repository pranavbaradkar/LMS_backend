const model = require('../models');
const { clusters, brands, levels, grades, subjects, level_grades, grade_subjects, subject_skills, cities, countries, schools, states } = require("../models");
const { to, ReE, ReS, paginate, requestQueryObject, getFilterObject, getFilterObjectWithKey }  = require('../services/util.service');
const { masterTableMapping }  = require('../config/constant');
const { Op } = require('sequelize');

const converter = require('json-2-csv')

brands.belongsTo(clusters, { foreignKey: 'cluster_id' });

model.schools.belongsTo(model.clusters, { foreignKey: 'cluster_id' });
model.schools.belongsTo(model.brands, { foreignKey: 'brand_id' });
model.schools.belongsTo(model.cities, { foreignKey: 'city_id' });
model.schools.belongsTo(model.states, { foreignKey: 'state_id' });
model.schools.belongsTo(model.countries, { foreignKey: 'country_id' });
model.schools.belongsTo(model.talukas, { foreignKey: 'taluka_id' });
model.schools.belongsTo(model.districts, { foreignKey: 'district_id' });


model.skills.belongsTo(model.levels, { foreignKey: 'level_id' });
model.skills.belongsTo(model.grades, { foreignKey: 'grade_id' });
model.skills.hasMany(model.subject_skills, { foreignKey: 'skill_id'});
model.skills.hasMany(model.subject_skills, { foreignKey: 'skill_id', as: 'subjectSkillObjFilter'});
model.subject_skills.belongsTo(model.subjects, { foreignKey: 'subject_id' });


model.schools.hasMany(model.school_boards, { foreignKey: 'school_id', as: 'boards'});
model.schools.hasMany(model.school_boards, { foreignKey: 'school_id', as: 'boardsFilter'});
model.school_boards.belongsTo(model.boards, { foreignKey: 'board_id' });

model.schools.hasMany(model.school_grades, { foreignKey: 'school_id', as: 'grades' });
model.school_grades.belongsTo(model.grades, { foreignKey: 'grade_id' });

model.schools.hasMany(model.school_subjects, { foreignKey: 'school_id', as: 'subjects'});
model.schools.hasMany(model.school_subjects, { foreignKey: 'school_id', as: 'subjectsFilter'});
model.school_subjects.belongsTo(model.subjects, { foreignKey: 'subject_id' });


model.subjects.belongsTo(model.subject_categories, { foreignKey: 'subject_category_id' });
model.subjects.belongsTo(model.grades, { foreignKey: 'grade_id' });
model.subjects.belongsTo(model.levels, { foreignKey: 'level_id' });

model.grades.belongsTo(model.boards, { foreignKey: 'board_id' });
model.grades.belongsTo(model.levels, { foreignKey: 'level_id' });


levels.hasMany(level_grades, { foreignKey: 'level_id' , as: 'gradeIds'});
levels.hasMany(level_grades, { foreignKey: 'level_id' , as: 'gradeIdsFilter'});
model.levels.belongsTo(model.schools, { foreignKey: 'school_id' });
model.levels.belongsTo(model.boards, { foreignKey: 'board_id' });


level_grades.belongsTo(grades, { foreignKey: 'grade_id' });

grades.hasMany(grade_subjects, { foreignKey: 'grade_id',  as: 'subjectIds' });
grades.hasMany(grade_subjects, { foreignKey: 'grade_id',  as: 'subjectIdsFilter' });
grade_subjects.belongsTo(subjects, { foreignKey: 'subject_id' });


// update meta data
const getMeta = async function (req, res) {
  let err, response;
  let tableName = req.params.table;
  let queryParams = {};
  let orData = [];
  if(masterTableMapping[tableName] === undefined && masterTableMapping[tableName] && masterTableMapping[tableName].name === undefined) {
      return ReE(res, {message: "bad request"}, 400);
  }
  try {
    let searchArray = ['name']
    if(req.query && req.query.search) {
      searchArray.forEach(ele => {
        let obj = {};
        obj[ele] = { [Op.iLike]: `%${req.query.search}%`};
        orData.push(obj);
      })
    }

    if(orData.length > 0) {
      queryParams = {...queryParams,...{[Op.or]: orData}}
    } else {
      queryParams = {...queryParams }
    }

    paginateData = {...requestQueryObject(req.query, queryParams)};
    paginateData.distinct = true;

    console.log(paginateData);
    
    let table = masterTableMapping[tableName];
    if(table && table.name) {
      let belongs = table.belongs;
      table = table.name;
      if(belongs) {
        let includes = belongs.map(ele => {
          let obj = {
            model: model[ele.name],
            attributes: ele.attributes,
            require: false
          };
          return obj;
        });
        paginateData.include = includes;
      }
    }

    if(table=='levels') {
      let gradeFilterObj = {
        model: level_grades,
        as: 'gradeIdsFilter',
        attributes: ['grade_id'],
        require: false,
        include: [{
          model: grades,
          attributes: ['name']
        }]
      }
      let gradeObj = {
        model: level_grades,
        as: 'gradeIds',
        attributes: ['grade_id'],
        require: false,
        include: [{
          model: grades,
          attributes: ['name']
        }]
      }
      if(req.query.filter && req.query.filter.grade_id) {
        gradeFilterObj.where = { ...getFilterObjectWithKey(req, 'grade_id') };
      }
      paginateData.include = [...paginateData.include, ...[
        gradeObj,
        gradeFilterObj
      ]]
    }

    if(table=='grades') {
      let subjectObj = {
        model: grade_subjects,
        as: 'subjectIds',
        attributes: ['subject_id'],
        require: false,
        include: [{
          model: subjects,
          attributes: ['name']
        }]
      };
      let subjectObjFilter = {
        model: grade_subjects,
        as: 'subjectIdsFilter',
        attributes: ['subject_id'],
        require: false,
        include: [{
          model: subjects,
          attributes: ['name']
        }]
      };
      if(req.query.filter && req.query.filter.subject_id) {
        subjectObjFilter.where = { ...getFilterObjectWithKey(req, 'subject_id') };
      }
      paginateData.include = [...paginateData.include, ...[
        subjectObj,
        subjectObjFilter
      ]];

      if(req.query.filter && req.query.filter.board_id) {
        paginateData = getFilterObject(req, 'board_id', paginateData);
      }
    }

    if(table == 'skills') {

      let subjectSkillObj =  {
        model: subject_skills,
        attributes: ['subject_id'],
        as: "subject_skills",
        require: false,
        include: [{
          model: subjects,
          require: false,
          attributes: ['name']
        }]
      };
      let subjectSkillObjFilter =  {
        model: subject_skills,
        attributes: ['subject_id'],
        as: 'subjectSkillObjFilter',
        require: false,
        include: [{
          model: subjects,
          require: false,
          attributes: ['name']
        }]
      };
      if(req.query.filter && req.query.filter.subject_id) {
        subjectSkillObjFilter.where = { ...getFilterObjectWithKey(req, 'subject_id') };
        console.log(subjectSkillObjFilter);
      }
      
      paginateData.include = [...paginateData.include, ...[
        subjectSkillObj,
        subjectSkillObjFilter
      ]]
    }

    if(table == 'schools') {
      
      paginateData = getFilterObject(req, 'brand_id', paginateData);
      paginateData = getFilterObject(req, 'cluster_id', paginateData);

      let boardObj = {
        model: model.school_boards,
        attributes: ['board_id'],
        require: false,
        as: "boards",
        include: [{
          model: model.boards,
          attributes: ['name'],
          require: false
        }]
      };
      let boardObjFilter = {
        model: model.school_boards,
        attributes: ['board_id'],
        require: false,
        as: "boardsFilter",
        include: [{
          model: model.boards,
          attributes: ['name'],
          require: false
        }]
      };

      let subjectObj = {
        model: model.school_subjects,
        attributes: ['subject_id'],
        require: false,
        as: "subjects",
        include: [{
          model: model.subjects,
          attributes: ['name'],
          require: false
        }]
      };
      let subjectObjFilter = {
        model: model.school_subjects,
        attributes: ['subject_id'],
        require: false,
        as: "subjectsFilter",
        include: [{
          model: model.subjects,
          attributes: ['name'],
          require: false
        }]
      };

      if(req.query.filter && req.query.filter.board_id) {
        boardObjFilter.where = { ...getFilterObjectWithKey(req, 'board_id') };
      }
      if(req.query.filter && req.query.filter.subject_id) {
        subjectObjFilter.where = { ...getFilterObjectWithKey(req, 'subject_id') };
      }
      paginateData.include = [...paginateData.include, ...[
        {
          model: model.school_grades,
          attributes: ['grade_id'],
          as: "grades",
          require: false,
          include: [{
            model: model.grades,
            attributes: ['name'],
            require: false
          }]
        },
        boardObj,
        boardObjFilter,
        subjectObj,
        subjectObjFilter
      ]]
    }

    if(table == 'subjects') {
      paginateData = getFilterObject(req, 'subject_category_id', paginateData);
    }

    if(req.query) {
      let notConsider = ['pageSize', 'orderBy', 'sortBy', 'page', 'filter', 'search'];
      Object.keys(req.query).forEach(ele => {
        let filter = {};

        if(notConsider.indexOf(ele) == -1 && req.query[ele].split(',').length == 1) {
            filter[ele] = req.query[ele];
        } else if(notConsider.indexOf(ele) == -1) {
            filter[ele] = { [Op.in]: req.query[ele].split(',') }
        }
        paginateData.where = {...paginateData.where, ...filter};
      });
    }

    let considerFilter = ['topics', 'strands', 'sub_strands'];
    if(considerFilter.indexOf(req.params.table) >= 0 && req.query.filter) {
      let filter = {};
      Object.keys(req.query.filter).forEach(ele=> {
        filter[ele] = parseInt(req.query.filter[ele]);
      });
      paginateData.where = {...paginateData.where, ...filter};
    }

    //console.log(req.params.table);


    console.log(JSON.stringify(paginateData.where));

    [err, response] = await to(model[table].findAndCountAll(paginateData));
    
    if(response == null) {
      return ReS(res, {data: {count: 0, rows: []}}, 200);
    }
   
    if (err) {
      return ReE(res, err, 422);
    }
   
    if(table == 'levels') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.gradeIds =  dataObj.gradeIds.map(e => {
          return e.grade && e.grade.name ? { id: e.grade_id, name: e.grade.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'grades') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.subjectIds =  dataObj.subjectIds.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'skills') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.subject_skills =  dataObj.subject_skills.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'schools') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });

        dataObj.grades =  dataObj.grades ? dataObj.grades.map(e => {
          return e.grade && e.grade.name ? { id: e.grade_id, name: e.grade.name } : null
        }).filter(k => k != null) : [];

        dataObj.boards =  dataObj.boards ?  dataObj.boards.map(e => {
          return e.board && e.board.name ? { id: e.board_id, name: e.board.name } : null
        }).filter(k => k != null) : [];

        dataObj.subjects =  dataObj.subjects ? dataObj.subjects.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null) : [];
        return dataObj;
      })
    }
    

    return ReS(res, { data: response }, 200);
  } catch (err) {
    console.log(err);
    return ReE(res, err, 422);
  }
}
module.exports.getMeta = getMeta

const getSingleMeta = async function (req, res) {
  let err, response;
  let tableName = req.params.table;
  let queryParams = req.params ? req.params : {};
  if(masterTableMapping[tableName] === undefined && masterTableMapping[tableName] && masterTableMapping[tableName].name === undefined) {
      return ReE(res, {message: "bad request"}, 400);
  }

  try {
    let obj = {id: queryParams.id}
    let paginateData =  { 
      where: obj
    };
   
    let table = masterTableMapping[tableName];
    if(table && table.name) {
      let belongs = table.belongs;
      table = table.name;
      if(belongs) {
        let includes = belongs.map(ele => {
          return {
            model: model[ele.name],
            attributes: ele.attributes
          }
        });
        paginateData.include = includes;
      }
    }

    if(table=='levels') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: level_grades,
          as: 'gradeIds',
          attributes: ['grade_id'],
          require: false,
          include: [{
            model: grades,
            attributes: ['name']
          }]
        }
      ]]
    }

    if(table=='grades') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: grade_subjects,
          as: 'subjectIds',
          attributes: ['subject_id'],
          require: false,
          include: [{
            model: subjects,
            attributes: ['name']
          }]
        }
      ]]
    }

    if(table == 'skills') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: subject_skills,
          attributes: ['subject_id'],
          require: false,
          include: [{
            model: subjects,
            attributes: ['name']
          }]
        }
      ]]
    } 

    console.log(paginateData);
    [err, response] = await to(model[table].findOne(paginateData));
    console.log(response);
    if(response == null) {
      return ReE(res, {message: "No data found"}, 422);
    }
   
    if (err) {
      return ReE(res, err, 422);
    }
   
    if(table == 'levels') {
      response.gradeIds = response.gradeIds.gradeIds.map(e => {
        return e.grade && e.grade.name ? { id: e.grade_id, name: e.grade.name } : null
      }).filter(k => k != null);
    }

    if(table == 'grades') {
      response.subjectIds = response.subjectIds.map(e => {
        return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
      }).filter(k => k != null);
    }

    if(table == 'skills') {
      response.subject_skills = response.subject_skills.map(e => {
        return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
      }).filter(k => k != null);
    }

    return ReS(res, { data: response }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.getSingleMeta = getSingleMeta



let countryData = [];

const updateCountryData = async function () {

[err, response] = await to(model.countries.findAll({ where: {country_code : {
  [Op.is]: null
}}, raw: true}));
  console.log(response.length);
  response.forEach(async element => {
      let findObj = countryData.find(e => e.name == element.country_name);
      if(findObj != undefined) {
        console.log(findObj);

        //[err, userUpdate] = await to(model.countries.update({ country_code: findObj.dial_code, iso_code: findObj.code }, { where: { id: element.id } }));
    
      }
      console.log(element);
  });
}

const exportMeta = async function (req, res) {
  let err, response;
  let tableName = req.params.table;
  let queryParams = {};
  let orData = [];
  if(masterTableMapping[tableName] === undefined && masterTableMapping[tableName] && masterTableMapping[tableName].name === undefined) {
      return ReE(res, {message: "bad request"}, 400);
  }
  try {
    let searchArray = ['name']
    if(req.query && req.query.search) {
      searchArray.forEach(ele => {
        let obj = {};
        obj[ele] = { [Op.iLike]: `%${req.query.search}%`};
        orData.push(obj);
      })
    }
    

    if(orData.length > 0) {
      queryParams = {...queryParams,...{[Op.or]: orData}}
    } else {
      queryParams = {...queryParams }
    }

    paginateData = {...requestQueryObject(req.query, queryParams)};
    paginateData.distinct = true;

    console.log(paginateData);
    
    let table = masterTableMapping[tableName];
    if(table && table.name) {
      let belongs = table.belongs;
      table = table.name;
      if(belongs) {
        let includes = belongs.map(ele => {

          if(req.query && req.query.search) {
            return {
              model: model[ele.name],
              attributes: ele.attributes,
              require: false
            }
          } else {
            return {
              model: model[ele.name],
              attributes: ele.attributes,
              require: false
            }
          }

          
        });
        paginateData.include = includes;
      }
    }

    if(table=='levels') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: level_grades,
          as: 'gradeIds',
          attributes: ['grade_id'],
          require: false,
          include: [{
            model: grades,
            attributes: ['name']
          }]
        }
      ]]
    }

    if(table=='grades') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: grade_subjects,
          as: 'subjectIds',
          attributes: ['subject_id'],
          require: false,
          include: [{
            model: subjects,
            attributes: ['name']
          }]
        }
      ]]
    }

    if(table == 'skills') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: subject_skills,
          attributes: ['subject_id'],
          require: false,
          include: [{
            model: subjects,
            require: false,
            attributes: ['name']
          }]
        }
      ]]
    }

    if(table == 'schools') {
      paginateData.include = [...paginateData.include, ...[
        {
          model: model.school_grades,
          attributes: ['grade_id'],
          as: "grades",
          require: false,
          include: [{
            model: model.grades,
            attributes: ['name'],
            require: false
          }]
        },
        {
          model: model.school_boards,
          attributes: ['board_id'],
          require: false,
          as: "boards",
          include: [{
            model: model.boards,
            attributes: ['name'],
            require: false
          }]
        },
        {
          model: model.school_subjects,
          attributes: ['subject_id'],
          require: false,
          as: "subjects",
          include: [{
            model: model.subjects,
            attributes: ['name'],
            require: false
          }]
        }
      ]]
    }

    console.log("test", paginateData);
    [err, response] = await to(model[table].findAndCountAll(paginateData));
    
    if(response == null) {
      return ReE(res, {message: "No data found"}, 422);
    }
   
    if (err) {
      return ReE(res, err, 422);
    }
   
    if(table == 'levels') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.gradeIds =  dataObj.gradeIds.map(e => {
          return e.grade && e.grade.name ? { id: e.grade_id, name: e.grade.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'grades') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.subjectIds =  dataObj.subjectIds.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'skills') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });
        dataObj.subject_skills =  dataObj.subject_skills.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null);
        return dataObj;
      })
    }

    if(table == 'schools') {
      response.rows = response.rows.map((ele) => {
        const dataObj = ele.get({ plain:true });

        dataObj.grades =  dataObj.grades ? dataObj.grades.map(e => {
          return e.grade && e.grade.name ? { id: e.grade_id, name: e.grade.name } : null
        }).filter(k => k != null) : [];

        dataObj.boards =  dataObj.boards ?  dataObj.boards.map(e => {
          return e.board && e.board.name ? { id: e.board_id, name: e.board.name } : null
        }).filter(k => k != null) : [];

        dataObj.subjects =  dataObj.subjects ? dataObj.subjects.map(e => {
          return e.subject && e.subject.name ? { id: e.subject_id, name: e.subject.name } : null
        }).filter(k => k != null) : [];
        return dataObj;
      })
    }

    return ReS(res, { data: response }, 200);
  } catch (err) {
    return ReE(res, err, 422);
  }
}
module.exports.exportMeta = exportMeta


setTimeout(() => {
  //updateCountryData();
}, 2000)