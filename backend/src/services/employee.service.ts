import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { generateEmployeeCode } from '../utils/codeGenerator';
import { parsePagination, buildMeta } from '../utils/pagination';
import { parseDateOnly } from '../utils/datetime';
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../validators/employee.validator';

const SALT_ROUNDS = 10;

export async function listEmployees(query: { search?: string; roleName?: string; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {
    ...(query.search
      ? {
          user: {
            OR: [
              { fullName: { contains: query.search } },
              { email: { contains: query.search } },
              { phone: { contains: query.search } },
            ],
          },
        }
      : {}),
    ...(query.roleName ? { user: { role: { name: query.roleName } } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { role: true } } },
    }),
    prisma.employee.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getEmployee(id: number) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: { include: { role: true } } },
  });
  if (!employee) throw AppError.notFound('Không tìm thấy nhân viên');
  return employee;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phone }] },
  });
  if (existing) throw AppError.conflict('Email hoặc số điện thoại đã được sử dụng');

  const role = await prisma.role.findUnique({ where: { name: input.roleName } });
  if (!role) throw AppError.badRequest('Vai trò không hợp lệ');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const employeeCode = await generateEmployeeCode();

  return prisma.employee.create({
    data: {
      employeeCode,
      position: input.position,
      hiredAt: input.hiredAt ? parseDateOnly(input.hiredAt) : undefined,
      user: {
        create: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          passwordHash,
          roleId: role.id,
        },
      },
    },
    include: { user: { include: { role: true } } },
  });
}

export async function updateEmployee(id: number, input: UpdateEmployeeInput) {
  const employee = await getEmployee(id);

  if (input.phone) {
    const existing = await prisma.user.findFirst({
      where: { phone: input.phone, NOT: { id: employee.userId } },
    });
    if (existing) throw AppError.conflict('Số điện thoại đã được sử dụng bởi tài khoản khác');
  }

  let roleId: number | undefined;
  if (input.roleName) {
    const role = await prisma.role.findUnique({ where: { name: input.roleName } });
    if (!role) throw AppError.badRequest('Vai trò không hợp lệ');
    roleId = role.id;
  }

  return prisma.employee.update({
    where: { id },
    data: {
      position: input.position,
      status: input.status,
      hiredAt: input.hiredAt ? parseDateOnly(input.hiredAt) : undefined,
      user: {
        update: {
          fullName: input.fullName,
          phone: input.phone,
          roleId,
        },
      },
    },
    include: { user: { include: { role: true } } },
  });
}

// Soft-delete: nhân viên nghỉ việc vẫn giữ lại lịch sử đơn hàng đã xử lý
// (orders.employee_id) thay vì xoá cứng gây mất dấu vết.
export async function deactivateEmployee(id: number) {
  const employee = await getEmployee(id);
  await prisma.$transaction([
    prisma.employee.update({ where: { id }, data: { status: 'INACTIVE' } }),
    prisma.user.update({ where: { id: employee.userId }, data: { status: 'LOCKED' } }),
  ]);
}
