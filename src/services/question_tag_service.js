import QuestionTagDAO from "../daos/question_tag_dao"
import BaseService from "./base_service"

class QuestionTagService extends BaseService {
    constructor() {
        super(new QuestionTagDAO())
    }

    async getRecords(keyword, page, sortRules) {
        const conditions = this._getConditionForGetRecord(keyword)
        const records = await this.dao.getRecords(conditions, page, sortRules)

        return records
    }

    async countRecord(keyword) {
        const conditions = this._getConditionForGetRecord(keyword)
        const result = await this.dao.countRecord(conditions)

        return result
    }

    _getConditionForGetRecord(keyword) {
        return {
            $or: [{
                name: new RegExp(keyword, "i")
            }, {
                desc: new RegExp(keyword, "i")
            }]
        }
    }
}

export default QuestionTagService