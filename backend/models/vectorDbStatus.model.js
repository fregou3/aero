module.exports = (sequelize, Sequelize) => {
  const VectorDbStatus = sequelize.define("vectorDbStatus", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    isInitialized: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indique si la base vectorielle est initialisée"
    },
    documentCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Nombre de documents indexés dans la base vectorielle"
    },
    lastUpdated: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Date de la dernière mise à jour du statut"
    }
  });

  return VectorDbStatus;
};
