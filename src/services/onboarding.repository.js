/**
 * Onboarding Repository
 * Data access layer for join requests, registration tokens, verifications
 */

export class JoinRequestRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.joinRequest.findUnique({ where: { id } });
  }

  async findByEmail(email, hospitalId, statuses = null) {
    const where = { 
      email: email.toLowerCase(), 
      hospitalId 
    };
    
    if (statuses) {
      where.status = { in: statuses };
    }
    
    return this.prisma.joinRequest.findFirst({ where });
  }

  async findLatestByEmail(email) {
    return this.prisma.joinRequest.findFirst({
      where: { email: email.toLowerCase() },
      orderBy: { submittedAt: 'desc' }
    });
  }

  async findByHospital(hospitalId) {
    return this.prisma.joinRequest.findMany({
      where: { hospitalId },
      orderBy: { submittedAt: 'desc' }
    });
  }

  async create(data) {
    return this.prisma.joinRequest.create({ data });
  }

  async update(id, data) {
    return this.prisma.joinRequest.update({
      where: { id },
      data
    });
  }
}

export class RegistrationTokenRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findValidToken(token, role) {
    return this.prisma.registrationToken.findFirst({
      where: {
        token,
        role: role.toUpperCase(),
        expiresAt: { gt: new Date() },
        used: false
      }
    });
  }

  async create(data) {
    return this.prisma.registrationToken.create({ data });
  }

  async markUsed(id, usedBy) {
    return this.prisma.registrationToken.update({
      where: { id },
      data: {
        used: true,
        usedBy,
        usedAt: new Date()
      }
    });
  }
}

export class VerificationRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findPendingDoctors(hospitalId) {
    return this.prisma.doctor.findMany({
      where: {
        hospitalId,
        status: 'PENDING_VERIFICATION'
      }
    });
  }

  async findPendingEmployees(hospitalId) {
    return this.prisma.employee.findMany({
      where: {
        hospitalId,
        status: 'PENDING_VERIFICATION'
      }
    });
  }
}

export default {
  JoinRequestRepository,
  RegistrationTokenRepository,
  VerificationRepository
};

















