/**
 * Admin Repository
 * Data access layer for Admin operations
 */

export class AdminRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  async findByIdWithHospital(id) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true,
        role: true,
        designation: true,
        address: true,
        hospitalId: true,
        isOwner: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            logo: true,
            registrationType: true,
            registrationNumber: true,
            address: true,
            city: true,
            state: true,
            country: true,
            contactEmail: true,
            contactPhone: true,
          }
        }
      }
    });
  }

  async findByEmailOrPhone(emailOrPhone) {
    return this.prisma.admin.findFirst({
      where: {
        OR: [
          { email: emailOrPhone.trim().toLowerCase() },
          { phone: emailOrPhone.trim() }
        ]
      },
      include: {
        hospital: {
          select: { id: true, hospitalName: true, address: true, contactEmail: true, contactPhone: true }
        }
      }
    });
  }

  async count() {
    return this.prisma.admin.count();
  }

  async findByEmail(email) {
    return this.prisma.admin.findFirst({ where: { email } });
  }

  async findByPhone(phone) {
    return this.prisma.admin.findFirst({ where: { phone } });
  }

  async create(data) {
    return this.prisma.admin.create({ data });
  }

  async update(id, data) {
    return this.prisma.admin.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return this.prisma.admin.delete({ where: { id } });
  }
}

export class HospitalRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.hospital.findUnique({ where: { id } });
  }

  async update(id, data) {
    return this.prisma.hospital.update({
      where: { id },
      data
    });
  }
}

export class AssignmentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByAssignee(hospitalId, assigneeType, assigneeId, status = 'ASSIGNED') {
    return this.prisma.assignment.findMany({
      where: {
        hospitalId,
        assigneeType,
        assigneeId,
        status
      }
    });
  }

  async findByHospital(hospitalId) {
    return this.prisma.assignment.findMany({
      where: { hospitalId },
      orderBy: { startDateTime: 'asc' }
    });
  }

  async create(data) {
    return this.prisma.assignment.create({ data });
  }
}

export class FormTemplateRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByHospitalAndType(hospitalId, type) {
    return this.prisma.formTemplate.findUnique({
      where: { hospitalId_type: { hospitalId, type } }
    });
  }

  async create(data) {
    return this.prisma.formTemplate.create({ data });
  }

  async update(hospitalId, type, data) {
    return this.prisma.formTemplate.update({
      where: { hospitalId_type: { hospitalId, type } },
      data
    });
  }
}

export class PayrollRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByUserId(userId, hospitalId) {
    return this.prisma.payroll.findFirst({
      where: { userId, hospitalId }
    });
  }

  async findByEmployeeId(employeeId, hospitalId) {
    return this.prisma.payroll.findFirst({
      where: { employeeId, hospitalId }
    });
  }

  async findByDoctorId(doctorId, hospitalId) {
    return this.prisma.payroll.findFirst({
      where: { doctorId, hospitalId }
    });
  }

  async findByHospital(hospitalId) {
    return this.prisma.payroll.findMany({
      where: { hospitalId }
    });
  }

  async create(data) {
    return this.prisma.payroll.create({ data });
  }

  async update(id, data) {
    return this.prisma.payroll.update({
      where: { id },
      data
    });
  }
}

export default {
  AdminRepository,
  HospitalRepository,
  AssignmentRepository,
  FormTemplateRepository,
  PayrollRepository
};

















