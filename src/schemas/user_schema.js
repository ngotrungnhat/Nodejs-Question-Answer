import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";
import { Collection } from "../commons/consts/database_consts";
import bcrypt from "bcryptjs";
import config from "../utils/config";
import jwt from "jsonwebtoken";
import { UserType } from "../commons/consts/user_consts";

const Schema = mongoose.Schema;
const SALT_ROUND = 10;

const UserSchema = new Schema(
  {
    type: {
      type: Number,
      default: UserType.NORMAL_USER
    },
    password: String,
    email: {
      type: String,
      index: true
    },
    firstName: String,
    lastName: String,
    company: String,
    location: String,
    age: Number,
    aboutMe: String,
    isActive: {
      type: Boolean,
      default: false
    },
    activeCode: {
      code: {
        type: String,
        default: null
      },
      createdAt: {
        type: Number,
        default: 0
      }
    },
    changePasswordCode: {
      code: {
        type: String,
        default: null
      },
      createdAt: {
        type: Number,
        default: 0
      }
    },
    voteCount: {
      type: Number,
      default: 0
    },
    versionKey: false
  },
  {
    collection: Collection.USER
  }
);

UserSchema.methods.generateAccessToken = function() {
  const { _id, email } = this;
  const payload = {
    id: _id,
    email: email
  };
  const options = {
    expiresIn: config.token.lifetimes
  };
  const secret = config.token.secret_key;
  const token = jwt.sign(payload, secret, options);

  return token;
};

UserSchema.methods.isMatchPasswordSync = async function(plainText) {
  const { password } = this;
  const isMatch = await bcrypt.compareSync(plainText, password);
  return isMatch;
};

UserSchema.pre("save", async function(next) {
  const user = this;
  if (user.isDirectModified("password")) {
    const salt = await bcrypt.genSaltSync(SALT_ROUND);
    const hashedWord = await bcrypt.hashSync(user.password, salt);
    user.password = hashedWord;
  }
  return next();
});

UserSchema.plugin(timestamps);

export default mongoose.model("UserSchema", UserSchema);
