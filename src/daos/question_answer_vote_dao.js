import BaseDAO from "./base_dao"
import QuestionAnswerVoteSchema from "../schemas/question_answer_vote_schema"

class QuestionAnswerVoteDAO extends BaseDAO {
    constructor() {
        super(QuestionAnswerVoteSchema)
    }

    async getVote(userId, answerId) {
        const conditions = {
            user: userId,
            answer: answerId
        }

        const vote = await this.schema.findOne(conditions)

        return vote
    }

    async deleteVoteByAnswerId(answerId) {
        const conditions = {
            answer: answerId
        }

        await this.schema.deleteMany(conditions)
    }
}

export default QuestionAnswerVoteDAO