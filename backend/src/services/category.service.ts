import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export async function listCategories(search?: string) {
  return prisma.category.findMany({
    where: search ? { name: { contains: search } } : undefined,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategory(id: number) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw AppError.notFound('Không tìm thấy danh mục');
  return category;
}

async function ensureUniqueSlug(slug: string, excludeId?: number) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw AppError.conflict('Slug danh mục đã tồn tại');
  }
}

export async function createCategory(input: CreateCategoryInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  await ensureUniqueSlug(slug);
  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  await getCategory(id);
  const slug = input.slug ? slugify(input.slug) : input.name ? slugify(input.name) : undefined;
  if (slug) await ensureUniqueSlug(slug, id);

  return prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });
}

export async function deleteCategory(id: number) {
  await getCategory(id);
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw AppError.conflict('Không thể xoá danh mục đang có món ăn. Vui lòng chuyển món sang danh mục khác trước.');
  }
  await prisma.category.delete({ where: { id } });
}
