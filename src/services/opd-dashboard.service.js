/**
 * OPD Dashboard Service
 * 
 * Handles OPD queue management and patient data aggregation
 * Displays patients in FIFO order (by priority + join time)
 * 
 * NOTE: Single-tenant system - hospitalId is automatically managed
 */

import prisma from '../core/database/prismaClient.js';
import { tenantContext } from '../core/context/index.js';

export class OpdDashboardService {
  /**
   * Get OPD Dashboard with patient queue
   * Returns patients ordered by priority and join time (FIFO)
   * 
   * @param {string} userId - Current user ID
   * @param {string} userType - DOCTOR, NURSE, etc.
   * @param {object} options - Query options (status, limit, offset)
   */
  async getOpdDashboard(userId, userType, options = {}) {
    const { status = 'WAITING', limit = 50, offset = 0 } = options;
    
    // Get hospitalId from singleton context (single-tenant)
    const hospitalId = tenantContext.getHospitalId();

    try {
      // Determine which patients to fetch based on user role
      const whereClause = {
        hospitalId,
        status: status === 'ALL' ? undefined : status
      };

      // If user is a doctor, also include their assigned patients
      if (userType === 'DOCTOR') {
        whereClause.OR = [
          { status: status === 'ALL' ? undefined : status },
          { doctorId: userId }
        ];
      }

      // Fetch patient queue ordered by priority and join time (FIFO)
      const patientQueue = await prisma.patientQueue.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              bloodGroup: true,
              phone: true,
              address: true,
              emergencyContactName: true,
              emergencyContactPhone: true
            }
          },
          serviceQueue: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true
                }
              }
            }
          },
          visit: {
            select: {
              id: true,
              visitId: true,
              visitType: true,
              visitCategory: true,
              chiefComplaint: true,
              symptoms: true,
              priority: true,
              isEmergency: true,
              status: true,
              registeredAt: true,
              completedAt: true
            }
          },
          bill: {
            select: {
              id: true,
              billId: true,
              totalAmount: true,
              paymentStatus: true,
              services: true
            }
          }
        },
        orderBy: [
          { priority: 'asc' },      // EMERGENCY (0) > URGENT (1) > PRIORITY (2) > NORMAL (3)
          { position: 'asc' },       // Queue position
          { joinedAt: 'asc' }        // First-in-first-out (FIFO)
        ],
        take: limit,
        skip: offset
      });

      // Get all vitals for patients in queue
      const patientIds = patientQueue.map(q => q.patientId);
      const visitIds = patientQueue.map(q => q.visitId).filter(Boolean);

      const vitalsRecords = await prisma.vitalSigns.findMany({
        where: {
          OR: [
            { patientId: { in: patientIds } },
            { visitId: { in: visitIds } }
          ]
        },
        orderBy: {
          recordedAt: 'desc'
        }
      });

      // Group vitals by patient and visit
      const vitalsByPatient = {};
      const vitalsByVisit = {};
      vitalsRecords.forEach(vital => {
        if (vital.patientId) {
          if (!vitalsByPatient[vital.patientId]) {
            vitalsByPatient[vital.patientId] = [];
          }
          vitalsByPatient[vital.patientId].push(vital);
        }
        if (vital.visitId) {
          if (!vitalsByVisit[vital.visitId]) {
            vitalsByVisit[vital.visitId] = [];
          }
          vitalsByVisit[vital.visitId].push(vital);
        }
      });

      // Format patient data with vitals
      const formattedPatients = patientQueue.map(queue => {
        const patientVitals = vitalsByVisit[queue.visitId]?.[0] || vitalsByPatient[queue.patientId]?.[0];
        
        // Calculate age from date of birth
        const age = queue.patient.dateOfBirth 
          ? Math.floor((new Date() - new Date(queue.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        // Calculate wait time in minutes
        const waitTime = Math.floor((new Date() - new Date(queue.joinedAt)) / (60 * 1000));

        return {
          queueId: queue.id,
          queueNumber: queue.queueNumber,
          tokenNumber: queue.tokenNumber,
          position: queue.position,
          status: queue.status,
          priority: queue.priority,
          waitTime,
          joinedAt: queue.joinedAt,
          calledAt: queue.calledAt,
          startedAt: queue.startedAt,
          completedAt: queue.completedAt,
          
          patient: {
            patientId: queue.patient.patientId,
            name: `${queue.patient.firstName} ${queue.patient.lastName}`,
            age,
            gender: queue.patient.gender,
            bloodGroup: queue.patient.bloodGroup,
            phone: queue.patient.phone,
            address: queue.patient.address,
            emergencyContact: {
              name: queue.patient.emergencyContactName,
              phone: queue.patient.emergencyContactPhone
            }
          },

          visit: queue.visit ? {
            visitId: queue.visit.visitId,
            visitType: queue.visit.visitType,
            visitCategory: queue.visit.visitCategory,
            chiefComplaint: queue.visit.chiefComplaint,
            symptoms: queue.visit.symptoms,
            priority: queue.visit.priority,
            isEmergency: queue.visit.isEmergency,
            status: queue.visit.status,
            registeredAt: queue.visit.registeredAt
          } : null,

          vitals: patientVitals ? {
            height: `${patientVitals.height} cm`,
            weight: `${patientVitals.weight} kg`,
            bmi: patientVitals.bmi ? `${patientVitals.bmi} kg/m²` : null,
            bloodPressure: `${patientVitals.bloodPressureSystolic}/${patientVitals.bloodPressureDiastolic} mmHg`,
            pulseRate: `${patientVitals.pulseRate} bpm`,
            temperature: `${patientVitals.temperature}°C`,
            respiratoryRate: `${patientVitals.respiratoryRate} breaths/min`,
            oxygenSaturation: `${patientVitals.oxygenSaturation}%`,
            recordedAt: patientVitals.recordedAt,
            recordedBy: patientVitals.recordedByName
          } : null,

          vitalsRecorded: !!patientVitals,

          serviceQueue: queue.serviceQueue ? {
            queueId: queue.serviceQueue.id,
            queueName: queue.serviceQueue.queueName,
            shortName: queue.serviceQueue.shortName,
            serviceType: queue.serviceQueue.serviceType,
            department: queue.serviceQueue.department,
            counterNumber: queue.serviceQueue.counterNumber,
            assignedDoctor: queue.serviceQueue.doctor ? {
              id: queue.serviceQueue.doctor.id,
              name: queue.serviceQueue.doctor.name,
              specialization: queue.serviceQueue.doctor.specialization
            } : null
          } : null,

          billing: queue.bill ? {
            billId: queue.bill.billId,
            totalAmount: queue.bill.totalAmount,
            paymentStatus: queue.bill.paymentStatus,
            serviceCount: queue.bill.services?.length || 0
          } : null,

          skipCount: queue.skipCount,
          maxSkips: queue.maxSkips || 3,
          notes: queue.notes,
          specialNeeds: queue.specialNeeds
        };
      });

      // Get queue statistics
      const statistics = await this._getQueueStatistics();

      // For doctors, get their assigned patients
      let assignedPatients = [];
      if (userType === 'DOCTOR') {
        assignedPatients = await this._getAssignedPatients(userId);
      }

      return {
        totalPatientsInQueue: patientQueue.length,
        statistics,
        currentUser: {
          userId,
          userType
        },
        patients: formattedPatients,
        assignedPatients
      };

    } catch (error) {
      console.error('Error fetching OPD dashboard:', error);
      throw new Error(`Failed to load OPD dashboard: ${error.message}`);
    }
  }

  /**
   * Get next patient in queue
   * @param {string} userId - Current user ID
   */
  async getNextPatient(userId) {
    // Get hospitalId from singleton context (single-tenant)
    const hospitalId = tenantContext.getHospitalId();
    
    try {
      const nextPatient = await prisma.patientQueue.findFirst({
        where: {
          hospitalId,
          status: 'WAITING'
        },
        include: {
          patient: true,
          visit: true
        },
        orderBy: [
          { priority: 'asc' },
          { position: 'asc' },
          { joinedAt: 'asc' }
        ]
      });

      if (!nextPatient) {
        return null;
      }

      // Get vitals if recorded
      const vitals = await prisma.vitalSigns.findFirst({
        where: {
          visitId: nextPatient.visitId
        },
        orderBy: {
          recordedAt: 'desc'
        }
      });

      return {
        queueId: nextPatient.id,
        tokenNumber: nextPatient.tokenNumber,
        patient: {
          patientId: nextPatient.patient.patientId,
          name: `${nextPatient.patient.firstName} ${nextPatient.patient.lastName}`,
          age: Math.floor((new Date() - new Date(nextPatient.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)),
          gender: nextPatient.patient.gender,
          phone: nextPatient.patient.phone
        },
        vitals: vitals ? {
          height: `${vitals.height} cm`,
          weight: `${vitals.weight} kg`,
          bmi: `${vitals.bmi} kg/m²`,
          bloodPressure: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`,
          pulseRate: `${vitals.pulseRate} bpm`,
          temperature: `${vitals.temperature}°C`,
          respiratoryRate: `${vitals.respiratoryRate} breaths/min`,
          oxygenSaturation: `${vitals.oxygenSaturation}%`,
          recordedAt: vitals.recordedAt
        } : null,
        vitalsRecorded: !!vitals
      };

    } catch (error) {
      console.error('Error getting next patient:', error);
      throw new Error(`Failed to get next patient: ${error.message}`);
    }
  }

  /**
   * Call next patient (change status to CALLED)
   */
  async callNextPatient(queueId, userId) {
    try {
      const updated = await prisma.patientQueue.update({
        where: { id: queueId },
        data: {
          status: 'CALLED',
          calledAt: new Date(),
          calledBy: userId
        },
        include: {
          patient: true
        }
      });

      return {
        queueId: updated.id,
        tokenNumber: updated.tokenNumber,
        patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
        status: updated.status,
        calledAt: updated.calledAt
      };
    } catch (error) {
      console.error('Error calling patient:', error);
      throw new Error(`Failed to call patient: ${error.message}`);
    }
  }

  /**
   * Start serving patient (change status to SERVING)
   */
  async startServing(queueId, userId) {
    try {
      const updated = await prisma.patientQueue.update({
        where: { id: queueId },
        data: {
          status: 'SERVING',
          startedAt: new Date(),
          servedBy: userId
        },
        include: {
          patient: true
        }
      });

      return {
        queueId: updated.id,
        tokenNumber: updated.tokenNumber,
        patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
        status: updated.status,
        servedAt: updated.startedAt
      };
    } catch (error) {
      console.error('Error starting service:', error);
      throw new Error(`Failed to start serving: ${error.message}`);
    }
  }

  /**
   * Complete service (change status to COMPLETED)
   */
  /**
   * Complete OPD service
   * Optionally creates IPD admission request if needed
   * 
   * @param {string} queueId - Queue record ID
   * @param {string} userId - User ID (doctor)
   * @param {object} options - Additional options {ipdRequired, admissionReason, diagnosis, etc}
   */
  async completeService(queueId, userId, options = {}) {
    try {
      const queue = await prisma.patientQueue.findUnique({
        where: { id: queueId },
        include: {
          patient: true,
          visit: true
        }
      });

      if (!queue) {
        throw new Error('Queue record not found');
      }

      // Update queue status
      const updated = await prisma.patientQueue.update({
        where: { id: queueId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completedBy: userId,
          requiresIPDAdmission: options.ipdRequired || false
        },
        include: {
          patient: true
        }
      });

      // Also update visit status if exists
      if (queue.visitId) {
        await prisma.patientVisit.update({
          where: { id: queue.visitId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            requiresIPDAdmission: options.ipdRequired || false
          }
        });
      }

      let admissionRequest = null;

      // If IPD is required, create admission request
      if (options.ipdRequired) {
        try {
          admissionRequest = await prisma.ipdAdmissionRequest.create({
            data: {
              patientId: queue.patientId,
              visitId: queue.visitId,
              admissionReason: options.admissionReason || 'Referred from OPD consultation',
              initialDiagnosis: options.diagnosis || queue.visit?.chiefComplaint || '',
              estimatedLOS: options.estimatedLOS || 3,
              priority: options.priority || 'NORMAL',
              medicalHistory: queue.patient.medicalHistory,
              allergies: queue.patient.allergies,
              emergencyContact: options.emergencyContact,
              recommendedDepartment: options.department,
              notes: options.notes || `Referred by ${userId} from OPD consultation`,
              status: 'PENDING',
              requestedBy: userId,
              requestedAt: new Date(),
              hospitalId: queue.patient.hospitalId,
            },
            include: {
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          });

          console.log(`IPD admission request created for patient ${queue.patientId}`);
        } catch (admissionError) {
          console.error('Error creating IPD admission request:', admissionError);
          // Don't fail the OPD service completion if admission request creation fails
          // Log the error but continue
        }
      }

      return {
        queueId: updated.id,
        tokenNumber: updated.tokenNumber,
        patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
        status: updated.status,
        completedAt: updated.completedAt,
        ipdRequired: options.ipdRequired || false,
        admissionRequest: admissionRequest ? {
          id: admissionRequest.id,
          status: admissionRequest.status,
          message: 'Patient will appear in IPD admission queue'
        } : null
      };
    } catch (error) {
      console.error('Error completing service:', error);
      throw new Error(`Failed to complete service: ${error.message}`);
    }
  }

  /**
   * Skip patient (increment skip count, auto-cancel if max reached)
   */
  async skipPatient(queueId, userId) {
    try {
      const queue = await prisma.patientQueue.findUnique({
        where: { id: queueId }
      });

      const newSkipCount = (queue.skipCount || 0) + 1;
      const maxSkips = queue.maxSkips || 3;
      const shouldCancel = newSkipCount >= maxSkips;

      const updated = await prisma.patientQueue.update({
        where: { id: queueId },
        data: {
          skipCount: newSkipCount,
          status: shouldCancel ? 'CANCELLED' : queue.status,
          cancelledAt: shouldCancel ? new Date() : null,
          cancelReason: shouldCancel ? `Auto-cancelled after ${maxSkips} skips` : null
        },
        include: {
          patient: true
        }
      });

      return {
        queueId: updated.id,
        tokenNumber: updated.tokenNumber,
        skipCount: updated.skipCount,
        maxSkips,
        status: updated.status,
        autoCancel: shouldCancel,
        reason: shouldCancel ? updated.cancelReason : null
      };
    } catch (error) {
      console.error('Error skipping patient:', error);
      throw new Error(`Failed to skip patient: ${error.message}`);
    }
  }

  /**
   * Get complete patient data for OPD operations
   */
  async getPatientForOpd(visitId) {
    try {
      const visit = await prisma.patientVisit.findUnique({
        where: { id: visitId },
        include: {
          patient: true,
          vitalSigns: {
            orderBy: { recordedAt: 'desc' },
            take: 1
          },
          bill: true
        }
      });

      if (!visit) {
        throw new Error('Visit not found');
      }

      const queue = await prisma.patientQueue.findFirst({
        where: { visitId },
        include: {
          serviceQueue: {
            include: {
              doctor: true
            }
          }
        }
      });

      return {
        visitId: visit.visitId,
        patient: visit.patient,
        visitDetails: visit,
        vitals: visit.vitalSigns[0] || null,
        billing: visit.bill || null,
        queue: queue || null
      };
    } catch (error) {
      console.error('Error getting patient for OPD:', error);
      throw new Error(`Failed to get patient details: ${error.message}`);
    }
  }

  /**
   * Get queue statistics (private helper)
   */
  async _getQueueStatistics() {
    // Get hospitalId from singleton context (single-tenant)
    const hospitalId = tenantContext.getHospitalId();
    
    const stats = await prisma.patientQueue.groupBy({
      by: ['status'],
      where: { hospitalId },
      _count: true
    });

    const result = {
      waiting: 0,
      called: 0,
      serving: 0,
      completed: 0,
      cancelled: 0,
      skipped: 0,
      total: 0
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase();
      if (result.hasOwnProperty(status)) {
        result[status] = stat._count;
      }
      result.total += stat._count;
    });

    return result;
  }

  /**
   * Get assigned patients for a doctor (private helper)
   */
  async _getAssignedPatients(doctorId) {
    // Get hospitalId from singleton context (single-tenant)
    const hospitalId = tenantContext.getHospitalId();
    
    const assigned = await prisma.patientQueue.findMany({
      where: {
        hospitalId,
        doctorId: doctorId,
        status: 'IN_PROGRESS'
      },
      include: {
        patient: true,
        visit: true
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return assigned.map(queue => ({
      visitId: queue.visitId,
      patientId: queue.patient.patientId,
      patientName: `${queue.patient.firstName} ${queue.patient.lastName}`,
      chiefComplaint: queue.visit?.chiefComplaint,
      startedAt: queue.startedAt
    }));
  }
}

export const opdDashboardService = new OpdDashboardService();



















