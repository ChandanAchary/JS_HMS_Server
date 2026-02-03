/**
 * Visit Service
 * Business logic for patient visits
 */

import { VisitRepository } from './visit.repository.js';
import { PatientRepository } from '../patient/patient.repository.js';
import { 
  VISIT_TYPES, 
  VISIT_TYPE_TO_CATEGORY, 
  VISIT_TYPE_TO_QUEUE_TYPE,
  VISIT_STATUS,
  PRIORITY_LEVELS
} from './visit.constants.js';
import { AppError } from '../../shared/exceptions/AppError.js';
import { HttpStatus } from '../../shared/enums/HttpStatus.js';

export class VisitService {
  constructor(prisma) {
    this.prisma = prisma;
    this.visitRepository = new VisitRepository(prisma);
    this.patientRepository = new PatientRepository(prisma);
  }

  /**
   * Generate visit ID (VIS + YYMMDD + sequence)
   */
  async generateVisitId() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `VIS${yy}${mm}${dd}`;

    const counterId = datePrefix;
    
    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return `${datePrefix}${String(counter.seq).padStart(4, '0')}`;
  }

  /**
   * Get or create patient
   */
  async getOrCreatePatient(hospitalId, patientData) {
    // Try to find existing patient by phone
    const existingPatient = await this.prisma.patient.findFirst({
      where: {
        hospitalId,
        phone: patientData.phone,
      },
    });

    if (existingPatient) {
      // Update patient info if provided
      return await this.prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          name: patientData.name || existingPatient.name,
          age: patientData.age !== undefined ? patientData.age : existingPatient.age,
          gender: patientData.gender || existingPatient.gender,
          dateOfBirth: patientData.dateOfBirth || existingPatient.dateOfBirth,
          bloodGroup: patientData.bloodGroup || existingPatient.bloodGroup,
          city: patientData.city || existingPatient.city,
          state: patientData.state || existingPatient.state,
          address: patientData.address || existingPatient.address,
          emergencyContactName: patientData.emergencyContactName || existingPatient.emergencyContactName,
          emergencyContactPhone: patientData.emergencyContactPhone || existingPatient.emergencyContactPhone,
        },
      });
    }

    // Generate new patient ID
    const patientId = await this.generatePatientId();

    // Create new patient
    return await this.prisma.patient.create({
      data: {
        hospitalId,
        patientId,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        bloodGroup: patientData.bloodGroup,
        city: patientData.city,
        state: patientData.state,
        address: patientData.address || '',
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
      },
    });
  }

  /**
   * Generate patient ID (PAT + YYMMDD + sequence)
   */
  async generatePatientId() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `PAT${yy}${mm}${dd}`;

    const counterId = datePrefix;
    
    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return `${datePrefix}${String(counter.seq).padStart(4, '0')}`;
  }

  /**
   * Generate bill ID (BILL + YYMMDD + sequence)
   */
  async generateBillId() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `BILL${yy}${mm}${dd}`;

    const counterId = datePrefix;
    
    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return `${datePrefix}${String(counter.seq).padStart(4, '0')}`;
  }

  /**
   * Create billing entry for visit
   */
  async createBillingEntry(hospitalId, patientId, visitType, isEmergency, createdBy) {
    const billId = await this.generateBillId();
    
    // Determine service based on visit type
    let services = [];
    let totalAmount = 0;

    switch (visitType) {
      case VISIT_TYPES.CONSULTATION_NEW:
        services = [{ serviceName: 'New Consultation (OPD)', category: 'CONSULTATION', quantity: 1, unitPrice: 500, amount: 500 }];
        totalAmount = 500;
        break;
      case VISIT_TYPES.CONSULTATION_FOLLOWUP:
        services = [{ serviceName: 'Follow-up Consultation', category: 'CONSULTATION', quantity: 1, unitPrice: 300, amount: 300 }];
        totalAmount = 300;
        break;
      case VISIT_TYPES.ADMISSION_PLANNED:
        services = [{ serviceName: 'Planned Admission Fee', category: 'ADMISSION', quantity: 1, unitPrice: 1000, amount: 1000 }];
        totalAmount = 1000;
        break;
      case VISIT_TYPES.ADMISSION_EMERGENCY:
        services = [{ serviceName: 'Emergency Admission Fee', category: 'ADMISSION', quantity: 1, unitPrice: 2000, amount: 2000 }];
        totalAmount = 2000;
        break;
      case VISIT_TYPES.DIAGNOSTIC_INTERNAL:
        services = [{ serviceName: 'Diagnostic Tests', category: 'DIAGNOSTIC', quantity: 1, unitPrice: 0, amount: 0 }];
        totalAmount = 0; // Will be updated when tests are selected
        break;
      case VISIT_TYPES.DIAGNOSTIC_EXTERNAL:
        services = [{ serviceName: 'External Prescription Processing', category: 'DIAGNOSTIC', quantity: 1, unitPrice: 100, amount: 100 }];
        totalAmount = 100;
        break;
      case VISIT_TYPES.SERVICE_VACCINATION:
        services = [{ serviceName: 'Vaccination', category: 'SERVICE', quantity: 1, unitPrice: 500, amount: 500 }];
        totalAmount = 500;
        break;
      case VISIT_TYPES.SERVICE_DRESSING:
        services = [{ serviceName: 'Dressing/Injection', category: 'SERVICE', quantity: 1, unitPrice: 200, amount: 200 }];
        totalAmount = 200;
        break;
      case VISIT_TYPES.SERVICE_PHYSIOTHERAPY:
        services = [{ serviceName: 'Physiotherapy Session', category: 'SERVICE', quantity: 1, unitPrice: 800, amount: 800 }];
        totalAmount = 800;
        break;
      case VISIT_TYPES.SERVICE_MISC:
        services = [{ serviceName: 'Miscellaneous Service', category: 'SERVICE', quantity: 1, unitPrice: 0, amount: 0 }];
        totalAmount = 0;
        break;
      default:
        services = [{ serviceName: 'General Service', category: 'OTHER', quantity: 1, unitPrice: 0, amount: 0 }];
        totalAmount = 0;
    }

    const bill = await this.prisma.bill.create({
      data: {
        billId,
        hospitalId,
        patientId,
        services,
        totalAmount,
        isEmergency,
        visitType: VISIT_TYPE_TO_CATEGORY[visitType],
        paymentStatus: 'UNPAID',
        createdBy,
      },
    });

    return bill;
  }

  /**
   * Find or create service queue for visit type
   */
  async findOrCreateServiceQueue(hospitalId, visitType, departmentCode) {
    const serviceType = VISIT_TYPE_TO_QUEUE_TYPE[visitType];
    const queueCode = `${serviceType}_${departmentCode || 'DEFAULT'}_001`;

    let serviceQueue = await this.prisma.serviceQueue.findFirst({
      where: {
        hospitalId,
        serviceType,
        queueCode,
      },
    });

    if (!serviceQueue) {
      // Create default service queue
      const queueNames = {
        CONSULTATION: 'OPD Consultation Queue',
        ADMISSION: 'IPD Admission Queue',
        DIAGNOSTIC: 'Diagnostic Services Queue',
        SERVICE: 'Other Services Queue',
      };

      serviceQueue = await this.prisma.serviceQueue.create({
        data: {
          hospitalId,
          queueCode,
          queueName: queueNames[serviceType] || 'General Queue',
          shortName: serviceType,
          serviceType,
          department: departmentCode,
          isActive: true,
          isAcceptingPatients: true,
        },
      });
    }

    return serviceQueue;
  }

  /**
   * Generate queue number
   */
  async generateQueueNumber(serviceQueueId) {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `QUE${yy}${mm}${dd}`;

    const counterId = `${datePrefix}_${serviceQueueId}`;
    
    const counter = await this.prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return {
      queueNumber: `${datePrefix}${String(counter.seq).padStart(4, '0')}`,
      tokenNumber: counter.seq,
    };
  }

  /**
   * Add patient to queue
   */
  async addToQueue(hospitalId, patientId, billId, serviceQueueId, priority, isEmergency, visitType, createdBy) {
    const { queueNumber, tokenNumber } = await this.generateQueueNumber(serviceQueueId);

    // Calculate position in queue
    const existingQueueCount = await this.prisma.patientQueue.count({
      where: {
        serviceQueueId,
        status: {
          in: ['WAITING', 'CALLED'],
        },
      },
    });

    const position = existingQueueCount + 1;

    const queueEntry = await this.prisma.patientQueue.create({
      data: {
        queueNumber,
        tokenNumber,
        hospitalId,
        patientId,
        billId,
        serviceQueueId,
        priority,
        isEmergency,
        position,
        originalPosition: position,
        status: 'WAITING',
        serviceType: VISIT_TYPE_TO_QUEUE_TYPE[visitType],
        createdBy,
      },
      include: {
        serviceQueue: true,
      },
    });

    // Update service queue count
    await this.prisma.serviceQueue.update({
      where: { id: serviceQueueId },
      data: {
        currentCount: { increment: 1 },
        nextToken: tokenNumber + 1,
      },
    });

    return queueEntry;
  }

  /**
   * Patient Entry - Main function to register patient with visit type
   */
  async registerPatientEntry(hospitalId, patientData, visitData, createdBy) {
    return await this.prisma.$transaction(async (tx) => {
      this.prisma = tx; // Use transaction prisma
      this.visitRepository = new VisitRepository(tx);

      // 1. Get or create patient
      const patient = await this.getOrCreatePatient(hospitalId, {
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        bloodGroup: patientData.bloodGroup,
        city: patientData.city,
        state: patientData.state,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
      });

      // 2. Create billing entry
      const bill = await this.createBillingEntry(
        hospitalId,
        patient.patientId,
        visitData.visitType,
        visitData.isEmergency,
        createdBy
      );

      // 3. Generate visit ID
      const visitId = await this.generateVisitId();

      // 4. Create visit record
      const visit = await this.visitRepository.createVisit({
        visitId,
        hospitalId,
        patientId: patient.id,
        visitType: visitData.visitType,
        visitCategory: VISIT_TYPE_TO_CATEGORY[visitData.visitType],
        chiefComplaint: visitData.chiefComplaint,
        symptoms: visitData.symptoms,
        notes: visitData.notes,
        assignedDoctorId: visitData.assignedDoctorId,
        assignedDoctorName: visitData.assignedDoctorName,
        departmentCode: visitData.departmentCode,
        isEmergency: visitData.isEmergency,
        priority: visitData.priority,
        status: VISIT_STATUS.REGISTERED,
        billId: bill.id,
        createdBy,
      });

      // 5. Find or create service queue
      const serviceQueue = await this.findOrCreateServiceQueue(
        hospitalId,
        visitData.visitType,
        visitData.departmentCode
      );

      // 6. Add patient to queue
      const queueEntry = await this.addToQueue(
        hospitalId,
        patient.id,
        bill.id,
        serviceQueue.id,
        visitData.priority,
        visitData.isEmergency,
        visitData.visitType,
        createdBy
      );

      return {
        patient,
        visit,
        bill,
        queueInfo: {
          queueNumber: queueEntry.queueNumber,
          tokenNumber: queueEntry.tokenNumber,
          position: queueEntry.position,
          serviceQueueName: serviceQueue.queueName,
          estimatedWaitTime: queueEntry.position * (serviceQueue.averageServiceTime || 15),
        },
      };
    });
  }

  /**
   * Get visits by filters
   */
  async getVisits(hospitalId, filters) {
    return await this.visitRepository.getVisitsByHospital(hospitalId, filters);
  }

  /**
   * Get visit by ID
   */
  async getVisitById(visitId) {
    const visit = await this.visitRepository.getVisitById(visitId);
    if (!visit) {
      throw new AppError('Visit not found', HttpStatus.NOT_FOUND);
    }
    return visit;
  }

  /**
   * Update visit status
   */
  async updateVisitStatus(visitId, status, updatedBy) {
    const visit = await this.visitRepository.getVisitById(visitId);
    if (!visit) {
      throw new AppError('Visit not found', HttpStatus.NOT_FOUND);
    }

    const updateData = { status };

    if (status === VISIT_STATUS.IN_PROGRESS && !visit.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === VISIT_STATUS.COMPLETED && !visit.completedAt) {
      updateData.completedAt = new Date();
    }

    return await this.visitRepository.updateVisit(visitId, updateData);
  }

  /**
   * Get patients in service queue (for dashboard)
   */
  async getServiceQueuePatients(hospitalId, serviceType, status = null) {
    const where = {
      hospitalId,
      serviceQueue: {
        serviceType,
      },
    };

    if (status) {
      where.status = status;
    } else {
      // Default: show waiting and called patients
      where.status = {
        in: ['WAITING', 'CALLED', 'SERVING'],
      };
    }

    const queueEntries = await this.prisma.patientQueue.findMany({
      where,
      include: {
        patient: true,
        serviceQueue: true,
        bill: true,
      },
      orderBy: [
        { priority: 'asc' }, // EMERGENCY first
        { position: 'asc' },
      ],
    });

    return queueEntries;
  }
}
