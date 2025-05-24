module.exports = (sequelize, Sequelize) => {
  const WorkOrder = sequelize.define("workOrder", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    workOrderNumber: {
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
    status: {
      type: Sequelize.ENUM('created', 'assigned', 'in_progress', 'on_hold', 'completed', 'verified', 'closed'),
      defaultValue: 'created'
    },
    priority: {
      type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    startDate: {
      type: Sequelize.DATE
    },
    endDate: {
      type: Sequelize.DATE
    },
    estimatedHours: {
      type: Sequelize.FLOAT
    },
    actualHours: {
      type: Sequelize.FLOAT
    },
    maintenanceTaskId: {
      type: Sequelize.UUID,
      references: {
        model: 'maintenanceTasks',
        key: 'id'
      }
    },
    assignedToId: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verifiedById: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    partsUsed: {
      type: Sequelize.JSON
    },
    toolsUsed: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    procedures: {
      type: Sequelize.JSON
    },
    notes: {
      type: Sequelize.TEXT
    },
    attachments: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    signatureRequired: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    signedAt: {
      type: Sequelize.DATE
    },
    signedBy: {
      type: Sequelize.UUID
    }
  });

  return WorkOrder;
};
