module.exports = (sequelize, Sequelize) => {
  const InventoryItem = sequelize.define("inventoryItem", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    partNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    serialNumber: {
      type: Sequelize.STRING
    },
    batchNumber: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.STRING
    },
    manufacturer: {
      type: Sequelize.STRING
    },
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    unitOfMeasure: {
      type: Sequelize.STRING,
      defaultValue: 'each'
    },
    minStockLevel: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    reorderPoint: {
      type: Sequelize.INTEGER,
      defaultValue: 5
    },
    location: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM('available', 'reserved', 'in_use', 'defective', 'expired'),
      defaultValue: 'available'
    },
    purchaseDate: {
      type: Sequelize.DATE
    },
    purchasePrice: {
      type: Sequelize.DECIMAL(10, 2)
    },
    supplier: {
      type: Sequelize.STRING
    },
    expiryDate: {
      type: Sequelize.DATE
    },
    certificationDate: {
      type: Sequelize.DATE
    },
    lastInspectionDate: {
      type: Sequelize.DATE
    },
    nextInspectionDate: {
      type: Sequelize.DATE
    },
    aircraftCompatibility: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    notes: {
      type: Sequelize.TEXT
    },
    attachments: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    aircraftPartId: {
      type: Sequelize.UUID,
      references: {
        model: 'aircraftParts',
        key: 'id'
      }
    }
  });

  return InventoryItem;
};
