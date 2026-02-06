import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Lewis Real Estate Management API',
    version: '1.0.0',
    description: 'A comprehensive real estate management system API with authentication, property management, and bidding features',
    contact: {
      name: 'API Support',
      email: 'support@lewis-re.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Development server',
    },
    {
      url: 'https://api.lewis-re.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          role: {
            type: 'string',
            enum: ['admin', 'property_owner', 'property_seeker'],
            description: 'User role',
          },
          isVerified: {
            type: 'boolean',
            description: 'Email verification status',
          },
        },
      },
      Property: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Property ID',
          },
          owner: {
            $ref: '#/components/schemas/User',
          },
          title: {
            type: 'string',
            description: 'Property title',
          },
          description: {
            type: 'string',
            description: 'Property description',
          },
          type: {
            type: 'string',
            enum: ['house', 'apartment', 'land', 'commercial', 'car', 'other'],
            description: 'Property type',
          },
          status: {
            type: 'string',
            enum: ['available', 'pending', 'sold', 'rented'],
            description: 'Property status',
          },
          price: {
            type: 'number',
            description: 'Property price',
          },
          location: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              zipCode: { type: 'string' },
              country: { type: 'string' },
            },
            required: ['address', 'city', 'state', 'zipCode'],
          },
          images: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of image URLs',
          },
          features: {
            type: 'object',
            description: 'Property-specific features (varies by type)',
            additionalProperties: true,
          },
          bids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of bid IDs',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Bid: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Bid ID',
          },
          property: {
            $ref: '#/components/schemas/Property',
          },
          bidder: {
            $ref: '#/components/schemas/User',
          },
          amount: {
            type: 'number',
            description: 'Bid amount',
          },
          message: {
            type: 'string',
            description: 'Optional message from bidder',
          },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'rejected'],
            description: 'Bid status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          errors: {
            type: 'array',
            items: { type: 'object' },
            description: 'Validation errors (optional)',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and account management',
    },
    {
      name: 'Properties',
      description: 'Property listing and management',
    },
    {
      name: 'Bids',
      description: 'Bidding system for properties',
    },
    {
      name: 'Admin',
      description: 'Admin-only endpoints for system management',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

