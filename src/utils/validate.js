const Joi = require('joi');

const nameSchema = Joi.string()
    .min(3)
    .max(50).
    required().
    messages({
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

module.exports = {
  nameSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
};
