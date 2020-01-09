class BaseResponse {
    constructor(code, message, data, errors) {
        if (code) this.code = code
        if (message) this.message = message
        if (data) this.data = data
        if (errors) this.errors = errors
    }
}

export default BaseResponse