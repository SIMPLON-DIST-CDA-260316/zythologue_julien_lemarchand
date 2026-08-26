/**
 * Attache `sendItem`/`sendCollection` à `res` — producteur réel des formes
 * décrites par `ApiResponse`/`ApiListResponse`. À monter tôt, avant les routes.
 * `function`, pas arrow : `this` doit être le `res` courant après `.status()`.
 */
export default (req, res, next) => {
  res.sendItem = function (data) {
    return this.json({ data });
  };
  res.sendCollection = function (data, total = data.length) {
    return this.json({ data, meta: { total } });
  };
  next();
};
