import BaseResponse from "./base_response"

class ErrorResponse {
    constructor(code, message, errors) {
        return new BaseResponse(code, message, undefined, errors)
    }
}

export default ErrorResponse