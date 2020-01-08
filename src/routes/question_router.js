import { Router } from "express"
import * as PermissionMiddleware from "../middlewares/permission_middleware"
import QuestionController from "../controllers/question_controller"

const router = Router()

const questionController = new QuestionController()

router.route("/")
    .post(questionController.createFreeTopicQuestion)
    // .get(questionController.getRecords)

router.get("/my-questions", questionController.getMyQuestions)

router.get("/:recordId", questionController.getRecordById)

router.delete("/:recordId", PermissionMiddleware.validateDeleteQuestionPermission)

router.route("/:recordId")
    .delete(questionController.deleteRecord)
    .patch(questionController.updateRecord)

router.route("/:recordId/votes")
    .post(questionController.voteQuestion)
    .delete(questionController.unVoteQuestion)

export default router