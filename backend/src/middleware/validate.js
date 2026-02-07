const ApiError = require('../utils/ApiError');

const VALID_CATEGORIES = ['men', 'women'];
const VALID_PLAYOFF_FORMATS = ['knockout', 'ipl', 'wpl'];
const VALID_MATCH_STATUSES = ['upcoming', 'live', 'completed'];
const VALID_MATCH_TYPES = ['group', 'qualifier1', 'eliminator', 'qualifier2', 'semi', 'final'];

function validateUUID(id, name = 'id') {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    throw new ApiError(400, `Invalid ${name} (UUID required)`);
  }
  return id;
}

function validateCategory(category) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`);
  }
  return category;
}

function validatePlayoffFormat(format) {
  if (!VALID_PLAYOFF_FORMATS.includes(format)) {
    throw new ApiError(400, `Invalid playoff format. Use: ${VALID_PLAYOFF_FORMATS.join(', ')}`);
  }
  return format;
}

function validateMatchStatus(status) {
  if (!VALID_MATCH_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid match status. Use: ${VALID_MATCH_STATUSES.join(', ')}`);
  }
  return status;
}

function validateMatchType(type) {
  if (!VALID_MATCH_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid match type. Use: ${VALID_MATCH_TYPES.join(', ')}`);
  }
  return type;
}

module.exports = {
  validateUUID,
  validateCategory,
  validatePlayoffFormat,
  validateMatchStatus,
  validateMatchType,
  VALID_CATEGORIES,
  VALID_PLAYOFF_FORMATS,
  VALID_MATCH_STATUSES,
  VALID_MATCH_TYPES,
};
