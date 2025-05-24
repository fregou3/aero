module.exports = (sequelize, Sequelize) => {
  const MaintenanceTask = sequelize.define("maintenanceTask", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    taskNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.ENUM('scheduled', 'unscheduled', 'inspection', 'repair', 'modification'),
      allowNull: false
    },
    priority: {
      type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    status: {
      type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'deferred', 'cancelled'),
      defaultValue: 'pending'
    },
    estimatedDuration: {
      type: Sequelize.FLOAT // in hours
    },
    actualDuration: {
      type: Sequelize.FLOAT // in hours
    },
    scheduledStartDate: {
      type: Sequelize.DATE
    },
    scheduledEndDate: {
      type: Sequelize.DATE
    },
    actualStartDate: {
      type: Sequelize.DATE
    },
    actualEndDate: {
      type: Sequelize.DATE
    },
    aircraftId: {
      type: Sequelize.UUID,
      references: {
        model: 'aircraft',
        key: 'id'
      }
    },
    relatedPartIds: {
      type: Sequelize.ARRAY(Sequelize.UUID)
    },
    requiredCertifications: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    requiredTools: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    requiredParts: {
      type: Sequelize.JSON
    },
    documentReferences: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    notes: {
      type: Sequelize.TEXT
    }
  });

  return MaintenanceTask;
};
