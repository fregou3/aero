module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("notification", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('info', 'warning', 'alert', 'success'),
      defaultValue: 'info'
    },
    priority: {
      type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    category: {
      type: Sequelize.STRING
    },
    relatedEntityType: {
      type: Sequelize.STRING
    },
    relatedEntityId: {
      type: Sequelize.UUID
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: Sequelize.DATE
    },
    expiresAt: {
      type: Sequelize.DATE
    },
    userId: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  });

  return Notification;
};
