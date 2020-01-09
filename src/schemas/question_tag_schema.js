import mongoose from "mongoose"
import timestamps from "mongoose-timestamp"
import { Collection } from "../commons/consts/database_consts"

const Schema = mongoose.Schema

const QuestionTagSchema = new Schema({
    name: String,
    desc: String,
    questionCount: {
        type: Number,
        default: 0
    }
}, {
    collection: Collection.QUESTION_TAG
})

QuestionTagSchema.plugin(timestamps)

export default mongoose.model("QuestionTagSchema", QuestionTagSchema)