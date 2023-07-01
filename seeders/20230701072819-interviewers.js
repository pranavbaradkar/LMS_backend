'use strict';

const schoolIds = [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185];
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const interviewers = [];

    // Generate 30 random interviewer names
    for (let i = 1; i <= schoolIds.length; i++) {
      const name = `Interviewer ${i}`;
      const email = `interviewer${i}@example.com`;
      const created_at = 'NOW()';
      const updated_at = 'NOW()';
      const schoolId = schoolIds[(i-1)]; // Replace this with your own logic to get a random school_id

      interviewers.push({ name,email,school_id: schoolId,created_at,updated_at });
      interviewers.push({ name,email,school_id: schoolId,created_at,updated_at });
      interviewers.push({ name,email,school_id: schoolId,created_at,updated_at });
    }

    // Insert the interviewer data into the 'interviewers' table
    await queryInterface.bulkInsert('interviewers', interviewers, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Delete all the inserted data from the 'interviewers' table
    await queryInterface.bulkDelete('interviewers', null, {});
  }
};

function getRandomSchoolId() {
  // Get a random index within the array length
  const randomIndex = Math.floor(Math.random() * schoolIds.length);
  // Get the random element from the array
  const randomElement = schoolIds[randomIndex];

  return randomElement;
}
