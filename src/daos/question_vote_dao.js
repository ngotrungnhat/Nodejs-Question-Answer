import BaseDAO from "./base_dao"
import QuestionVoteSchema from "../schemas/question_vote_schema"

class QuestionVoteDAO extends BaseDAO {
    constructor() {
        super(QuestionVoteSchema)
    }

    async getVote(userId, questionId) {
        const conditions = {
            user: userId,
            question: questionId
        }

        const vote = await this.schema.findOne(conditions)

        return vote
    }

    async deleteVoteByQuestion(questionId) {
        const conditions = {
            question: questionId
        }

        await this.schema.deleteMany(conditions)
    }
}

export default QuestionVoteDAO