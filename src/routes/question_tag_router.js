import { Router } from "express"
import QuestionTagController from "../controllers/question_tag_controller"

const router = Router()

const questionTagController = new QuestionTagController()

router.route("/")
    .get(questionTagController.getRecords)

router.get("/:recordId", questionTagController.getRecordById)

export default router