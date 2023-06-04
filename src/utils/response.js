const StatusCodes = {
  SUCCESS: 0,
  ERROR_VALIDATION: -1,
  ERROR_NOT_FOUND: -2,
  ERROR_DATABASE: -3,
  ERROR_AUTHENTICATION: -4,
  ERROR_AUTHORIZATION: -5,
  ERROR_EXPIRED_TOKEN: -6,
  ERROR_REVOKED_TOKEN: -7,
  ERROR_INVALID_TOKEN: -8,
  ERROR_INVALID_TOKEN: -9,
};

const sendSuccessResponse = (res, statusCode, data) => {
  const {message} = statusCodes.find((s) => s.code === statusCode);
  res.status(statusCode).json({statusCode, statusMessage: message, data});
};

const sendErrorResponse = (res, statusCode, data) => {
  const {message} = statusCodes.find((s) => s.code === statusCode);
  res.status(statusCode).json({statusCode, statusMessage: message, data});
};

module.exports = {StatusCodes, sendSuccessResponse, sendErrorResponse};
