import { ResponseCode } from "../commons/consts/response_consts"

class BaseController {
    constructor(service) {
        this.service = service
        this.getRecordById = this.getRecordById.bind(this)
        this.deleteRecordById = this.deleteRecordById.bind(this)
    }

    async getRecordById(req, res, next) {
        const requestParams = req.params
        const { recordId } = requestParams

        const record = await this.service.getRecordById(recordId)

        return res.status(ResponseCode.OK).json(record)
    }

    async deleteRecordById(req, res, next) {
        const requestParams = req.params
        const { recordId } = requestParams

        await this.service.deleteRecordById(recordId)

        return res.status(ResponseCode.NO_CONTENT).send()
    }
}

export default BaseController