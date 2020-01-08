import QuestionTagSchema from "../schemas/question_tag_schema"
import BaseDAO from "./base_dao"

class QuestionTagDAO extends BaseDAO {
    constructor() {
        super(QuestionTagSchema)
    }

    async getListTagsByConditions(conditions) {
        const tags = await this.schema.find(conditions)
        return tags
    }

    async getRecords(conditions, page, sortRules) {
        const query = this._getQueryForGetTags(conditions, page, sortRules)
        const tags = await this.schema.aggregate(query)

        return tags
    }

    async countRecord(conditions) {
        const result = await this.schema.countDocuments(conditions)
        return result
    }

    _getQueryForGetTags(conditions, page, sortRules) {
        const query = [{
            $match: conditions
        }]

        query.push({
            $sort: sortRules
        })

        Array.prototype.push.apply(query, [
            {
                $skip: page.skip
            }, {
                $limit: page.limit
            }
        ])

        return query
    }
}

export default QuestionTagDAO