import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import Property from '../models/Property';
import Bid from '../models/Bid';
import { uploadToCloudinary } from '../config/cloudinary';

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, type, price, location, features } = req.body;

    // Upload images to Cloudinary
    const files = req.files as Express.Multer.File[];
    const images: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        images.push(url);
      }
    }

    const property = await Property.create({
      owner: req.user!._id,
      title,
      description,
      type,
      price,
      location,
      features: features || {},
      images,
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      type,
      status,
      city,
      state,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (state) query['location.state'] = new RegExp(state as string, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      success: true,
      data: {
        properties,
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

export const getProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Populate bids if user is authenticated
    if (req.user) {
      await property.populate({
        path: 'bids',
        populate: {
          path: 'bidder',
          select: 'name email',
        },
        options: { sort: { createdAt: -1 } },
      });
    }

    res.json({
      success: true,
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check ownership or admin
    if (property.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    // Handle image updates
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const files = req.files as Express.Multer.File[];
      const newImages: string[] = [];
      
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        newImages.push(url);
      }
      
      req.body.images = [...(property.images || []), ...newImages];
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    // Check ownership or admin
    if (property.owner.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
      return;
    }

    // Delete associated bids
    await Bid.deleteMany({ property: property._id });

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const properties = await Property.find({ owner: req.user!._id })
      .populate('bids')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { properties },
    });
  } catch (error) {
    next(error);
  }
};

