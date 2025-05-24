module.exports = (sequelize, Sequelize) => {
  const TechnicalDocument = sequelize.define("technicalDocument", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    documentNumber: {
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
      type: Sequelize.ENUM('manual', 'bulletin', 'directive', 'report', 'checklist', 'procedure', 'other'),
      allowNull: false
    },
    documentType: {
      type: Sequelize.STRING
    },
    version: {
      type: Sequelize.STRING,
      allowNull: false
    },
    issueDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    effectiveDate: {
      type: Sequelize.DATE
    },
    expiryDate: {
      type: Sequelize.DATE
    },
    status: {
      type: Sequelize.ENUM('draft', 'active', 'superseded', 'archived'),
      defaultValue: 'active'
    },
    author: {
      type: Sequelize.STRING
    },
    approvedBy: {
      type: Sequelize.STRING
    },
    approvalDate: {
      type: Sequelize.DATE
    },
    filePath: {
      type: Sequelize.STRING,
      allowNull: false
    },
    fileType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    fileSize: {
      type: Sequelize.INTEGER // in bytes
    },
    checksum: {
      type: Sequelize.STRING
    },
    keywords: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    aircraftModels: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    relatedPartNumbers: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    relatedDocuments: {
      type: Sequelize.ARRAY(Sequelize.UUID)
    },
    isOcrProcessed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    extractedData: {
      type: Sequelize.JSON
    },
    notes: {
      type: Sequelize.TEXT
    }
  });

  return TechnicalDocument;
};
