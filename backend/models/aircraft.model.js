module.exports = (sequelize, Sequelize) => {
  const Aircraft = sequelize.define("aircraft", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    registrationNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    serialNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    model: {
      type: Sequelize.STRING,
      allowNull: false
    },
    manufacturer: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Airbus'
    },
    yearOfManufacture: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    totalFlightHours: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    totalCycles: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    lastMaintenanceDate: {
      type: Sequelize.DATE
    },
    nextMaintenanceDate: {
      type: Sequelize.DATE
    },
    status: {
      type: Sequelize.ENUM('active', 'maintenance', 'grounded', 'retired'),
      defaultValue: 'active'
    },
    configuration: {
      type: Sequelize.JSON
    },
    notes: {
      type: Sequelize.TEXT
    }
  });

  return Aircraft;
};
