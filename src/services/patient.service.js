/**
 * Patient Service
 * Business logic layer for Patient operations
 */

import { PatientRepository } from './patient.repository.js';
import { 
  NotFoundError, 
  ConflictError 
} from '../shared/AppError.js';

export class PatientService {
  constructor(prisma) {
    this.prisma = prisma;
    this.repository = new PatientRepository(prisma);
  }

  /**
   * Get all patients with bills
   */
  async getAllPatients(hospitalId) {
    const { patients, billsByPatient } = await this.repository.findAllWithBills(hospitalId);
    return { patients, billsByPatient };
  }

  /**
   * Search patients
   */
  async searchPatients(hospitalId, query) {
    const patients = await this.repository.search(hospitalId, query);
    
    // Get bills for found patients
    const patientIds = patients.map(p => p.patientId);
    let billsByPatient = {};
    
    if (patientIds.length > 0) {
      const bills = await this.prisma.bill.findMany({
        where: {
          hospitalId,
          patientId: { in: patientIds }
        },
        orderBy: { billDate: 'desc' }
      });

      billsByPatient = bills.reduce((acc, b) => {
        acc[b.patientId] = acc[b.patientId] || [];
        acc[b.patientId].push(b);
        return acc;
      }, {});
    }

    return { patients, billsByPatient };
  }

  /**
   * Get patient by patientId
   */
  async getPatient(patientId, hospitalId) {
    const patient = await this.repository.findByPatientId(patientId, hospitalId);
    
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return patient;
  }

  /**
   * Create new patient or return existing
   */
  async createPatient(data, hospitalId, generatePatientId) {
    // Check for existing patient by phone
    const existing = await this.repository.findByPhone(data.phone, hospitalId);
    
    if (existing) {
      return {
        patient: existing,
        isExisting: true,
        message: 'Patient already exists'
      };
    }

    // Generate patient ID
    const patientId = await generatePatientId(this.prisma);

    // Create patient
    const patient = await this.repository.create({
      patientId,
      hospitalId,
      name: data.name,
      age: data.age || null,
      gender: data.gender || null,
      phone: data.phone,
      address: data.address || null
    });

    return {
      patient,
      isExisting: false,
      message: 'Patient created successfully'
    };
  }

  /**
   * Get patients with pagination
   */
  async getPatientsWithPagination(hospitalId, paginationParams) {
    const result = await this.repository.findWithPagination(hospitalId, paginationParams);
    
    // Get bills for patients
    const patientIds = result.data.map(p => p.patientId);
    let billsByPatient = {};
    
    if (patientIds.length > 0) {
      const bills = await this.prisma.bill.findMany({
        where: {
          hospitalId,
          patientId: { in: patientIds }
        },
        orderBy: { billDate: 'desc' }
      });

      billsByPatient = bills.reduce((acc, b) => {
        acc[b.patientId] = acc[b.patientId] || [];
        acc[b.patientId].push(b);
        return acc;
      }, {});
    }

    return { ...result, billsByPatient };
  }
}

export default PatientService;



















