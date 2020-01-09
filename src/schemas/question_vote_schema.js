import mongoose from "mongoose"
import timestamps from "mongoose-timestamp"
import { Collection } from "../commons/consts/database_consts"

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const QuestionVoteSchema = new Schema({
    question: {
        type: ObjectId
    },
    user: {
        type: ObjectId
    }
}, {
    collection: Collection.QUESTION_VOTE
})

QuestionVoteSchema.plugin(timestamps)

export default mongoose.model("QuestionVoteSchema", QuestionVoteSchema)