/**
 * Employee Repository
 * Data access layer for Employee entity
 */

export class EmployeeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find employee by ID
   */
  async findById(id, options = {}) {
    return this.prisma.employee.findUnique({
      where: { id },
      ...options
    });
  }

  /**
   * Find employee by email
   */
  async findByEmail(email) {
    return this.prisma.employee.findFirst({
      where: { 
        email: email.toLowerCase(),
        isDeleted: false
      }
    });
  }

  /**
   * Find employee by email or phone
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

    return this.prisma.employee.findFirst({ where: whereClause });
  }

  /**
   * Check if employee exists with email or phone
   */
  async existsByEmailOrPhone(email, phone) {
    return this.prisma.employee.findFirst({
      where: {
        OR: [{ email }, { phone }],
        isDeleted: false
      }
    });
  }

  /**
   * Create new employee
   */
  async create(data) {
    return this.prisma.employee.create({ data });
  }

  /**
   * Update employee by ID
   */
  async update(id, data) {
    return this.prisma.employee.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete employee
   */
  async softDelete(id) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        isDeleted: true,
        isLoggedIn: false,
        deletedAt: new Date()
      }
    });
  }

  /**
   * Find all employees for a hospital
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

    return this.prisma.employee.findMany(query);
  }

  /**
   * Find employees with pagination
   */
  async findWithPagination(hospitalId, { page = 1, limit = 10, search = '', role = null }) {
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

    if (role) {
      whereClause.role = role;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.employee.count({ where: whereClause })
    ]);

    return {
      data: employees,
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
    return this.prisma.employee.update({
      where: { id },
      data
    });
  }

  /**
   * Update salary
   */
  async updateSalary(id, salary) {
    return this.prisma.employee.update({
      where: { id },
      data: { salary }
    });
  }

  /**
   * Update bank details
   */
  async updateBankDetails(id, { accountNumber, ifscCode }) {
    return this.prisma.employee.update({
      where: { id },
      data: { accountNumber, ifscCode }
    });
  }

  /**
   * Update delegated permissions
   */
  async updateDelegatedPermissions(id, permissions) {
    return this.prisma.employee.update({
      where: { id },
      data: { delegatedPermissions: permissions }
    });
  }

  /**
   * Count employees by hospital
   */
  async countByHospital(hospitalId) {
    return this.prisma.employee.count({
      where: { hospitalId, isDeleted: false }
    });
  }

  /**
   * Find employees by role
   */
  async findByRole(hospitalId, role) {
    return this.prisma.employee.findMany({
      where: { hospitalId, role, isDeleted: false }
    });
  }
}

export default EmployeeRepository;
