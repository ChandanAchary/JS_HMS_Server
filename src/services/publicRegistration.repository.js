/**
 * PublicRegistration Repository
 * Data access layer for public registration operations
 */

export class PublicHospitalRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAllActive() {
    return this.prisma.hospital.findMany({
      where: { isActive: true },
      select: {
        id: true,
        hospitalName: true,
        address: true,
        latitude: true,
        longitude: true
      },
      orderBy: { hospitalName: 'asc' }
    });
  }

  /**
   * Get the first active hospital (single-tenant)
   */
  async findFirstActive() {
    return this.prisma.hospital.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        hospitalName: true,
        address: true,
        isActive: true
      }
    });
  }

  async findById(id) {
    return this.prisma.hospital.findUnique({
      where: { id },
      select: {
        id: true,
        hospitalName: true,
        address: true,
        latitude: true,
        longitude: true,
        emailDomain: true,
        isActive: true
      }
    });
  }
}

export class PublicFormTemplateRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByHospitalAndType(hospitalId, type) {
    return this.prisma.formTemplate.findUnique({
      where: {
        hospitalId_type: { hospitalId, type }
      }
    });
  }

  async findByHospitalWithSynonyms(hospitalId, type) {
    const synonyms = {
      EMPLOYEE: ['EMPLOYEE', 'STAFF', 'EMPLOYEE_REGISTRATION', 'STAFF_REGISTRATION'],
      DOCTOR: ['DOCTOR', 'PHYSICIAN', 'MEDICAL', 'DOCTOR_REGISTRATION']
    }[type] ?? [type];

    return this.prisma.formTemplate.findFirst({
      where: {
        hospitalId,
        OR: synonyms.map(t => ({ type: { equals: t, mode: 'insensitive' } }))
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export class PublicJoinRequestRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findPendingByEmail(hospitalId, email) {
    return this.prisma.joinRequest.findFirst({
      where: {
        hospitalId,
        email: email.toLowerCase(),
        status: 'PENDING'
      }
    });
  }

  /**
   * Find active application by email and role
   */
  async findActiveByEmailAndRole(email, role, hospitalId) {
    return this.prisma.joinRequest.findFirst({
      where: {
        hospitalId,
        email: email.toLowerCase(),
        role,
        status: { in: ['PENDING', 'FORM_SUBMITTED'] }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }

  async findLatestByEmailOrPhone(email, phone, hospitalId = null) {
    const query = {
      status: { in: ['PENDING', 'FORM_SUBMITTED', 'APPROVED', 'REJECTED'] }
    };

    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    if (email) {
      query.email = email.toLowerCase();
    } else if (phone) {
      query.phone = phone;
    }

    return this.prisma.joinRequest.findFirst({
      where: query,
      orderBy: { submittedAt: 'desc' },
      include: {
        Hospital: {
          select: {
            id: true,
            hospitalName: true
          }
        }
      }
    });
  }

  async create(data) {
    return this.prisma.joinRequest.create({ data });
  }
}

export default {
  PublicHospitalRepository,
  PublicFormTemplateRepository,
  PublicJoinRequestRepository
};

















