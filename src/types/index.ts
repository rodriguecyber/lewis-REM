import { Request } from 'express';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  PROPERTY_OWNER = 'property_owner',
  PROPERTY_SEEKER = 'property_seeker',
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  CAR = 'car',
  OTHER = 'other',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  SOLD = 'sold',
  RENTED = 'rented',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProperty extends Document {
  owner: IUser['_id'];
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  images: string[];
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    parking?: boolean;
    furnished?: boolean;
    yearBuilt?: number;
    [key: string]: any;
  };
  bids: IBid['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBid extends Document {
  property: IProperty['_id'];
  bidder: IUser['_id'];
  amount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

