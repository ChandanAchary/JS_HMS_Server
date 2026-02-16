/**
 * Pharmacy Service
 * Business logic for drug, inventory, and dispensing operations
 */

import { PharmacyRepository } from './pharmacy.repository.js';
import logger from '../utils/logger.js';

export class PharmacyService {
  constructor(prisma) {
    this.repository = new PharmacyRepository(prisma);
    this.prisma = prisma;
  }

  // ============== DRUG MANAGEMENT ==============
  async createDrug(hospitalId, drugData, userId) {
    try {
      const newDrug = await this.repository.createDrug(hospitalId, {
        ...drugData,
        createdBy: userId,
        updatedBy: userId,
      });

      logger.info(`[Pharmacy] Drug created: ${newDrug.drugCode}`, { hospitalId, userId });
      return newDrug;
    } catch (error) {
      logger.error(`[Pharmacy] Error creating drug`, error);
      throw error;
    }
  }

  async getDrugs(hospitalId, filters) {
    try {
      return await this.repository.getDrugsByHospital(hospitalId, filters);
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching drugs`, error);
      throw error;
    }
  }

  async getDrugById(drugId) {
    try {
      const drug = await this.repository.getDrugById(drugId);
      if (!drug) throw new Error('Drug not found');
      return drug;
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching drug`, error);
      throw error;
    }
  }

  async updateDrug(drugId, drugData, userId) {
    try {
      const updated = await this.repository.updateDrug(drugId, {
        ...drugData,
        updatedBy: userId,
      });

      logger.info(`[Pharmacy] Drug updated: ${updated.drugCode}`, { userId });
      return updated;
    } catch (error) {
      logger.error(`[Pharmacy] Error updating drug`, error);
      throw error;
    }
  }

  async deleteDrug(drugId, userId) {
    try {
      await this.repository.deleteDrug(drugId);
      logger.info(`[Pharmacy] Drug deleted: ${drugId}`, { userId });
    } catch (error) {
      logger.error(`[Pharmacy] Error deleting drug`, error);
      throw error;
    }
  }

  // ============== INVENTORY MANAGEMENT ==============
  async addInventory(hospitalId, inventoryData, userId) {
    try {
      const inventory = await this.repository.addInventory(hospitalId, {
        ...inventoryData,
        totalCost: inventoryData.quantity * inventoryData.costPrice,
        receivedBy: userId,
      });

      // Record transaction
      await this.repository.recordTransaction(hospitalId, {
        drugId: inventory.drugId,
        inventoryId: inventory.id,
        transactionType: 'PURCHASE',
        quantity: inventory.quantity,
        quantityBefore: 0,
        quantityAfter: inventory.quantity,
        unitCost: inventory.costPrice,
        totalCost: inventory.totalCost,
        referenceNumber: inventoryData.purchaseOrderNumber,
        referenceBatchNumber: inventory.batchNumber,
        performedBy: userId,
        performedByName: inventoryData.receivedByName,
      });

      logger.info(`[Pharmacy] Inventory added: ${inventory.batchNumber}`, { hospitalId, userId });
      return inventory;
    } catch (error) {
      logger.error(`[Pharmacy] Error adding inventory`, error);
      throw error;
    }
  }

  async getInventory(hospitalId, filters) {
    try {
      return await this.repository.getInventory(hospitalId, filters);
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching inventory`, error);
      throw error;
    }
  }

  async getInventoryByDrug(drugId, hospitalId) {
    try {
      return await this.repository.getInventoryByDrug(drugId, hospitalId);
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching drug inventory`, error);
      throw error;
    }
  }

  // ============== STOCK CHECKS ==============
  async getLowStockAlerts(hospitalId) {
    try {
      const inventory = await this.repository.getLowStockAlerts(hospitalId);
      
      return inventory
        .filter(inv => inv.quantity <= inv.drug.reorderLevel)
        .map(inv => ({
          drugId: inv.drugId,
          drugName: inv.drug.drugName,
          drugCode: inv.drug.drugCode,
          currentStock: inv.quantity,
          reorderLevel: inv.drug.reorderLevel,
          reorderQuantity: inv.drug.reorderQuantity,
        }));
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching low stock alerts`, error);
      throw error;
    }
  }

  async getExpiringDrugs(hospitalId, daysThreshold) {
    try {
      const drugs = await this.repository.getExpiringDrugs(hospitalId, daysThreshold);
      
      const today = new Date();
      return drugs.map(inv => {
        const daysToExpiry = Math.ceil((inv.expiryDate - today) / (1000 * 60 * 60 * 24));
        return {
          drugId: inv.drugId,
          drugName: inv.drug.drugName,
          drugCode: inv.drug.drugCode,
          batchNumber: inv.batchNumber,
          quantity: inv.quantity,
          expiryDate: inv.expiryDate,
          daysToExpiry,
        };
      });
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching expiring drugs`, error);
      throw error;
    }
  }

  // ============== PRESCRIPTION DISPENSING ==============
  async dispensePrescription(hospitalId, dispenseData, userId, userName) {
    try {
      // Calculate totals
      let subtotal = 0;
      dispenseData.items?.forEach(item => {
        subtotal += item.quantity * item.sellingPrice;
      });

      const taxAmount = subtotal * 0.05; // 5% tax (configurable)
      const totalAmount = subtotal + taxAmount - (dispenseData.discountAmount || 0);

      // Generate dispense ID
      const dispenseId = `DISP${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.random().toString().slice(2, 6)}`;

      const dispense = await this.repository.createDispense(hospitalId, {
        dispenseId,
        items: dispenseData.items,
        patientName: dispenseData.patientName,
        patientPhone: dispenseData.patientPhone,
        subtotal,
        taxAmount,
        discountAmount: dispenseData.discountAmount || 0,
        totalAmount,
        paymentMode: dispenseData.paymentMode,
        paymentStatus: dispenseData.paymentStatus || 'UNPAID',
        dispensedBy: userId,
        dispensedByName: userName,
        prescribingDoctor: dispenseData.prescribingDoctor,
        prescriptionId: dispenseData.prescriptionId,
        billId: dispenseData.billId,
      });

      // Record inventory transactions for each item
      for (const item of dispenseData.items) {
        const inv = await this.repository.getInventoryByDrug(item.drugId, hospitalId);
        if (inv.length > 0) {
          const selectedInv = inv[0]; // FIFO - pick oldest batch
          const newQuantity = selectedInv.quantity - item.quantity;

          // Record transaction
          await this.repository.recordTransaction(hospitalId, {
            drugId: item.drugId,
            inventoryId: selectedInv.id,
            transactionType: 'DISPENSE',
            quantity: item.quantity,
            quantityBefore: selectedInv.quantity,
            quantityAfter: Math.max(0, newQuantity),
            referenceNumber: dispenseId,
            referenceBatchNumber: selectedInv.batchNumber,
            prescriptionId: dispenseData.prescriptionId,
            billId: dispenseData.billId,
            performedBy: userId,
            performedByName: userName,
          });

          // Update inventory
          if (newQuantity <= 0) {
            await this.repository.updateInventory(selectedInv.id, {
              quantity: 0,
              status: 'DEPLETED',
            });
          } else {
            await this.repository.updateInventory(selectedInv.id, {
              quantity: newQuantity,
            });
          }
        }

        logger.info(`[Pharmacy] Drug dispensed: ${item.drugId}, qty: ${item.quantity}`, { dispenseId, userId });
      }

      return dispense;
    } catch (error) {
      logger.error(`[Pharmacy] Error dispensing prescription`, error);
      throw error;
    }
  }

  async getDispenses(hospitalId, filters) {
    try {
      return await this.repository.getDispenses(hospitalId, filters);
    } catch (error) {
      logger.error(`[Pharmacy] Error fetching dispenses`, error);
      throw error;
    }
  }

  // ============== REPORTS ==============
  async getInventoryReport(hospitalId) {
    try {
      const inventory = await this.repository.getInventory(hospitalId, { take: 10000 });
      
      let totalValue = 0;
      const byStatus = {};
      const byDrug = {};

      inventory.forEach(inv => {
        totalValue += inv.totalCost;
        
        byStatus[inv.status] = (byStatus[inv.status] || 0) + inv.quantity;
        byDrug[inv.drug.drugName] = (byDrug[inv.drug.drugName] || 0) + inv.quantity;
      });

      return {
        totalItems: inventory.length,
        totalValue,
        byStatus,
        byDrug,
      };
    } catch (error) {
      logger.error(`[Pharmacy] Error generating inventory report`, error);
      throw error;
    }
  }

  async getStockMovementReport(hospitalId, fromDate, toDate) {
    try {
      const movements = await this.repository.getStockMovement(hospitalId, fromDate, toDate);
      
      const byType = {};
      movements.forEach(m => {
        if (!byType[m.transactionType]) {
          byType[m.transactionType] = 0;
        }
        byType[m.transactionType] += m._sum.quantity || 0;
      });

      return byType;
    } catch (error) {
      logger.error(`[Pharmacy] Error generating stock movement report`, error);
      throw error;
    }
  }

  async getExpiryReport(hospitalId) {
    try {
      const expiring = await this.repository.getExpiringDrugs(hospitalId, 90);
      const expired = await this.repository.getExpiredDrugs(hospitalId);

      return {
        expiringWithin90Days: expiring.length,
        alreadyExpired: expired.length,
        expiringList: expiring.map(inv => ({
          drugName: inv.drug.drugName,
          batchNumber: inv.batchNumber,
          expiryDate: inv.expiryDate,
          quantity: inv.quantity,
        })),
        expiredList: expired.map(inv => ({
          drugName: inv.drug.drugName,
          batchNumber: inv.batchNumber,
          expiryDate: inv.expiryDate,
          quantity: inv.quantity,
        })),
      };
    } catch (error) {
      logger.error(`[Pharmacy] Error generating expiry report`, error);
      throw error;
    }
  }
}



















