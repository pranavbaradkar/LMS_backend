let masterTableMapping = {
  clusters: "clusters",
  "clusters_meta": "clusters_meta",
  brands: { 
    name: "brands", 
    belongs: [ { name: "clusters", attributes: ['name'] } ] 
  },
  boards: "boards",
  grades: { 
    name: "grades", 
    belongs: [ 
      { name: "boards", attributes: ['name'] },
      { name: "levels", attributes: ['name'] }
    ]
  },
  levels: {
    name: "levels", 
    belongs: [ 
      { name: "schools", attributes: ['name'] },
      { name: "boards", attributes: ['name'] }
    ]
  },
  skills: { 
    name: "skills", 
    belongs: [ 
      { name: "grades", attributes: ['name'] },
      { name: "levels", attributes: ['name'] }
    ]
  },
  subjects: { 
    name: "subjects", 
    belongs: [ 
      { name: "subject_categories", attributes: ['name'] },
      { name: "grades", attributes: ['name'] },
      { name: "levels", attributes: ['name'] }
    ]
  },
  countries: "countries",
  "employee-types": "employee_types",
  states: "states",
  cities: "cities", 
  districts: "districts",
  talukas: "talukas",
  schools: { 
    name: "schools", 
    belongs: [ 
      { name: "clusters", attributes: ['name'] },
      { name: "brands", attributes: ['name'] },
      { name: "cities", attributes: [['city_name', 'name']] },
      { name: "countries", attributes: [['country_name', 'name']] },
      { name: "states", attributes: [['state_name', 'name']] } ,
      { name: "districts", attributes: [['district_name', 'name']] },
      { name: "talukas", attributes: [['taluka_name', 'name']] }
    ]
  },
  institutes: "institutes",
  "subject-categories": "subject_categories",
  "school-subjects": "school_subjects",
  "subject-skills": "subject_skills",
  "learning-objectives": "learning_objectives",
  "lo-skills": "lo_skills",
  "lo-subjects": "lo_subjects"
};
module.exports.masterTableMapping = masterTableMapping;