import express from "express"
import { signup, login, sendOtp, verifyOtp } from "../controllers/auth.js";
import { getAllUsers, updateProfile } from "../controllers/users.js"
import auth from "../middleware/auth.js"

const router = express.Router();

router.post('/signup',signup)
router.post('/login', login)
router.post('/sendotp', sendOtp)
router.post('/verifyotp', verifyOtp)
// router.post('/sendotpemail', sendOtpEmail)
// router.post('/verifyotpemail', verifyOtpEmail)

router.get('/getAllUsers', getAllUsers)
router.patch('/update/:id', auth, updateProfile)

export default router