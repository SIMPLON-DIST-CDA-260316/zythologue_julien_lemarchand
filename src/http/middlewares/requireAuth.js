export default (req, res, next) => {
  console.log("hello from requireAuth middleware ");
  // stub : on suppose que le token est valide
  next();
};
