import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductClient } from './product-client';

async function getProduct(slug: string) {
  try {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}

