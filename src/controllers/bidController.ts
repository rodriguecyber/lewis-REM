import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Property from '../models/Property';
import Bid from '../models/Bid';
import { AppError } from '../middleware/errorHandler';

export const createBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId, amount, message } = req.body;

    const property = await Property.findById(propertyId);

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check if property is available
    if (property.status !== 'available') {
      res.status(400).json({ success: false, message: 'Property is not available for bidding' });
      return;
    }

    // Check if user is not the owner
    if (property.owner.toString() === req.user!._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot bid on your own property' });
      return;
    }

    // Check if user already has a pending bid
    const existingBid = await Bid.findOne({
      property: propertyId,
      bidder: req.user!._id,
      status: 'pending',
    });

    if (existingBid) {
      res.status(400).json({ success: false, message: 'You already have a pending bid on this property' });
      return;
    }

    const bid = await Bid.create({
      property: propertyId,
      bidder: req.user!._id,
      amount,
      message,
    });

    // Add bid to property
    property.bids.push(bid._id);
    await property.save();

    await bid.populate('bidder', 'name email');
    await bid.populate('property', 'title price');

    res.status(201).json({
      success: true,
      message: 'Bid created successfully',
      data: { bid },
    });
  } catch (error) {
    next(error);
  }
};

export const getBids = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { propertyId } = req.query;

    const query: any = {};

    // If propertyId is provided, filter by property
    if (propertyId) {
      query.property = propertyId;
    }

    // If user is not admin, only show their own bids or bids on their properties
    if (req.user!.role !== 'admin') {
      const userProperties = await Property.find({ owner: req.user!._id }).select('_id');
      const propertyIds = userProperties.map((p) => p._id);

      query.$or = [
        { bidder: req.user!._id },
        { property: { $in: propertyIds } },
      ];
    }

    const bids = await Bid.find(query)
      .populate('property', 'title price')
      .populate('bidder', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bids },
    });
  } catch (error) {
    next(error);
  }
};

export const getBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('property', 'title price owner')
      .populate('bidder', 'name email');

    if (!bid) {
      res.status(404).json({ success: false, message: 'Bid not found' });
      return;
    }

    // Check authorization
    const property = await Property.findById(bid.property);
    const isOwner = property?.owner.toString() === req.user!._id.toString();
    const isBidder = bid.bidder.toString() === req.user!._id.toString();

    if (!isOwner && !isBidder && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to view this bid' });
      return;
    }

    res.json({
      success: true,
      data: { bid },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBidStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status. Must be accepted or rejected' });
      return;
    }

    const bid = await Bid.findById(req.params.id).populate('property');

    if (!bid) {
      res.status(404).json({ success: false, message: 'Bid not found' });
      return;
    }

    const property = bid.property as any;

    // Check if user is the property owner or admin
    if (property.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to update this bid' });
      return;
    }

    bid.status = status;
    await bid.save();

    // If accepted, update property status and reject other bids
    if (status === 'accepted') {
      property.status = 'pending';
      await Bid.updateMany(
        {
          property: property._id,
          _id: { $ne: bid._id },
          status: 'pending',
        },
        { status: 'rejected' }
      );
      await property.save();
    }

    await bid.populate('bidder', 'name email');
    await bid.populate('property', 'title price');

    res.json({
      success: true,
      message: `Bid ${status} successfully`,
      data: { bid },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      res.status(404).json({ success: false, message: 'Bid not found' });
      return;
    }

    // Check if user is the bidder or admin
    if (bid.bidder.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this bid' });
      return;
    }

    // Remove bid from property
    await Property.findByIdAndUpdate(bid.property, {
      $pull: { bids: bid._id },
    });

    await Bid.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bid deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

