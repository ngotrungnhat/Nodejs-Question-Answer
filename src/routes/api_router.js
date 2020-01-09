import { Router } from "express"
import * as authController from "../controllers/auth_controller"
import * as authMiddleware from "../middlewares/auth_middleware"
import * as PermissionMiddleware from "../middlewares/permission_middleware"

import userRouter from "./user_router"
import topicRouter from "./topic_router"
import questionRouter from "./question_router"
import questionAnswerRouter from "./question_answer_router"
import questionTagRouter from "./question_tag_router"

import QuestionController from "../controllers/question_controller"

const questionController = new QuestionController()
const router = Router()

router.post("/authenticate", authController.authenticateNormalUser)
router.post("/fb-authenticate", authController.authenticateFBUser)
router.post("/gg-authenticate", authController.authenticateGGUser)

router.use("/users", userRouter)
router.use("/question-tags", questionTagRouter)
router.get("/questions", questionController.getRecords)

router.use("/", authMiddleware.verifyAuth)

router.patch("/:type/:recordId/", PermissionMiddleware.validateRecordOwnerPermission)

router.use("/questions", questionRouter)

router.delete("/:type/:recordId", PermissionMiddleware.validateRecordOwnerPermission)

router.use("/topics", topicRouter)
router.use("/question-answers", questionAnswerRouter)

export default router