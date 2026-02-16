/**
 * Diagnostics Billing Integration
 * Connects diagnostic orders with the billing system
 */

import { ValidationError, NotFoundError } from '../shared/AppError.js';

export class DiagnosticsBillingService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Add diagnostic order charges to patient bill
   * @param {string} diagnosticOrderId - The diagnostic order ID
   * @param {string} hospitalId - Hospital ID
   * @param {string} userId - User creating the bill entry
   */
  async addDiagnosticsToBill(diagnosticOrderId, hospitalId, userId) {
    // Get the diagnostic order with items
    const order = await this.prisma.diagnosticOrder.findFirst({
      where: { 
        id: diagnosticOrderId,
        hospitalId 
      },
      include: {
        patient: true,
        orderItems: { include: { test: true } }
      }
    });

    if (!order) {
      throw new NotFoundError('Diagnostic order');
    }

    // Check if already linked to a bill
    if (order.billId) {
      throw new ValidationError('Diagnostic order already linked to a bill');
    }

    // Calculate totals
    let totalAmount = 0;
    const serviceItems = [];

    for (const item of order.orderItems) {
      if (item.status !== 'CANCELLED') {
        totalAmount += item.netPrice;
        
        serviceItems.push({
          type: 'DIAGNOSTIC',
          code: item.testCode,
          name: item.testName,
          category: item.testCategory,
          quantity: 1,
          unitPrice: item.basePrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          totalPrice: item.netPrice,
          diagnosticOrderItemId: item.id
        });
      }
    }

    // Create or update bill
    // First check if patient has an open bill
    let bill = await this.prisma.bill.findFirst({
      where: {
        patientId: order.patient.id,
        hospitalId,
        // Add criteria for "open" bill if you have such a concept
        // For example: status: 'OPEN' or paymentStatus: 'PENDING'
      }
    });

    if (bill) {
      // Update existing bill
      bill = await this.prisma.bill.update({
        where: { id: bill.id },
        data: {
          amount: { increment: totalAmount },
          diagnosticOrders: {
            connect: { id: order.id }
          }
        }
      });
    } else {
      // Create new bill
      bill = await this.prisma.bill.create({
        data: {
          amount: totalAmount,
          hospitalId,
          patientId: order.patient.id,
          employeeId: userId,
          diagnosticOrders: {
            connect: { id: order.id }
          }
        }
      });
    }

    // Update diagnostic order with bill reference
    await this.prisma.diagnosticOrder.update({
      where: { id: order.id },
      data: { billId: bill.id }
    });

    return {
      bill: {
        id: bill.id,
        amount: bill.amount,
        patientId: bill.patientId
      },
      diagnosticCharges: {
        orderId: order.orderId,
        items: serviceItems,
        total: totalAmount
      },
      message: 'Diagnostic charges added to bill successfully'
    };
  }

  /**
   * Get diagnostic charges breakdown for a bill
   * @param {string} billId - Bill ID
   * @param {string} hospitalId - Hospital ID
   */
  async getDiagnosticChargesForBill(billId, hospitalId) {
    const bill = await this.prisma.bill.findFirst({
      where: { id: billId, hospitalId },
      include: {
        diagnosticOrders: {
          include: {
            orderItems: { include: { test: true } },
            patient: true
          }
        }
      }
    });

    if (!bill) {
      throw new NotFoundError('Bill');
    }

    const diagnosticCharges = [];
    let totalDiagnosticAmount = 0;

    for (const order of bill.diagnosticOrders) {
      const orderCharges = {
        orderId: order.orderId,
        orderDate: order.createdAt,
        status: order.status,
        items: order.orderItems.map(item => ({
          testCode: item.testCode,
          testName: item.testName,
          category: item.testCategory,
          basePrice: item.basePrice,
          discountAmount: item.discountAmount,
          taxAmount: item.taxAmount,
          netPrice: item.netPrice,
          status: item.status
        })),
        subtotal: order.totalAmount,
        discount: order.discountAmount,
        tax: order.taxAmount,
        total: order.netAmount
      };

      diagnosticCharges.push(orderCharges);
      totalDiagnosticAmount += order.netAmount;
    }

    return {
      billId: bill.id,
      diagnosticCharges,
      totalDiagnosticAmount,
      insuranceCoverage: bill.diagnosticOrders.reduce((sum, o) => sum + (o.insuranceAmount || 0), 0),
      patientLiability: bill.diagnosticOrders.reduce((sum, o) => sum + (o.patientAmount || 0), 0)
    };
  }

  /**
   * Apply insurance coverage to diagnostic order
   * @param {string} diagnosticOrderId - Diagnostic order ID
   * @param {object} insuranceData - Insurance coverage details
   * @param {string} hospitalId - Hospital ID
   */
  async applyInsuranceCoverage(diagnosticOrderId, insuranceData, hospitalId) {
    const order = await this.prisma.diagnosticOrder.findFirst({
      where: { id: diagnosticOrderId, hospitalId },
      include: { orderItems: true }
    });

    if (!order) {
      throw new NotFoundError('Diagnostic order');
    }

    const {
      coveragePercentage = 0,
      preAuthNumber,
      preAuthStatus = 'PENDING',
      maxCoverage
    } = insuranceData;

    // Calculate insurance amount
    let insuranceAmount = order.netAmount * (coveragePercentage / 100);
    
    // Apply max coverage limit if provided
    if (maxCoverage && insuranceAmount > maxCoverage) {
      insuranceAmount = maxCoverage;
    }

    const patientAmount = order.netAmount - insuranceAmount;

    // Update order with insurance details
    const updated = await this.prisma.diagnosticOrder.update({
      where: { id: order.id },
      data: {
        insuranceCovered: true,
        insuranceAmount,
        patientAmount,
        preAuthNumber,
        preAuthStatus
      }
    });

    return {
      orderId: updated.orderId,
      totalAmount: updated.netAmount,
      insuranceAmount: updated.insuranceAmount,
      patientAmount: updated.patientAmount,
      preAuthNumber: updated.preAuthNumber,
      preAuthStatus: updated.preAuthStatus,
      message: 'Insurance coverage applied successfully'
    };
  }

  /**
   * Apply discount to diagnostic order
   * @param {string} diagnosticOrderId - Diagnostic order ID
   * @param {object} discountData - Discount details
   * @param {string} hospitalId - Hospital ID
   * @param {string} userId - User applying the discount
   */
  async applyDiscount(diagnosticOrderId, discountData, hospitalId, userId) {
    const order = await this.prisma.diagnosticOrder.findFirst({
      where: { id: diagnosticOrderId, hospitalId },
      include: { orderItems: true }
    });

    if (!order) {
      throw new NotFoundError('Diagnostic order');
    }

    const { discountType, discountValue, reason } = discountData;
    
    let discountAmount = 0;
    
    if (discountType === 'PERCENTAGE') {
      discountAmount = order.totalAmount * (discountValue / 100);
    } else if (discountType === 'FIXED') {
      discountAmount = Math.min(discountValue, order.totalAmount);
    }

    const newNetAmount = order.totalAmount + order.taxAmount - discountAmount;
    const newPatientAmount = newNetAmount - (order.insuranceAmount || 0);

    // Update order
    const updated = await this.prisma.diagnosticOrder.update({
      where: { id: order.id },
      data: {
        discountAmount,
        netAmount: newNetAmount,
        patientAmount: newPatientAmount
      }
    });

    // Add to status history
    const statusHistory = order.statusHistory || [];
    statusHistory.push({
      action: 'DISCOUNT_APPLIED',
      discountType,
      discountValue,
      discountAmount,
      reason,
      by: userId,
      timestamp: new Date()
    });

    await this.prisma.diagnosticOrder.update({
      where: { id: order.id },
      data: { statusHistory }
    });

    return {
      orderId: updated.orderId,
      originalAmount: order.totalAmount + order.taxAmount,
      discountAmount: updated.discountAmount,
      netAmount: updated.netAmount,
      patientAmount: updated.patientAmount,
      message: 'Discount applied successfully'
    };
  }

  /**
   * Get insurance verification for tests
   * @param {string[]} testIds - Array of test IDs
   * @param {object} insurancePlan - Insurance plan details
   * @param {string} hospitalId - Hospital ID
   */
  async verifyInsuranceCoverage(testIds, insurancePlan, hospitalId) {
    const tests = await this.prisma.diagnosticTest.findMany({
      where: {
        id: { in: testIds },
        hospitalId
      }
    });

    if (tests.length === 0) {
      throw new NotFoundError('Tests');
    }

    // This is a simplified implementation
    // In a real system, you would integrate with insurance provider APIs
    const coverageResults = {
      coveredTests: [],
      uncoveredTests: [],
      partiallyCorredTests: [],
      totalCost: 0,
      totalCoverage: 0,
      patientLiability: 0,
      preAuthRequired: false
    };

    const coveragePercentage = insurancePlan.coveragePercentage || 80;
    const preAuthThreshold = insurancePlan.preAuthThreshold || 5000;

    for (const test of tests) {
      const testPrice = test.discountedPrice || test.basePrice;
      const taxAmount = testPrice * (test.taxRate / 100);
      const totalPrice = testPrice + taxAmount;
      
      coverageResults.totalCost += totalPrice;

      // Check if test category is covered (simplified logic)
      const isCovered = insurancePlan.coveredCategories 
        ? insurancePlan.coveredCategories.includes(test.category)
        : true;

      if (isCovered) {
        const coverageAmount = totalPrice * (coveragePercentage / 100);
        const patientAmount = totalPrice - coverageAmount;

        coverageResults.coveredTests.push({
          testId: test.id,
          testCode: test.testCode,
          testName: test.testName,
          category: test.category,
          totalPrice,
          coveragePercentage,
          coverageAmount,
          patientAmount
        });

        coverageResults.totalCoverage += coverageAmount;
        coverageResults.patientLiability += patientAmount;
      } else {
        coverageResults.uncoveredTests.push({
          testId: test.id,
          testCode: test.testCode,
          testName: test.testName,
          category: test.category,
          totalPrice,
          reason: 'Category not covered'
        });

        coverageResults.patientLiability += totalPrice;
      }
    }

    // Check if pre-auth is required
    if (coverageResults.totalCoverage > preAuthThreshold) {
      coverageResults.preAuthRequired = true;
    }

    return coverageResults;
  }
}

export default DiagnosticsBillingService;



















