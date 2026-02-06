/**
 * OPD Consultation Service
 * 
 * Handles OPD consultation workflow including:
 * - Consultation notes management
 * - Prescription management
 * - Test ordering
 * - Patient OPD history
 * 
 * NOTE: Single-tenant system - hospitalId is automatically managed
 */

import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../../core/context/index.js';
import { NotFoundError, ValidationError } from '../../shared/exceptions/AppError.js';

const prisma = new PrismaClient();

export class OpdConsultationService {
  
  // ==================== CONSULTATION NOTES ====================

  /**
   * Add consultation note for a visit
   * @param {string} visitId - Visit ID
   * @param {object} noteData - Consultation note data
   * @param {string} doctorId - Doctor ID
   * @returns {object} Created consultation note
   */
  async addConsultationNote(visitId, noteData, doctorId) {
    const hospitalId = tenantContext.getHospitalId();

    // Verify visit exists
    const visit = await prisma.patientVisit.findFirst({
      where: { id: visitId, hospitalId },
      include: { patient: true }
    });

    if (!visit) {
      throw new NotFoundError('Visit not found');
    }

    // Get doctor info
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, firstName: true, lastName: true, registrationNumber: true }
    });

    const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : null;

    // Create consultation note
    const consultationNote = await prisma.oPDConsultationNote.create({
      data: {
        hospitalId,
        patientId: visit.patientId,
        visitId,
        doctorId,
        doctorName,
        chiefComplaint: noteData.chiefComplaint,
        historyOfPresentIllness: noteData.historyOfPresentIllness,
        pastMedicalHistory: noteData.pastMedicalHistory,
        familyHistory: noteData.familyHistory,
        socialHistory: noteData.socialHistory,
        generalExamination: noteData.generalExamination,
        systemicExamination: noteData.systemicExamination,
        localExamination: noteData.localExamination,
        provisionalDiagnosis: noteData.provisionalDiagnosis,
        differentialDiagnosis: noteData.differentialDiagnosis,
        finalDiagnosis: noteData.finalDiagnosis,
        icdCode: noteData.icdCode,
        treatmentPlan: noteData.treatmentPlan,
        advice: noteData.advice,
        diet: noteData.diet,
        investigationsOrdered: noteData.investigationsOrdered,
        investigationsResults: noteData.investigationsResults,
        followUpRequired: noteData.followUpRequired || false,
        followUpDays: noteData.followUpDays,
        followUpDate: noteData.followUpDate,
        followUpInstructions: noteData.followUpInstructions,
        referralRequired: noteData.referralRequired || false,
        referralTo: noteData.referralTo,
        referralReason: noteData.referralReason,
        ipdRecommended: noteData.ipdRecommended || false,
        ipdReason: noteData.ipdReason,
      }
    });

    // Update visit with IPD recommendation if needed
    if (noteData.ipdRecommended) {
      await prisma.patientVisit.update({
        where: { id: visitId },
        data: { requiresIPDAdmission: true }
      });
    }

    return {
      message: 'Consultation note added successfully',
      consultationNote
    };
  }

  /**
   * Get consultation note by visit ID
   */
  async getConsultationNote(visitId) {
    const hospitalId = tenantContext.getHospitalId();

    const note = await prisma.oPDConsultationNote.findFirst({
      where: { visitId, hospitalId }
    });

    return note;
  }

  /**
   * Update consultation note
   */
  async updateConsultationNote(noteId, noteData, doctorId) {
    const hospitalId = tenantContext.getHospitalId();

    const existing = await prisma.oPDConsultationNote.findFirst({
      where: { id: noteId, hospitalId }
    });

    if (!existing) {
      throw new NotFoundError('Consultation note not found');
    }

    const updated = await prisma.oPDConsultationNote.update({
      where: { id: noteId },
      data: {
        ...noteData,
        updatedAt: new Date()
      }
    });

    return {
      message: 'Consultation note updated successfully',
      consultationNote: updated
    };
  }

  // ==================== PRESCRIPTIONS ====================

  /**
   * Generate prescription ID
   */
  async generatePrescriptionId() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `RX${yy}${mm}${dd}`;

    const counterId = datePrefix;
    
    const counter = await prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return `${datePrefix}${String(counter.seq).padStart(4, '0')}`;
  }

  /**
   * Create prescription for a visit
   * @param {string} visitId - Visit ID
   * @param {object} prescriptionData - Prescription data
   * @param {string} doctorId - Doctor ID
   */
  async createPrescription(visitId, prescriptionData, doctorId) {
    const hospitalId = tenantContext.getHospitalId();

    // Verify visit exists
    const visit = await prisma.patientVisit.findFirst({
      where: { id: visitId, hospitalId },
      include: { patient: true }
    });

    if (!visit) {
      throw new NotFoundError('Visit not found');
    }

    // Get doctor info
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, firstName: true, lastName: true, registrationNumber: true }
    });

    const prescriptionId = await this.generatePrescriptionId();

    const prescription = await prisma.oPDPrescription.create({
      data: {
        prescriptionId,
        hospitalId,
        patientId: visit.patientId,
        visitId,
        doctorId,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : null,
        doctorRegistrationNo: doctor?.registrationNumber,
        medications: prescriptionData.medications,
        instructions: prescriptionData.instructions,
        diet: prescriptionData.diet,
        warnings: prescriptionData.warnings,
        validUntilDate: prescriptionData.validUntilDate
      }
    });

    return {
      message: 'Prescription created successfully',
      prescription
    };
  }

  /**
   * Get prescriptions for a visit
   */
  async getPrescriptionsByVisit(visitId) {
    const hospitalId = tenantContext.getHospitalId();

    const prescriptions = await prisma.oPDPrescription.findMany({
      where: { visitId, hospitalId },
      orderBy: { prescribedAt: 'desc' }
    });

    return prescriptions;
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(prescriptionId) {
    const hospitalId = tenantContext.getHospitalId();

    const prescription = await prisma.oPDPrescription.findFirst({
      where: { 
        OR: [
          { id: prescriptionId },
          { prescriptionId: prescriptionId }
        ],
        hospitalId 
      }
    });

    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    return prescription;
  }

  /**
   * Update prescription status
   */
  async updatePrescriptionStatus(prescriptionId, status, dispensedBy = null) {
    const hospitalId = tenantContext.getHospitalId();

    const existing = await prisma.oPDPrescription.findFirst({
      where: { id: prescriptionId, hospitalId }
    });

    if (!existing) {
      throw new NotFoundError('Prescription not found');
    }

    const updateData = { status };
    if (status === 'DISPENSED') {
      updateData.dispensedAt = new Date();
      updateData.dispensedBy = dispensedBy;
    }

    const updated = await prisma.oPDPrescription.update({
      where: { id: prescriptionId },
      data: updateData
    });

    return {
      message: `Prescription ${status.toLowerCase()}`,
      prescription: updated
    };
  }

  // ==================== TEST ORDERS ====================

  /**
   * Generate test order number
   */
  async generateTestOrderNumber() {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datePrefix = `TEST${yy}${mm}${dd}`;

    const counterId = datePrefix;
    
    const counter = await prisma.counter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    return `${datePrefix}${String(counter.seq).padStart(4, '0')}`;
  }

  /**
   * Create test order for a visit
   */
  async createTestOrder(visitId, testOrderData, doctorId) {
    const hospitalId = tenantContext.getHospitalId();

    // Verify visit exists
    const visit = await prisma.patientVisit.findFirst({
      where: { id: visitId, hospitalId },
      include: { patient: true }
    });

    if (!visit) {
      throw new NotFoundError('Visit not found');
    }

    // Get doctor info
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, firstName: true, lastName: true }
    });

    const orderNumber = await this.generateTestOrderNumber();

    const testOrder = await prisma.oPDTestOrder.create({
      data: {
        orderNumber,
        hospitalId,
        patientId: visit.patientId,
        visitId,
        doctorId,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : null,
        tests: testOrderData.tests,
        clinicalIndication: testOrderData.clinicalIndication,
        priority: testOrderData.priority || 'ROUTINE'
      }
    });

    return {
      message: 'Test order created successfully',
      testOrder
    };
  }

  /**
   * Get test orders for a visit
   */
  async getTestOrdersByVisit(visitId) {
    const hospitalId = tenantContext.getHospitalId();

    const testOrders = await prisma.oPDTestOrder.findMany({
      where: { visitId, hospitalId },
      orderBy: { orderedAt: 'desc' }
    });

    return testOrders;
  }

  /**
   * Update test order status
   */
  async updateTestOrderStatus(orderId, status, collectedBy = null) {
    const hospitalId = tenantContext.getHospitalId();

    const existing = await prisma.oPDTestOrder.findFirst({
      where: { id: orderId, hospitalId }
    });

    if (!existing) {
      throw new NotFoundError('Test order not found');
    }

    const updateData = { status };
    if (status === 'SAMPLE_COLLECTED') {
      updateData.sampleCollectedAt = new Date();
      updateData.sampleCollectedBy = collectedBy;
    }

    const updated = await prisma.oPDTestOrder.update({
      where: { id: orderId },
      data: updateData
    });

    return {
      message: `Test order status updated to ${status}`,
      testOrder: updated
    };
  }

  // ==================== PATIENT OPD HISTORY ====================

  /**
   * Get complete OPD history for a patient
   * @param {string} patientId - Patient ID
   * @param {object} options - Query options (limit, offset)
   */
  async getPatientOpdHistory(patientId, options = {}) {
    const hospitalId = tenantContext.getHospitalId();
    const { limit = 20, offset = 0 } = options;

    // Get patient info
    const patient = await prisma.patient.findFirst({
      where: { 
        OR: [
          { id: patientId },
          { patientId: patientId }
        ],
        hospitalId 
      }
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    // Get all OPD visits for the patient
    const visits = await prisma.patientVisit.findMany({
      where: {
        patientId: patient.id,
        hospitalId,
        visitCategory: 'CONSULTATION'
      },
      include: {
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        bill: {
          select: {
            id: true,
            billId: true,
            totalAmount: true,
            paymentStatus: true
          }
        }
      },
      orderBy: { visitDate: 'desc' },
      take: limit,
      skip: offset
    });

    // Get consultation notes for these visits
    const visitIds = visits.map(v => v.id);
    const consultationNotes = await prisma.oPDConsultationNote.findMany({
      where: { visitId: { in: visitIds }, hospitalId }
    });

    // Get prescriptions for these visits
    const prescriptions = await prisma.oPDPrescription.findMany({
      where: { visitId: { in: visitIds }, hospitalId }
    });

    // Get test orders for these visits
    const testOrders = await prisma.oPDTestOrder.findMany({
      where: { visitId: { in: visitIds }, hospitalId }
    });

    // Map data by visit
    const notesMap = {};
    consultationNotes.forEach(note => {
      notesMap[note.visitId] = note;
    });

    const prescriptionsMap = {};
    prescriptions.forEach(rx => {
      if (!prescriptionsMap[rx.visitId]) {
        prescriptionsMap[rx.visitId] = [];
      }
      prescriptionsMap[rx.visitId].push(rx);
    });

    const testOrdersMap = {};
    testOrders.forEach(order => {
      if (!testOrdersMap[order.visitId]) {
        testOrdersMap[order.visitId] = [];
      }
      testOrdersMap[order.visitId].push(order);
    });

    // Combine data
    const opdHistory = visits.map(visit => ({
      visit: {
        id: visit.id,
        visitId: visit.visitId,
        visitDate: visit.visitDate,
        visitType: visit.visitType,
        status: visit.status,
        chiefComplaint: visit.chiefComplaint,
        symptoms: visit.symptoms,
        isEmergency: visit.isEmergency,
        priority: visit.priority,
        assignedDoctorName: visit.assignedDoctorName
      },
      vitals: visit.vitalSigns[0] || null,
      consultationNote: notesMap[visit.id] || null,
      prescriptions: prescriptionsMap[visit.id] || [],
      testOrders: testOrdersMap[visit.id] || [],
      billing: visit.bill
    }));

    // Get total count
    const totalCount = await prisma.patientVisit.count({
      where: {
        patientId: patient.id,
        hospitalId,
        visitCategory: 'CONSULTATION'
      }
    });

    return {
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        address: patient.address
      },
      totalVisits: totalCount,
      opdHistory
    };
  }

  /**
   * Get complete visit details with all OPD data
   * @param {string} visitId - Visit ID
   */
  async getCompleteVisitDetails(visitId) {
    const hospitalId = tenantContext.getHospitalId();

    // Get visit with patient info
    const visit = await prisma.patientVisit.findFirst({
      where: { 
        OR: [
          { id: visitId },
          { visitId: visitId }
        ],
        hospitalId 
      },
      include: {
        patient: true,
        vitalSigns: {
          orderBy: { recordedAt: 'desc' }
        },
        bill: true,
        patientQueues: {
          include: {
            serviceQueue: {
              include: {
                doctor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    specialization: true
                  }
                }
              }
            }
          },
          take: 1
        }
      }
    });

    if (!visit) {
      throw new NotFoundError('Visit not found');
    }

    // Get consultation note
    const consultationNote = await prisma.oPDConsultationNote.findFirst({
      where: { visitId: visit.id, hospitalId }
    });

    // Get prescriptions
    const prescriptions = await prisma.oPDPrescription.findMany({
      where: { visitId: visit.id, hospitalId },
      orderBy: { prescribedAt: 'desc' }
    });

    // Get test orders
    const testOrders = await prisma.oPDTestOrder.findMany({
      where: { visitId: visit.id, hospitalId },
      orderBy: { orderedAt: 'desc' }
    });

    // Calculate age from date of birth
    const age = visit.patient.dateOfBirth 
      ? Math.floor((new Date() - new Date(visit.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : visit.patient.age;

    return {
      visit: {
        id: visit.id,
        visitId: visit.visitId,
        visitDate: visit.visitDate,
        visitType: visit.visitType,
        visitCategory: visit.visitCategory,
        status: visit.status,
        chiefComplaint: visit.chiefComplaint,
        symptoms: visit.symptoms,
        notes: visit.notes,
        isEmergency: visit.isEmergency,
        priority: visit.priority,
        requiresIPDAdmission: visit.requiresIPDAdmission,
        assignedDoctorId: visit.assignedDoctorId,
        assignedDoctorName: visit.assignedDoctorName,
        registeredAt: visit.registeredAt,
        startedAt: visit.startedAt,
        completedAt: visit.completedAt
      },
      patient: {
        id: visit.patient.id,
        patientId: visit.patient.patientId,
        name: visit.patient.name,
        age,
        gender: visit.patient.gender,
        phone: visit.patient.phone,
        bloodGroup: visit.patient.bloodGroup,
        address: visit.patient.address,
        emergencyContactName: visit.patient.emergencyContactName,
        emergencyContactPhone: visit.patient.emergencyContactPhone
      },
      vitals: visit.vitalSigns[0] || null,
      allVitals: visit.vitalSigns,
      consultationNote,
      prescriptions,
      testOrders,
      billing: visit.bill,
      queueInfo: visit.patientQueues[0] || null,
      opdWorkflow: {
        registration: 'COMPLETED',
        vitals: visit.vitalSigns.length > 0 ? 'COMPLETED' : 'PENDING',
        consultation: consultationNote ? 'COMPLETED' : 'PENDING',
        prescription: prescriptions.length > 0 ? 'COMPLETED' : 'PENDING',
        tests: testOrders.length > 0 ? 'ORDERED' : 'NONE',
        billing: visit.bill?.paymentStatus || 'PENDING'
      }
    };
  }
}

export const opdConsultationService = new OpdConsultationService();
