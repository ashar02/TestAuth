const createError = require('http-errors');

const StatusCodes = {
  SUCCESS: 0,
  ERROR_VALIDATION: -1,
  ERROR_NOT_FOUND: -2,
  ERROR_FORBIDDEN_ROLE: -3,
  ERROR_EXPIRED_ACCESS_TOKEN: -4,
  ERROR_REVOKED_ACCESS_TOKEN: -5,
  ERROR_ACCESS_TOKEN: -6,
  ERROR_REFRESH_TOKEN: -7,
  ERROR_INVALID_USER: -8,
  ERROR_INVALID_ROLE: -9,
  ERROR_EXCEPTION: -10,
  ERROR_REVOKED_REFRESH_TOKEN: -11,
  ERROR_ALREADY_TAKEN: -12,
  ERROR_EMAIL_PASSWORD: -13,
  ERROR_INVALID_ISSUER: -14,
  ERROR_INVALID_AUDIENCE: -15,
};

const HttpCodes = {
  OK: 200,
  CREATED: 201,
  TEMPORARY_REDIRECT: 307,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
};

const StatusMessages = {
  [StatusCodes.SUCCESS]: 'Success',
  [StatusCodes.ERROR_VALIDATION]: 'Error in data validation',
  [StatusCodes.ERROR_NOT_FOUND]: 'Resource not found',
  [StatusCodes.ERROR_DATABASE]: 'Database Error',
  [StatusCodes.ERROR_AUTHENTICATION]: 'Authentication Error',
  [StatusCodes.ERROR_FORBIDDEN_ROLE]: 'Access forbidden for current role',
  [StatusCodes.ERROR_EXPIRED_ACCESS_TOKEN]: 'Expired access token',
  [StatusCodes.ERROR_REVOKED_ACCESS_TOKEN]: 'Revoked access token',
  [StatusCodes.ERROR_INVALID_TOKEN]: 'Invalid Token',
  [StatusCodes.ERROR_ACCESS_TOKEN]: 'Access token not found',
  [StatusCodes.ERROR_REFRESH_TOKEN]: 'Refresh token not found',
  [StatusCodes.ERROR_INVALID_USER]: 'Invalid user',
  [StatusCodes.ERROR_INVALID_ROLE]: 'Invalid role',
  [StatusCodes.ERROR_EXCEPTION]: 'Exception',
  [StatusCodes.ERROR_REVOKED_REFRESH_TOKEN]: 'Revoked refresh token',
  [StatusCodes.ERROR_ALREADY_TAKEN]: 'Email already taken',
  [StatusCodes.ERROR_EMAIL_PASSWORD]: 'Either email or password is not correct',
  [StatusCodes.ERROR_INVALID_ISSUER]: 'Token invalid issuer',
  [StatusCodes.ERROR_INVALID_AUDIENCE]: 'Token invalid audience',
};

const sendSuccessResponse = (res, httpCode, statusCode, dataName, data) => {
  const body = {
    statusCode: statusCode,
    statusMessage: StatusMessages[statusCode],
  };
  if (dataName && data) {
    body[dataName] = data;
  }
  res.status(httpCode).json(body);
};

const sendErrorResponse = (next, httpCode, statusCode,
    customMessage, customStack) => {
  const error = createError(httpCode);
  error.statusCode = StatusCodes.ERROR_NOT_FOUND;
  error.message = StatusMessages[statusCode];
  if (customMessage) {
    error.message = customMessage;
  }
  if (customStack) {
    error.message = customStack;
  }
  if (next) {
    next(error);
  }
  return error;
};

module.exports = {
  StatusCodes,
  HttpCodes,
  StatusMessages,
  sendSuccessResponse,
  sendErrorResponse,
};
