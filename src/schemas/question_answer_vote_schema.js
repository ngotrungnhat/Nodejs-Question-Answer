import mongoose from "mongoose"
import timestamps from "mongoose-timestamp"
import { Collection } from "../commons/consts/database_consts"

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const QuestionAnswerVoteSchema = new Schema({
    answer: {
        type: ObjectId
    },
    user: {
        type: ObjectId
    }
}, {
    collection: Collection.QUESTION_ANSWER_VOTE
})

QuestionAnswerVoteSchema.plugin(timestamps)

export default mongoose.model("QuestionAnswerVoteSchema", QuestionAnswerVoteSchema)