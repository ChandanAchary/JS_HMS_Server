/**
 * Billing Service
 * Business logic for billing operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BillRepository, CounterRepository } from './billing.repository.js';
import { 
  formatBill, 
  formatPatientWithBills, 
  formatBillingLoginResponse, 
  parseServiceItem 
} from './billing.dto.js';
import { 
  validateBillingLogin, 
  isBillingRole, 
  validatePatientCreate, 
  validateServices, 
  validatePaymentInput 
} from './billing.validators.js';
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError,
  ConflictError 
} from '../../shared/exceptions/AppError.js';

// Helper functions
const pad = (n, length = 3) => String(n).padStart(length, '0');

const getShortDateKey = (d = new Date()) => {
  const y = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${mm}${dd}`; // YYMMDD
};

export class BillingService {
  constructor(prisma) {
    this.prisma = prisma;
    this.billRepository = new BillRepository(prisma);
    this.counterRepository = new CounterRepository(prisma);
    this.serviceCatalog = null;
    this.serviceMap = null;
  }

  /**
   * Lazy load service catalog
   */
  async loadCatalog() {
    if (!this.serviceCatalog) {
      const mod = await import('../../constants/serviceCatalog.js');
      this.serviceCatalog = mod.SERVICE_CATALOG;
      this.serviceCategories = mod.SERVICE_CATEGORIES;
      this.serviceMap = mod.SERVICE_MAP;
    }
  }

  /**
   * Generate patient ID
   */
  async generatePatientId() {
    const shortDate = getShortDateKey();
    const counterId = `PAT${shortDate}`;
    const seq = await this.counterRepository.nextSequence(counterId);
    
    if (!Number.isFinite(seq)) {
      throw new Error('Invalid sequence received while generating patient ID');
    }
    
    return `PAT${shortDate}${pad(seq, 4)}`;
  }

  /**
   * Generate bill ID
   */
  async generateBillId() {
    const shortDate = getShortDateKey();
    const counterId = `BILL${shortDate}`;
    const seq = await this.counterRepository.nextSequence(counterId);
    
    if (!Number.isFinite(seq)) {
      throw new Error('Invalid sequence received while generating bill ID');
    }
    
    return `${shortDate}${pad(seq, 3)}`;
  }

  /**
   * Billing employee login
   */
  async login(credentials) {
    validateBillingLogin(credentials);

    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { email: credentials.emailOrPhone.trim().toLowerCase() },
          { phone: credentials.emailOrPhone.trim() }
        ]
      }
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (!isBillingRole(employee.role)) {
      throw new ForbiddenError('Access denied. Only billing employees can access this portal.');
    }

    const isMatch = await bcrypt.compare(credentials.password, employee.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid password');
    }

    // Update login status
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        isLoggedIn: true,
        lastLoginAt: new Date()
      }
    });

    const token = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return formatBillingLoginResponse(employee, token);
  }

  /**
   * Create patient
   */
  async createPatient(data, hospitalId) {
    // Ensure hospitalId is provided (controller should set it, but validate here as a safeguard)
    if (!hospitalId) {
      throw new ValidationError('hospitalId is required');
    }

    validatePatientCreate(data);

    // Check for existing patient
    const existing = await this.prisma.patient.findFirst({
      where: { phone: data.phone, hospitalId }
    });

    if (existing) {
      return {
        message: 'Patient already exists',
        patient: existing,
        isExisting: true
      };
    }

    // Generate patient ID
    const patientId = await this.generatePatientId();

    // Create patient
    try {
      const patient = await this.prisma.patient.create({
        data: {
          patientId,
          name: data.name,
          age: data.age || null,
          gender: data.gender || null,
          phone: data.phone,
          address: data.address || "",
          hospital: {
            connect: { id: hospitalId }
          }
        }
      });

      return {
        message: 'Patient created successfully',
        patient,
        isExisting: false
      };
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('phone')) {
          throw new ConflictError('A patient with this phone number already exists');
        }
        if (error.meta?.target?.includes('patientId')) {
          throw new ConflictError('Patient ID conflict. Please try again.');
        }
      }
      throw error;
    }
  }

  /**
   * Get patient by patientId
   */
  async getPatient(patientId, hospitalId) {
    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return { patient };
  }

  /**
   * Search patients
   */
  async searchPatients(query, hospitalId) {
    if (!query?.trim()) {
      throw new ValidationError("Query parameter 'q' is required");
    }

    const q = query.trim();

    const patients = await this.prisma.patient.findMany({
      where: {
        hospitalId,
        OR: [
          { patientId: { equals: q } },
          { patientId: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return { success: true, patients };
  }

  /**
   * Get service catalog
   */
  async getCatalog() {
    await this.loadCatalog();
    return { 
      catalog: this.serviceCatalog, 
      categories: this.serviceCategories 
    };
  }

  /**
   * Create bill for patient
   */
  async createBill(patientId, data, hospitalId, createdBy) {
    await this.loadCatalog();

    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Extract emergency and visit type flags
    const { 
      services = [], 
      paymentMode = 'Cash',
      isEmergency = false,
      visitType = 'OPD',
      departmentCode = null,
      autoQueue = true  // Enable auto-queue by default
    } = data;
    
    validateServices(services);

    // Normalize and validate services against catalog
    const normalizedServices = [];
    let totalAmount = 0;

    for (const item of services) {
      const parsed = parseServiceItem(item);

      if (!parsed.serviceName || !parsed.category) {
        throw new ValidationError('Each service must have a category and a service name');
      }

      const key = `${parsed.category}::${parsed.serviceName}`;
      const catalogEntry = this.serviceMap.get(key);

      if (!catalogEntry) {
        throw new ValidationError(`Unknown service: ${parsed.serviceName} in category ${parsed.category}`);
      }

      let unitPrice = parsed.unitPrice;
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        unitPrice = Number(catalogEntry.defaultPrice);
      }

      const amount = parsed.quantity * unitPrice;

      normalizedServices.push({
        serviceName: catalogEntry.serviceName,
        category: catalogEntry.category,
        quantity: parsed.quantity,
        unitPrice,
        amount
      });

      totalAmount += amount;
    }

    // Generate bill ID
    const billId = await this.generateBillId();

    // Create bill with emergency flag
    const bill = await this.prisma.bill.create({
      data: {
        billId,
        hospitalId,
        patientId,
        services: normalizedServices,
        totalAmount,
        paymentMode,
        paymentStatus: 'UNPAID',
        isEmergency,
        visitType,
        departmentCode,
        createdBy: createdBy || null
      }
    });

    // Auto-queue the patient if enabled
    let queueResult = null;
    if (autoQueue && normalizedServices.length > 0) {
      try {
        const { QueueService } = await import('../queue/queue.service.js');
        const queueService = new QueueService(this.prisma);
        
        queueResult = await queueService.autoQueueFromBilling({
          billId: bill.id,
          patientId,
          isEmergency,
          visitType,
          departmentCode,
          services: normalizedServices
        }, hospitalId, createdBy);
      } catch (error) {
        // Log but don't fail the bill creation if queue fails
        console.error('Auto-queue failed:', error.message);
        queueResult = { error: error.message };
      }
    }

    return {
      message: 'Bill created successfully',
      bill: formatBill(bill),
      queue: queueResult
    };
  }

  /**
   * List bills for patient
   */
  async listBills(patientId, hospitalId) {
    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    const bills = await this.billRepository.findByPatientId(patientId, hospitalId);

    return formatPatientWithBills(patient, bills);
  }

  /**
   * Get single bill
   */
  async getBill(billId, hospitalId) {
    const bill = await this.billRepository.findByBillId(billId, hospitalId);

    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    const patient = await this.prisma.patient.findFirst({
      where: { patientId: bill.patientId, hospitalId }
    });

    return { bill: formatBill(bill), patient };
  }

  /**
   * Get bill by patient and bill ID
   */
  async getBillByPatientAndBillId(patientId, billId, hospitalId) {
    const bill = await this.billRepository.findByPatientAndBillId(patientId, billId, hospitalId);

    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    const patient = await this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });

    return { bill: formatBill(bill), patient };
  }

  /**
   * Receive payment (lock bill)
   */
  async receivePayment(billId, paymentData, hospitalId) {
    const bill = await this.billRepository.findByBillId(billId, hospitalId);

    if (!bill) {
      throw new NotFoundError('Bill not found');
    }

    if (bill.paymentStatus === 'PAID') {
      throw new ValidationError('Bill has already been paid');
    }

    const { paymentMode, paymentDetails } = validatePaymentInput(paymentData);

    const updatedBill = await this.billRepository.update(bill.id, {
      paymentStatus: 'PAID',
      paymentMode,
      paymentDetails,
      lockedAt: new Date()
    });

    return {
      message: 'Payment recorded successfully',
      bill: formatBill(updatedBill)
    };
  }
}

export default BillingService;
