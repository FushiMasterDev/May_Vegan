export function getPrimaryImage(product: { images?: { imageUrl: string; isPrimary: boolean }[] }): string | null {
  if (!product.images?.length) return null;
  return product.images.find((i) => i.isPrimary)?.imageUrl ?? product.images[0].imageUrl;
}
