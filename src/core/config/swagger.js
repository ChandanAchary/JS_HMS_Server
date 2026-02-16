/**
 * Swagger / OpenAPI Configuration
 * API documentation and specification
 */

export const swaggerConfig = {
  openapi: '3.1.0',
  info: {
    title: 'Jeevan Surakshyaa Hospital Management System',
    description: 'Comprehensive hospital management, patient care, and diagnostic system',
    version: '1.0.0',
    contact: {
      name: 'Hospital IT Support',
      email: 'support@jeevansurakshyaa.com',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local Development',
    },
    {
      url: 'https://api.jeevansurakshyaa.com/api',
      description: 'Production',
    },
  ],
  paths: {
    // ============== AUTHENTICATION ==============
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },

    // ============== PATIENTS ==============
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'Get all patients',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'List of patients' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Patients'],
        summary: 'Create new patient',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'integer' },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                },
                required: ['name', 'phone'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Patient created' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/patients/{patientId}': {
      get: {
        tags: ['Patients'],
        summary: 'Get patient by ID',
        parameters: [{ name: 'patientId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Patient details' },
          404: { description: 'Patient not found' },
        },
      },
      put: {
        tags: ['Patients'],
        summary: 'Update patient',
        parameters: [{ name: 'patientId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Patient updated' },
          404: { description: 'Patient not found' },
        },
      },
    },

    // ============== BILLING ==============
    '/billing/bills': {
      get: {
        tags: ['Billing'],
        summary: 'Get all bills',
        parameters: [
          { name: 'paymentStatus', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'List of bills' },
        },
      },
      post: {
        tags: ['Billing'],
        summary: 'Create bill',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  patientId: { type: 'string' },
                  services: { type: 'array' },
                  totalAmount: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Bill created' },
        },
      },
    },

    // ============== PHARMACY ==============
    '/pharmacy/drugs': {
      get: {
        tags: ['Pharmacy'],
        summary: 'Get all drugs',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'List of drugs' },
        },
      },
      post: {
        tags: ['Pharmacy'],
        summary: 'Add new drug',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  drugName: { type: 'string' },
                  drugCode: { type: 'string' },
                  category: { type: 'string' },
                  strength: { type: 'string' },
                  costPrice: { type: 'number' },
                  sellingPrice: { type: 'number' },
                },
                required: ['drugName', 'drugCode', 'category', 'strength', 'costPrice', 'sellingPrice'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Drug added' },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/pharmacy/inventory': {
      get: {
        tags: ['Pharmacy'],
        summary: 'Get inventory',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'Inventory list' },
        },
      },
      post: {
        tags: ['Pharmacy'],
        summary: 'Add inventory stock',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  drugId: { type: 'string' },
                  batchNumber: { type: 'string' },
                  quantity: { type: 'integer' },
                  costPrice: { type: 'number' },
                },
                required: ['drugId', 'batchNumber', 'quantity', 'costPrice'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Inventory added' },
        },
      },
    },
    '/pharmacy/dispense': {
      post: {
        tags: ['Pharmacy'],
        summary: 'Dispense prescription',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  patientName: { type: 'string' },
                  items: { type: 'array' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Prescription dispensed' },
        },
      },
    },
    '/pharmacy/alerts/low-stock': {
      get: {
        tags: ['Pharmacy'],
        summary: 'Get low stock alerts',
        responses: {
          200: { description: 'List of low stock drugs' },
        },
      },
    },
    '/pharmacy/alerts/expiring': {
      get: {
        tags: ['Pharmacy'],
        summary: 'Get expiring drugs',
        parameters: [
          { name: 'daysThreshold', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: {
          200: { description: 'List of expiring drugs' },
        },
      },
    },

    // ============== REPORTS ==============
    '/reports/patient/visit-statistics': {
      get: {
        tags: ['Reports'],
        summary: 'Get patient visit statistics',
        parameters: [
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Visit statistics' },
        },
      },
    },
    '/reports/financial/revenue': {
      get: {
        tags: ['Reports'],
        summary: 'Get revenue report',
        parameters: [
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Revenue statistics' },
        },
      },
    },
    '/reports/audit/activity-logs': {
      get: {
        tags: ['Reports'],
        summary: 'Get audit logs',
        parameters: [
          { name: 'fromDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'toDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'entity', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Audit logs' },
        },
      },
    },
    '/reports/export/csv': {
      post: {
        tags: ['Reports'],
        summary: 'Export report as CSV',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reportType: { type: 'string' },
                  data: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'CSV file' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          patientId: { type: 'string' },
          name: { type: 'string' },
          age: { type: 'integer' },
          gender: { type: 'string' },
          phone: { type: 'string', format: 'phone' },
          address: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Bill: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          billId: { type: 'string' },
          patientId: { type: 'string' },
          totalAmount: { type: 'number' },
          paymentStatus: { type: 'string' },
          billDate: { type: 'string', format: 'date-time' },
        },
      },
      Drug: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          drugName: { type: 'string' },
          drugCode: { type: 'string' },
          category: { type: 'string' },
          strength: { type: 'string' },
          costPrice: { type: 'number' },
          sellingPrice: { type: 'number' },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export default swaggerConfig;

















