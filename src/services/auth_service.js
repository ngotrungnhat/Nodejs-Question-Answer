import UserDAO from "../daos/user_dao"
import CommonError from "../commons/errors/common_error"
import { ResponseCode, ResponseBodyCode } from "../commons/consts/response_consts"
import { UserType } from "../commons/consts/user_consts"
import UserSchema from "../schemas/user_schema"

const userDAO = new UserDAO()

class AuthService {
    async authenticateNormalUser(requestBody) {
        const { email, password } = requestBody
        const user = await userDAO.getUserByEmail(email)

        if (!user || user.type !== UserType.NORMAL_USER) {
            throw new CommonError(ResponseCode.UNAUTHORIZED, ResponseBodyCode.LOGIN.USER_NOT_FOUND, "User not found")
        }

        if (!user.isActive) {
            throw new CommonError(ResponseCode.UNAUTHORIZED, ResponseBodyCode.LOGIN.USER_NOT_ACTIVE, "User not active")
        }

        const isMatchPassword = await user.isMatchPasswordSync(password)

        if (!isMatchPassword) {
            throw new CommonError(ResponseCode.UNAUTHORIZED, ResponseBodyCode.LOGIN.PASSWORD_INCORRECT, "Password incorrect")
        }

        const result = this.getResult(user)

        return result
    }

    async authenticateSSOUser(requestBody, userType) {
        const { email } = requestBody
        let user = await userDAO.getUserByEmail(email)

        const userTypeStr = userType === UserSchema.FB_USER ? "Facebook" : "Google"
        if (user) {
            if (user.type !== userType){
                throw new CommonError(ResponseCode.UNAUTHORIZED, undefined, `This user is not ${userTypeStr} user`)
            }
            user = new UserSchema(Object.assign(user, requestBody))
        } else {
            user = new UserSchema(Object.assign({type: userType}, requestBody))
        }

        await userDAO.insertRecord(user)

        const result = this.getResult(user)

        return result
    }

    getResult(user) {
        const { email, firstName, lastName } = user
        const accessToken = user.generateAccessToken()

        const result = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            access_token: accessToken
        }

        return result
    }
}

export default AuthService