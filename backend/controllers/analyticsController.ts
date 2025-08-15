// backend/controllers/analyticsController.ts
import { Request, Response } from 'express';
import Activity from '../models/Activity';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const analytics = await Activity.aggregate([
//       { $match: { user: req.user.id } },
//       { $group: { _id: '$action', count: { $sum: 1 } } }
//     ]);
//     res.json(analytics);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }

 try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ msg: 'Unauthorized' });
      return;
    }
    const analytics = await Activity.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};