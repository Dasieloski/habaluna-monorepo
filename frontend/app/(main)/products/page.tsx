import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { getFirstImage } from '@/lib/image-utils';

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const params = new URLSearchParams();
    if (searchParams.categoryId) params.append('categoryId', searchParams.categoryId as string);
    if (searchParams.search) params.append('search', searchParams.search as string);
    if (searchParams.page) params.append('page', searchParams.page as string);
    params.append('limit', '12');

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { data: products, meta } = await getProducts(searchParams);

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square bg-gray-200 relative flex items-center justify-center">
                {getFirstImage(product.images) ? (
                  <img
                    src={getFirstImage(product.images)!}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-primary">
                      {product.variants && product.variants.length > 0
                        ? formatPrice(product.variants[0].priceUSD, product.variants[0].priceMNs)
                        : formatPrice(product.priceUSD, product.priceMNs)}
                    </p>
                    {(product.variants && product.variants.length > 0 && (product.variants[0].comparePriceUSD || product.variants[0].comparePriceMNs)) ||
                    (product.comparePriceUSD || product.comparePriceMNs) ? (
                      <p className="text-sm text-gray-400 line-through">
                        {product.variants && product.variants.length > 0
                          ? formatPrice(product.variants[0].comparePriceUSD, product.variants[0].comparePriceMNs)
                          : formatPrice(product.comparePriceUSD, product.comparePriceMNs)}
                      </p>
                    ) : null}
                  </div>
                  {product.variants && product.variants.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {product.variants.length} opciones
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/products?page=${page}`}
              className="px-4 py-2 border rounded hover:bg-primary hover:text-white"
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

