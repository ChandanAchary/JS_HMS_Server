/**
 * Pharmacy Controller
 * Request handlers for pharmacy operations
 */

import { PharmacyService } from '../services/pharmacy.service.js';
import * as dto from './pharmacy.validators.js';
import logger from '../utils/logger.js';

let pharmacyService;

const initializeService = (prisma) => {
  if (!pharmacyService) {
    pharmacyService = new PharmacyService(prisma);
  }
};

// ============== DRUG MANAGEMENT ==============
export const getDrugs = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { category, search, page = 1, limit = 50 } = req.query;

    const filters = {
      category: category || undefined,
      search: search || undefined,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    };

    const drugs = await pharmacyService.getDrugs(hospitalId, filters);
    const formattedDrugs = drugs.map(dto.formatDrug);

    res.json({
      success: true,
      data: formattedDrugs,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /drugs error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDrug = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const userId = req.user.id;
    const drugData = dto.parseDrugInput(req.body);

    const drug = await pharmacyService.createDrug(hospitalId, drugData, userId);

    res.status(201).json({
      success: true,
      data: dto.formatDrug(drug),
    });
  } catch (error) {
    logger.error(`[Pharmacy] POST /drugs error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDrugById = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const { drugId } = req.params;
    const drug = await pharmacyService.getDrugById(drugId);

    res.json({
      success: true,
      data: dto.formatDrug(drug),
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /drugs/:drugId error`, error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
  }
};

export const updateDrug = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const { drugId } = req.params;
    const userId = req.user.id;
    const drugData = dto.parseDrugInput(req.body);

    const drug = await pharmacyService.updateDrug(drugId, drugData, userId);

    res.json({
      success: true,
      data: dto.formatDrug(drug),
    });
  } catch (error) {
    logger.error(`[Pharmacy] PUT /drugs/:drugId error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDrug = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const { drugId } = req.params;
    const userId = req.user.id;

    await pharmacyService.deleteDrug(drugId, userId);

    res.json({ success: true, message: 'Drug deleted successfully' });
  } catch (error) {
    logger.error(`[Pharmacy] DELETE /drugs/:drugId error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== INVENTORY MANAGEMENT ==============
export const addInventory = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const userId = req.user.id;
    const { name } = req.user;

    const inventory = await pharmacyService.addInventory(hospitalId, req.body, userId);

    res.status(201).json({
      success: true,
      data: dto.formatInventory(inventory),
    });
  } catch (error) {
    logger.error(`[Pharmacy] POST /inventory error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { status, expiringIn, page = 1, limit = 50 } = req.query;

    const filters = {
      status: status || undefined,
      expiringIn: expiringIn ? parseInt(expiringIn) : undefined,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    };

    const inventory = await pharmacyService.getInventory(hospitalId, filters);
    const formattedInventory = inventory.map(dto.formatInventory);

    res.json({
      success: true,
      data: formattedInventory,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /inventory error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInventoryByDrug = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { drugId } = req.params;

    const inventory = await pharmacyService.getInventoryByDrug(drugId, hospitalId);
    const formattedInventory = inventory.map(dto.formatInventory);

    res.json({
      success: true,
      data: formattedInventory,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /inventory/drug/:drugId error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const { inventoryId } = req.params;
    // Update is limited to non-critical fields only
    const updateData = {};
    if (req.body.warehouseLocation) updateData.warehouseLocation = req.body.warehouseLocation;
    if (req.body.shelfNumber) updateData.shelfNumber = req.body.shelfNumber;

    const inventory = await pharmacyService.repository.updateInventory(inventoryId, updateData);

    res.json({
      success: true,
      data: dto.formatInventory(inventory),
    });
  } catch (error) {
    logger.error(`[Pharmacy] PUT /inventory/:inventoryId error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== STOCK ALERTS ==============
export const getLowStockAlerts = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const alerts = await pharmacyService.getLowStockAlerts(hospitalId);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /alerts/low-stock error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExpiringDrugs = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { daysThreshold = 30 } = req.query;

    const drugs = await pharmacyService.getExpiringDrugs(hospitalId, parseInt(daysThreshold));

    res.json({
      success: true,
      data: drugs,
      count: drugs.length,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /alerts/expiring error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== TRANSACTIONS ==============
export const getTransactions = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { transactionType, drugId, fromDate, toDate, page = 1, limit = 100 } = req.query;

    const filters = {
      transactionType: transactionType || undefined,
      drugId: drugId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    };

    const transactions = await pharmacyService.repository.getTransactions(hospitalId, filters);
    const formattedTransactions = transactions.map(dto.formatTransaction);

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /transactions error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== DISPENSING ==============
export const dispensePrescription = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const userId = req.user.id;
    const { name } = req.user;

    const dispense = await pharmacyService.dispensePrescription(hospitalId, req.body, userId, name);

    res.status(201).json({
      success: true,
      data: dto.formatDispense(dispense),
    });
  } catch (error) {
    logger.error(`[Pharmacy] POST /dispense error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDispenses = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { paymentStatus, fromDate, toDate, page = 1, limit = 50 } = req.query;

    const filters = {
      paymentStatus: paymentStatus || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    };

    const dispenses = await pharmacyService.getDispenses(hospitalId, filters);
    const formattedDispenses = dispenses.map(dto.formatDispense);

    res.json({
      success: true,
      data: formattedDispenses,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /dispenses error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDispenseById = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const { dispenseId } = req.params;
    const dispense = await pharmacyService.repository.getDispenseById(dispenseId);

    if (!dispense) {
      return res.status(404).json({ success: false, error: 'Dispense not found' });
    }

    res.json({
      success: true,
      data: dto.formatDispense(dispense),
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /dispenses/:dispenseId error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============== REPORTS ==============
export const getInventoryReport = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const report = await pharmacyService.getInventoryReport(hospitalId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /reports/inventory-status error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStockMovementReport = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, error: 'fromDate and toDate are required' });
    }

    const report = await pharmacyService.getStockMovementReport(hospitalId, fromDate, toDate);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /reports/stock-movement error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExpiryReport = async (req, res) => {
  try {
    const { prisma } = req;
    initializeService(prisma);

    const hospitalId = req.user.hospitalId;
    const report = await pharmacyService.getExpiryReport(hospitalId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`[Pharmacy] GET /reports/expiry-analysis error`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};



















