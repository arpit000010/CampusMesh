import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import User from "../../models/User.js";

const router = Router();

router.use(authenticate);

// GET /api/users/search?q=ravi
router.get("/search", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { users: [] } });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q.trim(), $options: "i" } },
        { displayName: { $regex: q.trim(), $options: "i" } },
      ],
    })
      .select("username displayName avatar")
      .limit(10);

    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
});

export default router;
