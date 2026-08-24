// Valide un paramètre de route avec un schéma zod et remplace la valeur brute
// par la valeur parsée (coercition incluse) avant d'atteindre le contrôleur.
export default (schema) => (req, res, next, rawValue, paramName) => {
  const { success, error, data } = schema.safeParse(rawValue);
  if (!success) return res.status(400).json({ errors: error.issues });
  req.params[paramName] = data;
  next();
};
