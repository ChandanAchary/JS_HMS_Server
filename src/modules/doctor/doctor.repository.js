/**
 * Doctor Repository
 * Data access layer for Doctor entity
 */

export class DoctorRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find doctor by ID
   */
  async findById(id, options = {}) {
    return this.prisma.doctor.findUnique({
      where: { id },
      ...options
    });
  }

  /**
   * Find doctor by email
   */
  async findByEmail(email) {
    return this.prisma.doctor.findFirst({
      where: { 
        email: email.toLowerCase(),
        isDeleted: false
      }
    });
  }

  /**
   * Find doctor by email or phone
   */
  async findByEmailOrPhone(emailOrPhone, hospitalId = null) {
    const whereClause = {
      OR: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone }
      ],
      isDeleted: false
    };

    if (hospitalId) {
      whereClause.hospitalId = hospitalId;
    }

    return this.prisma.doctor.findFirst({ where: whereClause });
  }

  /**
   * Check if doctor exists with email or phone
   */
  async existsByEmailOrPhone(email, phone) {
    return this.prisma.doctor.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });
  }

  /**
   * Create new doctor
   */
  async create(data) {
    return this.prisma.doctor.create({ data });
  }

  /**
   * Update doctor by ID
   */
  async update(id, data) {
    return this.prisma.doctor.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete doctor
   */
  async softDelete(id) {
    return this.prisma.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        isLoggedIn: false,
        deletedAt: new Date()
      }
    });
  }

  /**
   * Find all doctors for a hospital
   */
  async findAllByHospital(hospitalId, options = {}) {
    const { select, where: additionalWhere = {}, orderBy = { createdAt: 'desc' } } = options;
    
    const query = {
      where: { 
        hospitalId,
        isDeleted: false,
        ...additionalWhere
      },
      orderBy
    };

    if (select && Object.values(select).some(Boolean)) {
      query.select = select;
    }

    return this.prisma.doctor.findMany(query);
  }

  /**
   * Find doctors with pagination
   */
  async findWithPagination(hospitalId, { page = 1, limit = 10, search = '', specialization = null }) {
    const skip = (page - 1) * limit;
    
    const whereClause = {
      hospitalId,
      isDeleted: false
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (specialization) {
      whereClause.specialization = specialization;
    }

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.doctor.count({ where: whereClause })
    ]);

    return {
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update login status
   */
  async updateLoginStatus(id, isLoggedIn) {
    const data = { isLoggedIn };
    if (isLoggedIn) {
      data.lastLoginAt = new Date();
    }
    return this.prisma.doctor.update({
      where: { id },
      data
    });
  }

  /**
   * Update salary
   */
  async updateSalary(id, salary) {
    return this.prisma.doctor.update({
      where: { id },
      data: { salary }
    });
  }

  /**
   * Update bank details
   */
  async updateBankDetails(id, { accountNumber, ifscCode }) {
    return this.prisma.doctor.update({
      where: { id },
      data: { accountNumber, ifscCode }
    });
  }

  /**
   * Update delegated permissions
   */
  async updateDelegatedPermissions(id, permissions) {
    return this.prisma.doctor.update({
      where: { id },
      data: { delegatedPermissions: permissions }
    });
  }

  /**
   * Count doctors by hospital
   */
  async countByHospital(hospitalId) {
    return this.prisma.doctor.count({
      where: { hospitalId, isDeleted: false }
    });
  }

  /**
   * Find doctors by specialization
   */
  async findBySpecialization(hospitalId, specialization) {
    return this.prisma.doctor.findMany({
      where: { hospitalId, specialization, isDeleted: false }
    });
  }
}

export default DoctorRepository;
