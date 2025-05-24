const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.aircraft = require("./aircraft.model.js")(sequelize, Sequelize);
db.aircraftPart = require("./aircraftPart.model.js")(sequelize, Sequelize);
db.maintenanceTask = require("./maintenanceTask.model.js")(sequelize, Sequelize);
db.workOrder = require("./workOrder.model.js")(sequelize, Sequelize);
db.inventoryItem = require("./inventoryItem.model.js")(sequelize, Sequelize);
db.technicalDocument = require("./technicalDocument.model.js")(sequelize, Sequelize);
db.notification = require("./notification.model.js")(sequelize, Sequelize);
db.documentAnalysis = require("./documentAnalysis.model.js")(sequelize, Sequelize);

// Define relationships
db.aircraft.hasMany(db.aircraftPart, { as: "parts" });
db.aircraftPart.belongsTo(db.aircraft, {
  foreignKey: "aircraftId",
  as: "aircraft"
});

db.aircraft.hasMany(db.maintenanceTask, { as: "maintenanceTasks" });
db.maintenanceTask.belongsTo(db.aircraft, {
  foreignKey: "aircraftId",
  as: "aircraft"
});

db.maintenanceTask.hasMany(db.workOrder, { as: "workOrders" });
db.workOrder.belongsTo(db.maintenanceTask, {
  foreignKey: "maintenanceTaskId",
  as: "maintenanceTask"
});

db.user.hasMany(db.workOrder, { as: "assignedWorkOrders" });
db.workOrder.belongsTo(db.user, {
  foreignKey: "assignedToId",
  as: "assignedTo"
});

db.aircraftPart.hasMany(db.inventoryItem, { as: "inventoryItems" });
db.inventoryItem.belongsTo(db.aircraftPart, {
  foreignKey: "aircraftPartId",
  as: "aircraftPart"
});

db.user.hasMany(db.notification, { as: "notifications" });
db.notification.belongsTo(db.user, {
  foreignKey: "userId",
  as: "user"
});

module.exports = db;
