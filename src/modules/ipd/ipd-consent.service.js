/**
 * IPD Consent Management Service
 * Handle informed consent, procedure consents, and legal documentation
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDConsentService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create consent form
   */
  async createConsent(admissionId, data, currentUser) {
    try {
      const {
        consentType, // ADMISSION, PROCEDURE, SURGERY, TREATMENT, ANESTHESIA, RESEARCH
        description,
        procedureId,
        risks,
        benefits,
        alternatives,
        patientEducationProvided,
        understandingConfirmed,
        witnessPresent,
        witnessName,
        specialInstructions,
      } = data;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
        include: { patient: true },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const consent = await this.prisma.ipdConsent.create({
        data: {
          admissionId,
          patientId: admission.patientId,
          consentType,
          description,
          procedureId,
          risks,
          benefits,
          alternatives,
          patientEducationProvided,
          understandingConfirmed,
          witnessPresent,
          witnessName,
          specialInstructions,
          status: 'PENDING', // PENDING, SIGNED, WITHDRAWN, REVOKED
          documentedBy: currentUser.id,
          documentedDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Consent created for admission ${admissionId} - ${consentType}`);
      return consent;
    } catch (error) {
      logger.error(`Create Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sign consent by patient
   */
  async signConsent(consentId, signatureData, currentUser) {
    try {
      const { patientSignature, familyMemberName, familyMemberRelation } = signatureData;

      const consent = await this.prisma.ipdConsent.findUnique({
        where: { id: consentId },
      });

      if (!consent) {
        throw new AppError('Consent form not found', 404);
      }

      if (consent.status !== 'PENDING') {
        throw new AppError('Consent form cannot be signed - already processed', 400);
      }

      const signedConsent = await this.prisma.ipdConsent.update({
        where: { id: consentId },
        data: {
          status: 'SIGNED',
          patientSignature,
          patientSignedDate: new Date(),
          familyMemberName,
          familyMemberRelation,
          witnessedBy: currentUser.id,
          witnessedDate: new Date(),
        },
      });

      logger.info(`Consent ${consentId} signed by patient`);
      return signedConsent;
    } catch (error) {
      logger.error(`Sign Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(consentId, reason, currentUser) {
    try {
      const consent = await this.prisma.ipdConsent.update({
        where: { id: consentId },
        data: {
          status: 'WITHDRAWN',
          withdrawalReason: reason,
          withdrawnBy: currentUser.id,
          withdrawnDate: new Date(),
        },
      });

      logger.info(`Consent ${consentId} withdrawn`);
      return consent;
    } catch (error) {
      logger.error(`Withdraw Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get consent forms for admission
   */
  async getAdmissionConsents(admissionId, filters = {}) {
    try {
      const { status, consentType } = filters;

      const where = { admissionId };
      if (status) where.status = status;
      if (consentType) where.consentType = consentType;

      const consents = await this.prisma.ipdConsent.findMany({
        where,
        orderBy: { documentedDate: 'desc' },
        include: {
          documentedByUser: {
            select: { name: true, role: true },
          },
          procedure: true,
        },
      });

      return consents;
    } catch (error) {
      logger.error(`Get Consents Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get specific consent form
   */
  async getConsent(consentId) {
    try {
      const consent = await this.prisma.ipdConsent.findUnique({
        where: { id: consentId },
        include: {
          documentedByUser: {
            select: { id: true, name: true, role: true },
          },
          witnessedByUser: {
            select: { id: true, name: true, role: true },
          },
          procedure: true,
        },
      });

      if (!consent) {
        throw new AppError('Consent not found', 404);
      }

      return consent;
    } catch (error) {
      logger.error(`Get Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create informed consent checklist
   */
  async createInformedConsentChecklist(consentId, checklistItems, currentUser) {
    try {
      const consent = await this.prisma.ipdConsent.findUnique({
        where: { id: consentId },
      });

      if (!consent) {
        throw new AppError('Consent not found', 404);
      }

      const checklist = await this.prisma.ipdConsentChecklist.create({
        data: {
          consentId,
          items: checklistItems, // Array of { item, completed, notes }
          completedBy: currentUser.id,
          completedDate: new Date(),
          status: checklistItems.every((item) => item.completed) ? 'COMPLETED' : 'PENDING',
        },
      });

      logger.info(`Consent checklist created for consent ${consentId}`);
      return checklist;
    } catch (error) {
      logger.error(`Create Checklist Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify consent compliance
   */
  async verifyConsentCompliance(admissionId, procedureId) {
    try {
      // Check if signed consent exists for procedure
      const consent = await this.prisma.ipdConsent.findFirst({
        where: {
          admissionId,
          procedureId,
          status: 'SIGNED',
        },
      });

      if (!consent) {
        return {
          compliant: false,
          message: 'No signed consent form found for this procedure',
          consentId: null,
        };
      }

      // Check if consent checklist is completed
      const checklist = await this.prisma.ipdConsentChecklist.findFirst({
        where: {
          consentId: consent.id,
          status: 'COMPLETED',
        },
      });

      return {
        compliant: !!checklist,
        message: checklist
          ? 'Consent verification complete'
          : 'Consent form signed but checklist not completed',
        consentId: consent.id,
        checklistCompleted: !!checklist,
      };
    } catch (error) {
      logger.error(`Verify Consent Compliance Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create anesthesia consent
   */
  async createAnesthesiaConsent(admissionId, data, currentUser) {
    try {
      const {
        procedureId,
        anesthesiaType,
        anesthesiologistName,
        risks,
        alternatives,
        otherMedications,
      } = data;

      const consent = await this.createConsent(
        admissionId,
        {
          consentType: 'ANESTHESIA',
          description: `Anesthesia consent for ${anesthesiaType}`,
          procedureId,
          risks: risks || [
            'Nausea and vomiting',
            'Allergic reactions',
            'Blood pressure changes',
            'Breathing complications',
          ],
          benefits: ['Pain relief', 'Muscle relaxation'],
          alternatives: alternatives || ['Regional anesthesia', 'Local anesthesia', 'Sedation'],
          patientEducationProvided: true,
          specialInstructions: `Anesthesiologist: ${anesthesiologistName}. Pre-operative medications: ${otherMedications || 'None'}`,
        },
        currentUser
      );

      logger.info(`Anesthesia consent created for admission ${admissionId}`);
      return consent;
    } catch (error) {
      logger.error(`Create Anesthesia Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create surgery consent
   */
  async createSurgeryConsent(admissionId, data, currentUser) {
    try {
      const {
        procedureId,
        surgeryName,
        surgeonName,
        indication,
        alternatives,
        possibleComplications,
      } = data;

      const consent = await this.createConsent(
        admissionId,
        {
          consentType: 'SURGERY',
          description: `Surgical consent for ${surgeryName}`,
          procedureId,
          risks: possibleComplications || [
            'Bleeding',
            'Infection',
            'Scarring',
            'Nerve damage',
            'Death (rare)',
          ],
          benefits: ['Treatment of condition', 'Symptom relief'],
          alternatives: alternatives || ['Conservative management', 'Medication', 'Observation'],
          patientEducationProvided: true,
          specialInstructions: `Surgeon: ${surgeonName}. Indication: ${indication}`,
        },
        currentUser
      );

      logger.info(`Surgery consent created for admission ${admissionId}`);
      return consent;
    } catch (error) {
      logger.error(`Create Surgery Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create blood transfusion consent
   */
  async createBloodTransfusionConsent(admissionId, data, currentUser) {
    try {
      const { indication, bloodType, units, risks, alternatives } = data;

      const consent = await this.createConsent(
        admissionId,
        {
          consentType: 'TREATMENT',
          description: `Blood transfusion consent - ${bloodType}`,
          risks: risks || [
            'Allergic reactions',
            'Hemolytic reaction',
            'Transfusion-related acute lung injury',
            'Infectious disease transmission (rare)',
          ],
          benefits: ['Correction of anemia', 'Improvement of oxygen-carrying capacity'],
          alternatives: alternatives || [
            'Autologous transfusion',
            'Cell salvage',
            'Artificial blood substitutes',
          ],
          patientEducationProvided: true,
          specialInstructions: `Indication: ${indication}. Blood type: ${bloodType}. Units required: ${units}`,
        },
        currentUser
      );

      logger.info(`Blood transfusion consent created for admission ${admissionId}`);
      return consent;
    } catch (error) {
      logger.error(`Create Blood Transfusion Consent Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get consent audit trail
   */
  async getConsentAuditTrail(consentId) {
    try {
      const consent = await this.prisma.ipdConsent.findUnique({
        where: { id: consentId },
        include: {
          documentedByUser: {
            select: { name: true, email: true },
          },
          witnessedByUser: {
            select: { name: true, email: true },
          },
        },
      });

      if (!consent) {
        throw new AppError('Consent not found', 404);
      }

      return {
        consentId,
        type: consent.consentType,
        status: consent.status,
        created: {
          by: consent.documentedByUser?.name,
          at: consent.documentedDate,
        },
        signed: {
          patientSigned: consent.patientSignedDate ? true : false,
          at: consent.patientSignedDate,
          witnessedBy: consent.witnessedByUser?.name,
          witnessedAt: consent.witnessedDate,
        },
        withdrawn: consent.status === 'WITHDRAWN' ? {
          by: consent.withdrawnBy,
          reason: consent.withdrawalReason,
          at: consent.withdrawnDate,
        } : null,
      };
    } catch (error) {
      logger.error(`Get Consent Audit Trail Error: ${error.message}`);
      throw error;
    }
  }
}
