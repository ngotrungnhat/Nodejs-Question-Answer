  
class ApiError {
    constructor(code, message, locationType, location) {
        this.code = code
        this.message = message
        this.locationType = locationType
        this.location = location
    }
}

export default ApiError