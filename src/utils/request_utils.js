import jwt from "jsonwebtoken"
import DataUtils from "./data_utils"

const MAX_LIMIT = 1000
const MIN_LIMIT = 1
const MAX_OFFSET = 99999
const MIN_OFFSET = 0

class RequestUtils {
    static getTokenFromRequest(req) {
        const requestHeaders = req.headers
        return requestHeaders["x-access-token"]
    }

    static decodeToken(token, secretStorage) {
        return jwt.verify(token, secretStorage)
    }

    static getUserIdFromRequest(req) {
        const decodedToken = req.decodedToken
        return decodedToken.id
    }

    static getPage(limit, offset) {
        const errors = []

        if (!this._isValidLimit(limit)) {
            errors.push({
                location: "/limit",
                message: "Invalid limit"
            })
        }

        if (!this._isValidOffset(offset)) {
            errors.push({
                location: "/offset",
                message: "Invalid offset"
            })
        }

        if (errors.length) {
            throw errors
        }

        const pageLimit = DataUtils.isNumber(limit) ? parseInt(limit, 10) : MAX_LIMIT
        const pageSkip = DataUtils.isNumber(offset) ? parseInt(offset, 10) : MIN_OFFSET
        
        const page = {
            limit: pageLimit,
            skip: pageSkip
        }

        return page
    }

    static _isValidLimit(limit) {
        return !limit || (DataUtils.isNumber(limit) && limit <= MAX_LIMIT && limit >= MIN_LIMIT)
    }

    static _isValidOffset(offset) {
        return !offset || (DataUtils.isNumber(offset) && offset <= MAX_OFFSET && offset >= MIN_OFFSET)
    }

    static getDefaultPage() {
        const page = {
            limit: Number.MAX_SAFE_INTEGER,
            skip: 0
        }

        return page
    }

    static parseSort(sort) {
        const result = {_id: 1}

        if (!sort) {
            return result
        }

        sort.split(",").filter(element => element).forEach(element => {
            if (element.startsWith("-") || element.startsWith("+")) {
                if (element.length == 1) {
                    return
                }
                const type = element.substr(0, 1) == "-" ? -1 : 1
                const field = element.substr(1)
                delete result._id
                result[field] = type
            } else {
                delete result._id
                result[element] = 1
            }
        })

        return result
    }
}

export default RequestUtils