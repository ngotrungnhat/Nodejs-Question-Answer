export const ErrorCode = {
  INVALID_PARAM: "Invalid parameter",
  CONFLICT: "Conflict",
  RESOURCE_NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden"
};

export const ErrorMessage = {
  VALIDATION_FAILED: "Validation failed",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  CONFLICT: "Conflict"
};

export const LocationType = {
  BODY: "body",
  QUERY: "query"
};

export const ResponseCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  VALIDATION_FAILED: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const ResponseBodyCode = {
  COMMON: {
    OK: "ok"
  },
  LOGIN: {
    USER_NOT_FOUND: "user_not_found",
    USER_NOT_ACTIVE: "user_not_active",
    PASSWORD_INCORRECT: "password_incorrect"
  },
  TOKEN_AUTH: {
    NO_TOKEN: "no_token",
    INVALID_TOKEN: "invalid_token"
  },
  ACTIVE_USER: {
    CODE_NOT_MATCH: "code_not_match",
    CODE_EXPIRED: "code_expired"
  }
};
