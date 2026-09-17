import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as employeeService from '../services/employee.service';
import { createEmployeeSchema, updateEmployeeSchema, listEmployeeQuerySchema } from '../validators/employee.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listEmployeeQuerySchema.parse(req.query);
  const { items, meta } = await employeeService.listEmployees(query);
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const employee = await employeeService.getEmployee(id);
  res.json({ success: true, data: employee });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createEmployeeSchema.parse(req.body);
  const employee = await employeeService.createEmployee(input);
  res.status(201).json({ success: true, data: employee });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateEmployeeSchema.parse(req.body);
  const employee = await employeeService.updateEmployee(id, input);
  res.json({ success: true, data: employee });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await employeeService.deactivateEmployee(id);
  res.json({ success: true, message: 'Đã ngừng hoạt động tài khoản nhân viên' });
});
