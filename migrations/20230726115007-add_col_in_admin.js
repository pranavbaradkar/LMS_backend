// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     return [
//       queryInterface.addColumn("admins", "school_ids", {
//         type: 'jsonb USING CAST("school_ids" as jsonb)',
//         allowNull: true
//       })
//     ];
//   },

//   async down (queryInterface, Sequelize) {
//     return [
//       queryInterface.removeColumn('admins', 'school_ids'),
//     ]
//   }
// }
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('admins', 'school_ids', {
        // type: 'JSONB USING CAST("school_ids" as JSONB)',
        // allowNull: true,
        // defaultValue: null
        type: Sequelize.JSONB, // Set the data type to JSONB
        allowNull: true,
        defaultValue: null,
        query: 'USING CAST("school_ids" as JSONB)', // Use the query option for the USING clause
      });
     
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
          // return [
          //   queryInterface.removeColumn('admins', 'school_ids'),
          // ]
        
  }
};
