import express from "express";
import { addReview, getReviewsForSkill } from "../controllers/reviewController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
router.post('/', auth, addReview);
router.get('/:skillId', getReviewsForSkill);
export default router;
