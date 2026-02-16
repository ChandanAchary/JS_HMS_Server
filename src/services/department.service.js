/**
 * Department Service
 * Business logic for department operations
 */

import {
  DEPARTMENT_FEATURES,
  DEPARTMENT_DISPLAY_ORDER,
  getAllDepartments,
  getDepartmentByCode,
  departmentRequiresLogin,
  getRolesForDepartment
} from './department.constants.js';

import {
  DIAGNOSTIC_CATEGORIES,
  DIAGNOSTIC_ROLES,
  isDiagnosticRole,
  getAllowedCategoriesForRole,
  RESULT_ENTRY_STATUS
}from '../rbac/rolePermissions.js';

export class DepartmentService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get all hospital departments for listing
   */
  async getAllDepartments() {
    const departments = getAllDepartments();
    
    return {
      departments,
      totalCount: departments.length
    };
  }

  /**
   * Get department details by code
   */
  async getDepartmentDetails(departmentCode) {
    const department = getDepartmentByCode(departmentCode);
    
    if (!department) {
      const error = new Error(`Department not found: ${departmentCode}`);
      error.statusCode = 404;
      throw error;
    }

    return department;
  }

  /**
   * Verify diagnostic login credentials and role access
   */
  async verifyDiagnosticLogin(credentials, hospitalId) {
    const { emailOrPhone, password } = credentials;

    if (!emailOrPhone || !password) {
      const error = new Error('Email/Phone and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Find employee by email or phone
    const employee = await this.prisma.employee.findFirst({
      where: {
        hospitalId,
        isActive: true,
        deletedAt: null,
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        profilePic: true,
        hospitalId: true
      }
    });

    if (!employee) {
      const error = new Error('Invalid credentials or employee not found');
      error.statusCode = 401;
      throw error;
    }

    // Import bcrypt for password verification
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.default.compare(password, employee.password);

    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if employee has diagnostic role
    if (!isDiagnosticRole(employee.role)) {
      // Provide specific error for generic EMPLOYEE role
      let errorMsg = `Access denied. Role '${employee.role}' is not authorized for diagnostics department. Allowed roles: ${DIAGNOSTIC_ROLES.join(', ')}`;
      if (employee.role === 'EMPLOYEE') {
        errorMsg = `Access denied. Generic 'EMPLOYEE' role cannot access diagnostics department.\n\nEmployee must have a specific diagnostic role such as: PATHOLOGY, XRAY, MRI, CT_SCAN, LAB_TECHNICIAN, ULTRASOUND, ECG, or ENDOSCOPY.\n\nPlease contact your administrator to update your role assignment.`;
      }
      const error = new Error(errorMsg);
      error.statusCode = 403;
      throw error;
    }

    // Get allowed test categories for this role
    const allowedCategories = getAllowedCategoriesForRole(employee.role);

    // Generate JWT token
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        userType: 'EMPLOYEE',
        hospitalId,
        department: 'DIAGNOSTICS'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        profilePic: employee.profilePic,
        department: 'DIAGNOSTICS'
      },
      allowedCategories,
      permissions: {
        canEnterResults: true,
        canViewResults: true,
        canApproveResults: ['PATHOLOGY', 'LAB_TECHNICIAN'].includes(employee.role),
        canAmendResults: ['PATHOLOGY'].includes(employee.role)
      }
    };
  }

  /**
   * Get diagnostic test categories for dashboard
   * Returns categories based on employee role
   */
  async getDiagnosticCategories(role) {
    const allowedCategories = getAllowedCategoriesForRole(role);
    
    // Filter categories based on role permissions
    const filteredCategories = {};
    
    for (const [key, category] of Object.entries(DIAGNOSTIC_CATEGORIES)) {
      // Check if any tests in this category are allowed for the role
      const allowedTests = category.tests.filter(test => {
        // If test has specific role requirement, check that
        if (test.roleRequired) {
          return test.roleRequired === role;
        }
        // Otherwise check if any of the category's test categories are allowed
        return allowedCategories.includes(test.category);
      });

      if (allowedTests.length > 0 || category.allowedRoles.includes(role)) {
        filteredCategories[key] = {
          ...category,
          tests: allowedTests.length > 0 ? allowedTests : category.tests
        };
      }
    }

    return {
      categories: filteredCategories,
      role,
      allowedTestCategories: allowedCategories
    };
  }

  /**
   * Get pending work items for diagnostic dashboard
   * Single-tenant application: hospitalId filtering removed
   * Note: DiagnosticResult doesn't have test relation, need to join manually if category filtering needed
   */
  async getDiagnosticWorklist(hospitalId, role, filters = {}) {
    const { status, category, dateFrom, dateTo, page = 1, limit = 20 } = filters;
    const allowedCategories = getAllowedCategoriesForRole(role);

    // Build where clause - single tenant, no hospitalId filtering needed
    const where = {
      status: status || {
        in: [
          RESULT_ENTRY_STATUS.SAMPLE_COLLECTED,
          RESULT_ENTRY_STATUS.IN_PROGRESS,
          RESULT_ENTRY_STATUS.PENDING_QC
        ]
      }
    };

    // Date filters
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get worklist items
    const [items, totalCount] = await Promise.all([
      this.prisma.diagnosticResult.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              name: true,
              age: true,
              gender: true
            }
          }
        },
        orderBy: [
          { createdAt: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.diagnosticResult.count({ where })
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        testId: item.testId,
        testCode: item.testCode,
        testName: item.testName,
        patient: item.patient,
        status: item.status,
        createdAt: item.createdAt
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get dashboard statistics for diagnostic department
   * Single-tenant application: hospitalId filtering removed
   * Note: DiagnosticResult doesn't have test relation, cannot filter by category
   */
  async getDiagnosticDashboardStats(hospitalId, role) {
    const allowedCategories = getAllowedCategoriesForRole(role);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Base filter - single tenant, no hospitalId or category filtering
    const baseWhere = {};

    // Get counts for different statuses
    const [
      pendingSamples,
      samplesCollected,
      inProgress,
      pendingQC,
      pendingReview,
      completedToday,
      totalToday
    ] = await Promise.all([
      this.prisma.diagnosticResult.count({
        where: { ...baseWhere, status: RESULT_ENTRY_STATUS.PENDING_SAMPLE }
      }),
      this.prisma.diagnosticResult.count({
        where: { ...baseWhere, status: RESULT_ENTRY_STATUS.SAMPLE_COLLECTED }
      }),
      this.prisma.diagnosticResult.count({
        where: { ...baseWhere, status: RESULT_ENTRY_STATUS.IN_PROGRESS }
      }),
      this.prisma.diagnosticResult.count({
        where: { ...baseWhere, status: RESULT_ENTRY_STATUS.PENDING_QC }
      }),
      this.prisma.diagnosticResult.count({
        where: { ...baseWhere, status: RESULT_ENTRY_STATUS.PENDING_REVIEW }
      }),
      this.prisma.diagnosticResult.count({
        where: {
          ...baseWhere,
          status: RESULT_ENTRY_STATUS.RELEASED,
          releasedAt: { gte: today }
        }
      }),
      this.prisma.diagnosticResult.count({
        where: {
          ...baseWhere,
          createdAt: { gte: today }
        }
      })
    ]);

    // Note: urgency is on DiagnosticOrder, not DiagnosticResult
    // For now, return 0 for urgent/stat counts until we add proper relation
    return {
      summary: {
        pendingSamples,
        samplesCollected,
        inProgress,
        pendingQC,
        pendingReview,
        completedToday,
        totalToday
      },
      workloadStatus: {
        urgent: await this.prisma.diagnosticOrder.count({
          where: {
            hospitalId,
            urgency: 'URGENT',
            status: { notIn: ['COMPLETED', 'CANCELLED'] }
          }
        }),
        stat: await this.prisma.diagnosticOrder.count({
          where: {
            hospitalId,
            urgency: 'STAT',
            status: { notIn: ['COMPLETED', 'CANCELLED'] }
          }
        })
      },
      role,
      allowedCategories
    };
  }
}


















