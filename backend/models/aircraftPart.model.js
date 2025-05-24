module.exports = (sequelize, Sequelize) => {
  const AircraftPart = sequelize.define("aircraftPart", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    partNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.ENUM(
        'fuselage_front', 
        'fuselage_center', 
        'fuselage_rear', 
        'wing_left', 
        'wing_right', 
        'empennage', 
        'landing_gear', 
        'engine', 
        'avionics', 
        'hydraulics', 
        'electrical'
      ),
      allowNull: false
    },
    subCategory: {
      type: Sequelize.STRING
    },
    manufacturer: {
      type: Sequelize.STRING
    },
    serialNumber: {
      type: Sequelize.STRING
    },
    batchNumber: {
      type: Sequelize.STRING
    },
    installationDate: {
      type: Sequelize.DATE
    },
    lifeLimitHours: {
      type: Sequelize.FLOAT
    },
    lifeLimitCycles: {
      type: Sequelize.INTEGER
    },
    currentHours: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    currentCycles: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.ENUM('installed', 'removed', 'in_repair', 'scrapped'),
      defaultValue: 'installed'
    },
    position: {
      type: Sequelize.STRING
    },
    coordinates: {
      type: Sequelize.JSON
    },
    maintenanceHistory: {
      type: Sequelize.JSON
    },
    aircraftId: {
      type: Sequelize.UUID,
      references: {
        model: 'aircraft',
        key: 'id'
      }
    }
  });

  return AircraftPart;
};
