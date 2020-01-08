import UserSchema from "../schemas/user_schema";
import BaseDAO from "./base_dao";

class UserDAO extends BaseDAO {
  constructor() {
    super(UserSchema);
  }

  async getUserByEmail(email) {
    const conditions = {
      email: email
    };
    const user = await /*this.schema*/ UserSchema.findOne(conditions);
    return user;
  }

  async getUserBychangePasswordCode(code) {
    const conditions = {
      "changePasswordCode.code": code
    };
    const user = await /*this.schema*/ UserSchema.findOne(conditions);
    return user;
  }
}

export default UserDAO;
