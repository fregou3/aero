module.exports = (sequelize, Sequelize) => {
  const AIAnalysis = sequelize.define("aiAnalysis", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    filePath: {
      type: Sequelize.STRING,
      allowNull: false,
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
    documentSummary: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Résumé du document en 10 lignes maximum généré par OpenAI"
    },
    riskAnalysis: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Analyse des risques générée par OpenAI au format texte avec bullet points et notes"
    },
    risksData: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Données structurées des risques au format JSON avec notes sur 100",
      get() {
        const value = this.getDataValue('risksData');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('risksData', JSON.stringify(value));
      }
    },
    globalRiskScore: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Note globale de risque sur 100"
    },
    analysisDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Date et heure de l'analyse"
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "completed",
      comment: "Statut de l'analyse (pending, completed, failed)"
    },
    error: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Message d'erreur en cas d'échec de l'analyse"
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['filePath']
      }
    ]
  });

  return AIAnalysis;
};
