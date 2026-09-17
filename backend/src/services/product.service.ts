import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { ListProductQuery, CreateProductInput, UpdateProductInput } from '../validators/product.validator';

export async function listProducts(query: ListProductQuery) {
  const { page, limit, skip, take } = parsePagination(query);

  const where: Prisma.ProductWhereInput = {
    status: query.status ?? { not: 'HIDDEN' },
  };

  if (query.search) where.name = { contains: query.search };
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
  if (query.isBestSeller !== undefined) where.isBestSeller = query.isBestSeller;
  if (query.onSale) where.salePrice = { not: null };
  if (query.isNew) {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    where.createdAt = { gte: since };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === 'price_asc'
      ? { price: 'asc' }
      : query.sort === 'price_desc'
        ? { price: 'desc' }
        : query.sort === 'popular'
          ? { soldCount: 'desc' }
          : query.sort === 'rating'
            ? { ratingAvg: 'desc' }
            : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: true, images: { orderBy: { displayOrder: 'asc' } } },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getProductBySlugOrId(idOrSlug: string) {
  const numericId = Number(idOrSlug);
  const product = await prisma.product.findFirst({
    where: Number.isInteger(numericId) && numericId > 0 ? { id: numericId } : { slug: idOrSlug },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      reviews: {
        where: { status: 'VISIBLE' },
        orderBy: { createdAt: 'desc' },
        include: { customer: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
      },
    },
  });
  if (!product) throw AppError.notFound('Không tìm thấy món ăn');
  return product;
}

async function ensureUniqueSlug(slug: string, excludeId?: number) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && existing.id !== excludeId) {
    throw AppError.conflict('Slug món ăn đã tồn tại');
  }
}

async function ensureCategoryExists(categoryId: number) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw AppError.badRequest('Danh mục không tồn tại');
}

export async function createProduct(input: CreateProductInput) {
  await ensureCategoryExists(input.categoryId);
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  await ensureUniqueSlug(slug);

  return prisma.product.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      ingredientsText: input.ingredientsText,
      calories: input.calories,
      allergyInfo: input.allergyInfo,
      price: input.price,
      salePrice: input.salePrice,
      status: input.status ?? 'AVAILABLE',
      isFeatured: input.isFeatured ?? false,
      isBestSeller: input.isBestSeller ?? false,
    },
    include: { category: true, images: true },
  });
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Không tìm thấy món ăn');

  if (input.categoryId) await ensureCategoryExists(input.categoryId);
  const slug = input.slug ? slugify(input.slug) : input.name ? slugify(input.name) : undefined;
  if (slug) await ensureUniqueSlug(slug, id);

  const price = input.price ?? Number(product.price);
  const salePrice = input.salePrice === null ? null : (input.salePrice ?? undefined);
  if (salePrice !== undefined && salePrice !== null && salePrice >= price) {
    throw AppError.badRequest('Giá khuyến mãi phải nhỏ hơn giá gốc', { path: ['salePrice'] });
  }

  return prisma.product.update({
    where: { id },
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description,
      ingredientsText: input.ingredientsText,
      calories: input.calories,
      allergyInfo: input.allergyInfo,
      price: input.price,
      salePrice,
      status: input.status,
      isFeatured: input.isFeatured,
      isBestSeller: input.isBestSeller,
    },
    include: { category: true, images: true },
  });
}

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Không tìm thấy món ăn');

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    throw AppError.conflict(
      'Không thể xoá món đã từng có trong đơn hàng. Hãy ẩn món (chuyển trạng thái HIDDEN) thay vì xoá.'
    );
  }
  await prisma.product.delete({ where: { id } });
}

export async function addProductImage(productId: number, imageUrl: string, isPrimary: boolean) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound('Không tìm thấy món ăn');

  if (isPrimary) {
    await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
  }

  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { displayOrder: true },
  });

  return prisma.productImage.create({
    data: {
      productId,
      imageUrl,
      isPrimary,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });
}

export async function removeProductImage(productId: number, imageId: number) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) throw AppError.notFound('Không tìm thấy hình ảnh');
  await prisma.productImage.delete({ where: { id: imageId } });
}
