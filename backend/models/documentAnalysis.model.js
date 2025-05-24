module.exports = (sequelize, Sequelize) => {
  const DocumentAnalysis = sequelize.define("documentAnalysis", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    filePath: {
      type: Sequelize.STRING,
      allowNull: false,
      // Définir unique via un index plutôt que directement dans la colonne
      comment: "Chemin complet vers le fichier PDF analysé"
    },
    fileName: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "Nom du fichier PDF"
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "Titre du document (généralement le nom du fichier sans extension)"
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "Type de document (Technical, Procedure, Certification, Report, Guide)"
    },
    riskLevel: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "inconnue",
      comment: "Niveau d'urgence pour changement (faible, normale, élevée, inconnue)"
    },
    relevance: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: "Score de pertinence entre 0 et 100"
    },
    keywords: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "[]",
      comment: "Mots-clés extraits du document, stockés au format JSON",
      get() {
        const value = this.getDataValue('keywords');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('keywords', JSON.stringify(value));
      }
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Contenu textuel extrait du document (peut être tronqué)"
    },
    lastAnalyzed: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Date de la dernière analyse"
    },
    fileHash: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Hash du fichier pour détecter les changements"
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['filePath']
      }
    ]
  });

  return DocumentAnalysis;
};
