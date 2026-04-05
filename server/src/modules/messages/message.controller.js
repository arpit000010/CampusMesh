import * as messageService from "./message.service.js";

// GET /api/rooms/:roomId/messages?page=1&limit=50
export const getRoomMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const messages = await messageService.getRoomMessages(
      req.params.roomId,
      req.user._id,
      { page: parseInt(page) || 1, limit: parseInt(limit) || 50 },
    );

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};
