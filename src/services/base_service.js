import DataUtils from "../utils/data_utils"
import CommonError from "../commons/errors/common_error"
import { ResponseCode } from "../commons/consts/response_consts"

class BaseService {
    constructor(dao) {
        this.dao = dao
    }

    async createRecord(recordData) {
        
    }

    async deleteRecordById(id) {
        await this.dao.deleteRecordById(id)
    }

    async getRecordById(id) {
        const idObject = DataUtils.string2MongoObjectId(id)

        if (!idObject) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This record does not exists!")
        }

        const record = await this.dao.getRecordById(idObject)

        if (!record) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This record does not exists!")
        }

        return record
    }

    async getRawRecordById(id) {
        if (!DataUtils.isMongoObjectId(id)) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This record does not exists!")
        }

        const record = await this.dao.getRawRecordById(id)

        if (!record) {
            throw new CommonError(ResponseCode.NOT_FOUND, undefined, "This record does not exists!")
        }

        return record
    }

    async updateRecord(record) {
        await this.dao.updateRecord(record)
    }

    async getRawRecordsByIds(ids) {
        const validIds = ids.map(id => DataUtils.string2MongoObjectId(id)).filter(id => id)
        const records = await this.dao.getRawRecordsByIds(validIds)

        return records
    }
}

export default BaseService