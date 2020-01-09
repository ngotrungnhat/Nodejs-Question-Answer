class CommonError {
    constructor(statusCode, bodyCode, message, errors) {
        this.statusCode = statusCode
        this.bodyCode = bodyCode
        this.message = message
        this.errors = errors
    }
}

export default CommonError