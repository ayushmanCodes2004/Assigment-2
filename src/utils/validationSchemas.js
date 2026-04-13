const Joi = require('joi');

const registrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const taskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  dueDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Due date must be a valid ISO date',
      'any.required': 'Due date is required'
    }),
  status: Joi.string()
    .valid('pending', 'completed')
    .messages({
      'any.only': 'Status must be either "pending" or "completed"'
    })
});

const taskUpdateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  dueDate: Joi.date()
    .iso()
    .messages({
      'date.format': 'Due date must be a valid ISO date'
    }),
  status: Joi.string()
    .valid('pending', 'completed')
    .messages({
      'any.only': 'Status must be either "pending" or "completed"'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  registrationSchema,
  loginSchema,
  taskSchema,
  taskUpdateSchema
};
