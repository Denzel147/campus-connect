'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'major', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'year', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'campus', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'Rwanda'
    });

    await queryInterface.addColumn('users', 'dorm', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'room_number', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'whatsapp_number', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'academic_interests', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'student'
    });

    await queryInterface.addColumn('users', 'terms_agreed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('users', 'terms_agreed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'major');
    await queryInterface.removeColumn('users', 'year');
    await queryInterface.removeColumn('users', 'campus');
    await queryInterface.removeColumn('users', 'dorm');
    await queryInterface.removeColumn('users', 'room_number');
    await queryInterface.removeColumn('users', 'whatsapp_number');
    await queryInterface.removeColumn('users', 'academic_interests');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'terms_agreed');
    await queryInterface.removeColumn('users', 'terms_agreed_at');
  }
};
