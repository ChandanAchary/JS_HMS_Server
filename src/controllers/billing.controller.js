/**
 * Billing Controller
 * HTTP request handlers for billing operations
 */

import { BillingService } from '../services/billing.service.js';
import ApiResponse from '../shared/ApiResponse.js';
import { HttpStatus } from '../constants/HttpStatus.js';

/**
 * Billing login
 * POST /api/v1/billing/login
 */
export const billingLogin = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.login(req.body);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create patient
 * POST /api/v1/billing/patients
 */
export const createPatient = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);

    // Normalize input: accept both `name` and `patientName` (and `fullName`) for compatibility
    const input = {
      name: req.body.name || req.body.patientName || req.body.fullName || '',
      phone: req.body.phone,
      age: req.body.age,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      email: req.body.email,
      address: req.body.address,
    };

    // Resolve hospitalId from various sources (token, tenant resolver, request) for single-tenant
    const hospitalId = req.user?.hospitalId || req.hospitalId || req.tenantId || req.hospital?.id;

    if (!hospitalId) {
      // If still missing, return a clear error instead of letting Prisma throw
      const err = new Error('hospitalId is required to create a patient');
      err.status = 400;
      throw err;
    }

    const result = await service.createPatient(input, hospitalId);
    
    const status = result.isExisting ? HttpStatus.OK : HttpStatus.CREATED;
    return res.status(status).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient
 * GET /api/v1/billing/patients/:patientId
 */
export const getPatient = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.getPatient(req.params.patientId, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Search patients
 * GET /api/v1/billing/patients/search
 */
export const searchPatients = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.searchPatients(req.query.q, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get service catalog
 * GET /api/v1/billing/catalog
 */
export const getCatalog = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.getCatalog();
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create bill
 * POST /api/v1/billing/patients/:patientId/bills
 */
export const createBill = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.createBill(
      req.params.patientId,
      req.body,
      req.user.hospitalId,
      req.user.id
    );
    
    return res.status(HttpStatus.CREATED).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List bills for patient
 * GET /api/v1/billing/patients/:patientId/bills
 */
export const listBills = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.listBills(req.params.patientId, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single bill
 * GET /api/v1/billing/bills/:billId
 */
export const getBill = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.getBill(req.params.billId, req.user.hospitalId);
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get bill by patient and bill ID
 * GET /api/v1/billing/patients/:patientId/bills/:billId
 */
export const getBillByPatientAndBillId = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.getBillByPatientAndBillId(
      req.params.patientId,
      req.params.billId,
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Receive payment
 * POST /api/v1/billing/bills/:billId/payment
 */
export const receivePayment = async (req, res, next) => {
  try {
    const service = new BillingService(req.tenantPrisma);
    const result = await service.receivePayment(
      req.params.billId,
      req.body,
      req.user.hospitalId
    );
    
    return res.status(HttpStatus.OK).json(
      ApiResponse.success(result, result.message)
    );
  } catch (error) {
    next(error);
  }
};

export default {
  billingLogin,
  createPatient,
  getPatient,
  searchPatients,
  getCatalog,
  createBill,
  listBills,
  getBill,
  getBillByPatientAndBillId,
  receivePayment
};



















