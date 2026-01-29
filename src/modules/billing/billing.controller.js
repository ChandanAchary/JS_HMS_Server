/**
 * Billing Controller
 * HTTP request handlers for billing operations
 */

import { BillingService } from './billing.service.js';
import ApiResponse from '../../shared/dtos/ApiResponse.js';
import { HttpStatus } from '../../shared/constants/HttpStatus.js';

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
    const result = await service.createPatient(req.body, req.user.hospitalId);
    
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
