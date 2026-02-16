/**
 * Patient Repository
 * Data access layer for Patient entity
 */

export class PatientRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Find patient by internal ID
   */
  async findById(id) {
    return this.prisma.patient.findUnique({
      where: { id }
    });
  }

  /**
   * Find patient by patientId (display ID)
   */
  async findByPatientId(patientId, hospitalId) {
    return this.prisma.patient.findFirst({
      where: { patientId, hospitalId }
    });
  }

  /**
   * Find patient by phone
   */
  async findByPhone(phone, hospitalId) {
    return this.prisma.patient.findFirst({
      where: { phone, hospitalId }
    });
  }

  /**
   * Create new patient
   */
  async create(data) {
    return this.prisma.patient.create({ data });
  }

  /**
   * Update patient
   */
  async update(id, data) {
    return this.prisma.patient.update({
      where: { id },
      data
    });
  }

  /**
   * Find all patients for a hospital
   */
  async findAllByHospital(hospitalId) {
    return this.prisma.patient.findMany({
      where: { hospitalId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Search patients by query
   */
  async search(hospitalId, query, limit = 50) {
    if (!query) {
      return [];
    }

    return this.prisma.patient.findMany({
      where: {
        hospitalId,
        OR: [
          { patientId: { equals: query } },
          { patientId: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Find patients with pagination
   */
  async findWithPagination(hospitalId, { page = 1, limit = 10, search = '' }) {
    const skip = (page - 1) * limit;
    
    const whereClause = { hospitalId };

    if (search) {
      whereClause.OR = [
        { patientId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.patient.count({ where: whereClause })
    ]);

    return {
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get patients with their bills
   */
  async findAllWithBills(hospitalId) {
    const patients = await this.prisma.patient.findMany({
      where: { hospitalId },
      orderBy: { createdAt: 'desc' }
    });

    const patientIds = patients.map(p => p.patientId);

    if (patientIds.length === 0) {
      return { patients: [], billsByPatient: {} };
    }

    const bills = await this.prisma.bill.findMany({
      where: {
        hospitalId,
        patientId: { in: patientIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    const billsByPatient = bills.reduce((acc, b) => {
      acc[b.patientId] = acc[b.patientId] || [];
      acc[b.patientId].push(b);
      return acc;
    }, {});

    return { patients, billsByPatient };
  }

  /**
   * Count patients by hospital
   */
  async countByHospital(hospitalId) {
    return this.prisma.patient.count({
      where: { hospitalId }
    });
  }
}

export default PatientRepository;

















