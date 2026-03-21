// Generic validation middleware placeholder.
// You can plug in Joi/Zod/express-validator schemas as the project grows.
const validate = (_schema) => {
  return (req, _res, next) => {
    req.validated = req.body;
    next();
  };
};

export default validate;
