const Joi = require('joi');

const nameSchema = Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least {#limit} characters long',
      'string.max': 'Name cannot exceed {#limit} characters',
      'any.required': 'Name is required',
      'string.empty': 'Name is not allowed to be empty',
    });

const emailSchema = Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email is not allowed to be empty',
    });

const passwordSchema = Joi.string()
    .min(6)
    .max(40)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,40}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least {#limit} characters long',
      'string.max': 'Password cannot exceed {#limit} characters',
      'string.pattern.base': 'Password must have at least one lowercase ' +
                          'letter, one uppercase letter, and one digit',
      'any.required': 'Password is required',
      'string.empty': 'Password is not allowed to be empty',
    });

const roleSchema = Joi.string()
    .valid('SuperAdmin', 'CompanyAdmin', 'CompanyEmployee')
    .required()
    .messages({
      'any.only': 'Invalid role provided',
      'any.required': 'Role is required',
      'string.empty': 'Role is not allowed to be empty',
    });

const userIdSchema = Joi.string()
    .alphanum()
    .min(10)
    .max(48)
    .required()
    .messages({
      'string.alphanum': 'User ID must only contain alphanumeric characters',
      'string.min': 'User ID must be at least {#limit} characters long',
      'string.max': 'User ID cannot exceed {#limit} characters',
      'any.required': 'User ID is required',
      'string.empty': 'User ID is not allowed to be empty',
    });

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).max(3000)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least {#limit}',
        'number.max': 'Page cannot exceed {#limit}',
      }),
  limit: Joi.number().integer().min(1).max(500)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least {#limit}',
        'number.max': 'Limit cannot exceed {#limit}',
      }),
}).custom((value, helpers) => {
  const {page, limit} = value;
  if ((page && !limit) || (!page && limit)) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Both page and limit must be present',
});

module.exports = {
  nameSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
  userIdSchema,
  paginationSchema,
};
