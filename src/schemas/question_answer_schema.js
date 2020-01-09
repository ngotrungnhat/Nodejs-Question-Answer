import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";
import { Collection } from "../commons/consts/database_consts";

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

const QuestionAnswerSchema = new Schema(
    {
        question: {
            type: ObjectId
        },
        content: String,
        creator: {
            type: ObjectId
        },
        voteCount: {
            type: Number,
            default: 0
        },
        replyCount: {
            type: Number,
            default: 0
        }
    },
    {
        collection: Collection.QUESTION_ANSWER
    }
);

QuestionAnswerSchema.plugin(timestamps);

export default mongoose.model("QuestionAnswerSchema", QuestionAnswerSchema);
