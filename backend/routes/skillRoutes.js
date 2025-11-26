import express from "express";
import { createSkill, getSkills } from "../controllers/skillController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
router.post('/cskills', auth, createSkill);
router.get('/skills', getSkills);
export default router;
