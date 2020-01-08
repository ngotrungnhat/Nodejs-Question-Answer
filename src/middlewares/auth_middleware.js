import RequestUtils from "../utils/request_utils"
import { ResponseCode, ResponseBodyCode } from "../commons/consts/response_consts"
import CommonError from "../commons/errors/common_error"
import config from "../utils/config"

export const verifyAuth = (req, res, next) => {
    const token = RequestUtils.getTokenFromRequest(req)

    if (!token) {
        throw new CommonError(ResponseCode.UNAUTHORIZED, ResponseBodyCode.TOKEN_AUTH.NO_TOKEN, "No token provided")
    }

    try {
        const decodedToken = RequestUtils.decodeToken(token, config.token.secret_key)
        req.decodedToken = decodedToken
        next()
    } catch (error) {
        throw new CommonError(ResponseCode.UNAUTHORIZED, ResponseBodyCode.TOKEN_AUTH.INVALID_TOKEN, "Failed to authenticate token")
    }
}