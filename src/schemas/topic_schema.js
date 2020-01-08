import mongoose from "mongoose"
import timestamps from "mongoose-timestamp"
import { Collection } from "../commons/consts/database_consts"

const Schema = mongoose.Schema

const TopicSchema = new Schema({
    name: String,
    desc: String,
    creator: mongoose.Types.ObjectId,
    members: {
        type: Array,
        default: []
    },
    questionCount: {
        type: Number,
        default: 0
    }
}, {
    collection: Collection.TOPIC
})

TopicSchema.plugin(timestamps)

export default mongoose.model("TopicSchema", TopicSchema)