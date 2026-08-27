import pool from "#config/database.js";

export default {
  // ! stub, pas encore de requete — faux objet renvoye tel quel.
  // TODO : doit recupérer l'id de la biere. voire comment on peut implementer un create one polymorphique qui pourra traiter la creation des relation de maniere generique. sinon un handler specifique pour chaque relation. mais pas terrible.
  createOne: async (filename, url, caption) => {
    // TODO : ajouter le code pour faire le INSERT dans la table de relation. creer la relation avec la biere.
    const stub = {
      id: 1,
      url,
      caption,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return stub;
  },
};
