import mongoose from "mongoose"
import timestamps from "mongoose-timestamp"
import { Collection } from "../commons/consts/database_consts"

const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
    topic: {
        type: ObjectId,
        default: null
    },
    title: String,
    content: String,
    creator: {
        type: ObjectId
    },
    voteCount: {
        type: Number,
        default: 0
    },
    answerCount: {
        type: Number,
        default: 0
    },
    lastAnswer: {
        type: String,
        default: 0
    },
    tags: {
        type: Array,
        default: []
    }
}, {
    collection: Collection.QUESTION
})

QuestionSchema.plugin(timestamps)

export default mongoose.model("QuestionSchema", QuestionSchema)