import BaseResponse from "./base_response";

class SuccessResponse {
  constructor(code, message, data) {
    return new BaseResponse(code, message, data);
  }
}

export default SuccessResponse;
