/**
 * IPD Clinical Notes Service
 * Manage progress notes, assessments, and clinical documentation
 */

import logger from '../../core/utils/logger.js';
import { AppError } from '../../shared/exceptions/AppError.js';

export class IPDClinicalNotesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Create progress note
   */
  async createProgressNote(admissionId, data, currentUser) {
    try {
      const {
        noteType, // MORNING_ROUND, EVENING_ROUND, ADMISSION, TRANSFER, GENERAL
        content,
        assessment,
        plan,
        clinicalObservations,
        attachments,
      } = data;

      // Verify admission exists
      const admission = await this.prisma.ipdAdmission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        throw new AppError('Admission not found', 404);
      }

      const note = await this.prisma.ipdProgressNote.create({
        data: {
          admissionId,
          noteType,
          content,
          assessment,
          plan,
          clinicalObservations,
          attachments,
          createdBy: currentUser.id,
          createdDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Progress note created for admission ${admissionId}`);
      return note;
    } catch (error) {
      logger.error(`Create Progress Note Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get progress notes for admission
   */
  async getProgressNotes(admissionId, skip = 0, take = 20) {
    try {
      const [notes, total] = await Promise.all([
        this.prisma.ipdProgressNote.findMany({
          where: { admissionId },
          skip,
          take,
          orderBy: { createdDate: 'desc' },
          include: {
            createdByUser: {
              select: { id: true, name: true, role: true, specialization: true },
            },
          },
        }),
        this.prisma.ipdProgressNote.count({ where: { admissionId } }),
      ]);

      return { notes, total, skip, take };
    } catch (error) {
      logger.error(`Get Progress Notes Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update progress note
   */
  async updateProgressNote(noteId, data, currentUser) {
    try {
      const { content, assessment, plan, clinicalObservations } = data;

      // Verify user owns the note or is admin
      const note = await this.prisma.ipdProgressNote.findUnique({
        where: { id: noteId },
      });

      if (!note) {
        throw new AppError('Note not found', 404);
      }

      if (note.createdBy !== currentUser.id && currentUser.role !== 'ADMIN') {
        throw new AppError('Unauthorized to edit this note', 403);
      }

      const updatedNote = await this.prisma.ipdProgressNote.update({
        where: { id: noteId },
        data: {
          content: content || note.content,
          assessment: assessment || note.assessment,
          plan: plan || note.plan,
          clinicalObservations: clinicalObservations || note.clinicalObservations,
          updatedDate: new Date(),
          updatedBy: currentUser.id,
        },
      });

      logger.info(`Progress note ${noteId} updated`);
      return updatedNote;
    } catch (error) {
      logger.error(`Update Progress Note Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create clinical assessment
   */
  async createAssessment(admissionId, data, currentUser) {
    try {
      const {
        assessmentType, // NURSING, DOCTOR, PHYSIOTHERAPY, DIETICIAN
        findings,
        riskFactors,
        recommendations,
        attachments,
      } = data;

      const assessment = await this.prisma.ipdAssessment.create({
        data: {
          admissionId,
          assessmentType,
          findings,
          riskFactors,
          recommendations,
          attachments,
          assessedBy: currentUser.id,
          assessmentDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Assessment created for admission ${admissionId}`);
      return assessment;
    } catch (error) {
      logger.error(`Create Assessment Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get assessments for admission
   */
  async getAssessments(admissionId, filters = {}) {
    try {
      const { assessmentType } = filters;

      const where = { admissionId };
      if (assessmentType) where.assessmentType = assessmentType;

      const assessments = await this.prisma.ipdAssessment.findMany({
        where,
        orderBy: { assessmentDate: 'desc' },
        include: {
          assessedByUser: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return assessments;
    } catch (error) {
      logger.error(`Get Assessments Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create nursing note
   */
  async createNursingNote(admissionId, data, currentUser) {
    try {
      const {
        observations,
        interventions,
        patientResponse,
        vitalSignsCheck,
        fluidBalance,
        hygieneCare,
        notes,
      } = data;

      const nursingNote = await this.prisma.ipdNursingNote.create({
        data: {
          admissionId,
          observations,
          interventions,
          patientResponse,
          vitalSignsCheck,
          fluidBalance,
          hygieneCare,
          notes,
          recordedBy: currentUser.id,
          recordedDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Nursing note created for admission ${admissionId}`);
      return nursingNote;
    } catch (error) {
      logger.error(`Create Nursing Note Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get nursing notes for admission
   */
  async getNursingNotes(admissionId, skip = 0, take = 20) {
    try {
      const [notes, total] = await Promise.all([
        this.prisma.ipdNursingNote.findMany({
          where: { admissionId },
          skip,
          take,
          orderBy: { recordedDate: 'desc' },
          include: {
            recordedByUser: {
              select: { id: true, name: true, role: true },
            },
          },
        }),
        this.prisma.ipdNursingNote.count({ where: { admissionId } }),
      ]);

      return { notes, total, skip, take };
    } catch (error) {
      logger.error(`Get Nursing Notes Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create discharge summary
   */
  async createDischargeSummary(admissionId, data, currentUser) {
    try {
      const {
        diagnosisFinal,
        treatmentProvided,
        response,
        followUpInstructions,
        medications,
        restrictions,
        dietaryAdvice,
        attachedDocuments,
      } = data;

      const summary = await this.prisma.ipdDischargeSummary.create({
        data: {
          admissionId,
          diagnosisFinal,
          treatmentProvided,
          response,
          followUpInstructions,
          medications,
          restrictions,
          dietaryAdvice,
          attachedDocuments,
          createdBy: currentUser.id,
          createdDate: new Date(),
          hospitalId: currentUser.hospitalId,
        },
      });

      logger.info(`Discharge summary created for admission ${admissionId}`);
      return summary;
    } catch (error) {
      logger.error(`Create Discharge Summary Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get discharge summary
   */
  async getDischargeSummary(admissionId) {
    try {
      const summary = await this.prisma.ipdDischargeSummary.findUnique({
        where: { admissionId },
        include: {
          createdByUser: {
            select: { name: true, role: true },
          },
        },
      });

      return summary;
    } catch (error) {
      logger.error(`Get Discharge Summary Error: ${error.message}`);
      throw error;
    }
  }
}
