import Review from "../models/Review.js";
import Skill from "../models/Skill.js";

export const addReview = async (req, res) => {
  try {
    const { skillId, rating, comment } = req.body;
    const review = await Review.create({ skill: skillId, reviewer: req.user.id, rating, comment });
    // update skill stats
    const agg = await Review.aggregate([
      { $match: { skill: skillId, visible: true } },
      { $group: { _id: "$skill", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Skill.findByIdAndUpdate(skillId, { avgRating: agg[0].avg, reviewsCount: agg[0].count });
    }
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReviewsForSkill = async (req, res) => {
  try {
    const reviews = await Review.find({ skill: req.params.skillId }).populate('reviewer', 'name profilePicture');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
