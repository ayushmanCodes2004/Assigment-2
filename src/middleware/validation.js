const {
  registrationSchema,
  loginSchema,
  taskSchema,
  taskUpdateSchema
} = require('../utils/validationSchemas');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const validateRegistration = validate(registrationSchema);
const validateLogin = validate(loginSchema);
const validateTask = validate(taskSchema);
const validateTaskUpdate = validate(taskUpdateSchema);

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask,
  validateTaskUpdate
};