import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import User from '../models/User';
import Property from '../models/Property';
import Bid from '../models/Bid';
import { PropertyStatus, PropertyType, UserRole } from '../types';

export const getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalBids,
      usersByRole,
      propertiesByType,
      propertiesByStatus,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Bid.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Property.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'name email'),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBids,
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        propertiesByType: propertiesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        propertiesByStatus: propertiesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        recentUsers,
        recentProperties,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query: any = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot delete your own account' });
      return;
    }

    // Delete user's properties and bids
    await Property.deleteMany({ owner: user._id });
    await Bid.deleteMany({ bidder: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

