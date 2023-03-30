import express from "express"
import { AskQuestion, getAllQuestions, deleteQuestion, voteQuestion } from "../controllers/AskQuestion.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post('/Ask', auth, AskQuestion)
router.get('/get', getAllQuestions)
router.delete('/delete/:id', auth, deleteQuestion)
router.patch('/vote/:id', auth, voteQuestion)

export default router