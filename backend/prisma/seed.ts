import { PrismaClient, UserRole, EmploymentType, EmployeeStatus, AttendanceStatus, LeaveRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.employeeDocument.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🧹 Cleaned previous database state.');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 2. Create Super Admin (System level, no organization required)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`👤 Super Admin created: ${superAdmin.email}`);

  // 3. Create Demo Organization: ABC Technologies
  const org = await prisma.organization.create({
    data: {
      name: 'ABC Technologies Inc.',
      code: 'ABCTECH',
      email: 'contact@abctechnologies.com',
      phone: '+1 (555) 019-2834',
      website: 'https://abctechnologies.example.com',
      address: '100 Innovation Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      status: 'ACTIVE',
    },
  });
  console.log(`🏢 Organization created: ${org.name} (${org.code})`);

  // 4. Create Departments
  const engineeringDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development, DevOps, and Quality Assurance',
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Human Resources',
      code: 'HR',
      description: 'People operations, recruiting, and culture',
    },
  });

  const productDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Product Management',
      code: 'PROD',
      description: 'Product roadmap, design, and user research',
    },
  });

  // 5. Create Leave Types
  const casualLeave = await prisma.leaveType.create({
    data: {
      organizationId: org.id,
      name: 'Casual Leave',
      code: 'CASUAL',
      description: 'For short personal needs and emergencies',
      annualLimit: 12,
    },
  });

  const sickLeave = await prisma.leaveType.create({
    data: {
      organizationId: org.id,
      name: 'Sick Leave',
      code: 'SICK',
      description: 'For medical appointments or illness',
      annualLimit: 10,
    },
  });

  const annualLeave = await prisma.leaveType.create({
    data: {
      organizationId: org.id,
      name: 'Annual / Paid Leave',
      code: 'ANNUAL',
      description: 'Planned vacation and annual time off',
      annualLimit: 15,
    },
  });

  // 6. Create Employees & Users for each Role
  // 6a. Organization Admin (Alice Vance - Executive Root)
  const adminEmp = await prisma.employee.create({
    data: {
      organizationId: org.id,
      employeeCode: 'EMP-001',
      firstName: 'Alice',
      lastName: 'Vance',
      email: 'admin@example.com',
      phone: '+1 555-0101',
      designation: 'VP of Operations',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
      departmentId: hrDept.id,
      joiningDate: new Date('2023-01-15'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      employeeId: adminEmp.id,
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ORGANIZATION_ADMIN,
    },
  });

  // 6b. HR Lead (Hannah Reed - Reports to Alice)
  const hrEmp = await prisma.employee.create({
    data: {
      organizationId: org.id,
      employeeCode: 'EMP-002',
      firstName: 'Hannah',
      lastName: 'Reed',
      email: 'hr@example.com',
      phone: '+1 555-0102',
      designation: 'Senior HR Manager',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
      departmentId: hrDept.id,
      managerId: adminEmp.id,
      joiningDate: new Date('2023-03-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      employeeId: hrEmp.id,
      email: 'hr@example.com',
      password: hashedPassword,
      role: UserRole.HR,
    },
  });

  // Update HR department manager
  await prisma.department.update({
    where: { id: hrDept.id },
    data: { managerId: hrEmp.id },
  });

  // 6c. Engineering Manager (Marcus Sterling - Reports to Alice)
  const managerEmp = await prisma.employee.create({
    data: {
      organizationId: org.id,
      employeeCode: 'EMP-003',
      firstName: 'Marcus',
      lastName: 'Sterling',
      email: 'manager@example.com',
      phone: '+1 555-0103',
      designation: 'Engineering Manager',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      departmentId: engineeringDept.id,
      managerId: adminEmp.id,
      joiningDate: new Date('2023-02-10'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      employeeId: managerEmp.id,
      email: 'manager@example.com',
      password: hashedPassword,
      role: UserRole.MANAGER,
    },
  });

  // Update Engineering department manager
  await prisma.department.update({
    where: { id: engineeringDept.id },
    data: { managerId: managerEmp.id },
  });

  // 6d. Software Engineer (Ethan Cole - Reports to Marcus)
  const devEmp = await prisma.employee.create({
    data: {
      organizationId: org.id,
      employeeCode: 'EMP-004',
      firstName: 'Ethan',
      lastName: 'Cole',
      email: 'employee@example.com',
      phone: '+1 555-0104',
      designation: 'Senior Full Stack Engineer',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
      departmentId: engineeringDept.id,
      managerId: managerEmp.id,
      joiningDate: new Date('2023-06-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
    },
  });

  const devUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      email: 'employee@example.com',
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    },
  });

  // 6e. Software Engineer (Yadhu Krishna - Reports to Alice)
  const yadhuEmp = await prisma.employee.create({
    data: {
      organizationId: org.id,
      employeeCode: 'EMP-005',
      firstName: 'Yadhu',
      lastName: 'krishna',
      email: 'yadhu@example.com',
      phone: '+1 555-0105',
      designation: 'Software Engineering',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
      departmentId: engineeringDept.id,
      managerId: adminEmp.id,
      joiningDate: new Date('2023-07-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
    },
  });

  console.log('👥 Employees and user accounts seeded successfully.');

  // 7. Seed Leave Balances for 2026
  const currentYear = new Date().getFullYear();
  const allEmployees = [adminEmp, hrEmp, managerEmp, devEmp, yadhuEmp];
  const allLeaveTypes = [casualLeave, sickLeave, annualLeave];

  for (const emp of allEmployees) {
    for (const lt of allLeaveTypes) {
      await prisma.leaveBalance.create({
        data: {
          organizationId: org.id,
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: currentYear,
          allocated: lt.annualLimit,
          used: emp.id === devEmp.id && lt.code === 'CASUAL' ? 2 : 0,
          remaining: emp.id === devEmp.id && lt.code === 'CASUAL' ? lt.annualLimit - 2 : lt.annualLimit,
        },
      });
    }
  }

  // 8. Seed Leave Request
  await prisma.leaveRequest.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      leaveTypeId: casualLeave.id,
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-03-11'),
      numberOfDays: 2,
      reason: 'Personal family appointment',
      status: LeaveRequestStatus.APPROVED,
      approvedBy: managerEmp.id,
      approvedAt: new Date('2026-03-08'),
    },
  });

  // 9. Seed Salaries & Payslips
  const devSalary = await prisma.salary.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      basicSalary: 8500,
      allowances: 1500,
      deductions: 800,
      netSalary: 9200,
      effectiveFrom: new Date('2023-06-01'),
      status: 'ACTIVE',
    },
  });

  await prisma.payslip.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      salaryId: devSalary.id,
      month: 8,
      year: 2026,
      basicSalary: 8500,
      allowances: 1500,
      deductions: 800,
      netSalary: 9200,
    },
  });

  // 10. Seed Performance Review
  await prisma.performanceReview.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      reviewerId: managerEmp.id,
      reviewPeriod: 'H1 2026',
      technicalSkill: 4.8,
      communication: 4.2,
      teamwork: 4.6,
      problemSolving: 4.9,
      overallRating: 4.6,
      comments: 'Ethan has done outstanding architectural work delivering high reliability across multi-tenant microservices.',
      status: 'SUBMITTED',
    },
  });

  // 11. Seed Attendance for Today
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.attendance.create({
    data: {
      organizationId: org.id,
      employeeId: devEmp.id,
      date: today,
      checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: AttendanceStatus.PRESENT,
      workingHours: 4.0,
      remarks: 'On time',
    },
  });

  console.log('✅ Database successfully seeded with demo enterprise organization and users!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
