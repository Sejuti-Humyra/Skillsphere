import Skill from "../models/Skill.js";
import User from "../models/User.js";

export const createSkill = async (req, res) => {
  try {
    const { title, description, tags, price, location } = req.body;
    const skill = await Skill.create({ title, description, tags, owner: req.user._id, price, location });
    await User.findByIdAndUpdate(req.user._id, { $push: { skills: skill._id }});
    res.status(201).json(skill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const q = req.query.q;
    const filter = { active: true };
    if (q) filter.$text = { $search: q };
    const skills = await Skill.find(filter).populate('owner', 'name');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
