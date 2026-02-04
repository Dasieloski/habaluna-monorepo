'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { api, mapBackendProductToFrontend } from '@/lib/api';
import { toNumber } from '@/lib/money';
import { ProductFilters } from '@/components/product/product-filters';
import { AnimatedList } from '@/components/ui/animated-list';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

type UIProduct = {
  id: string;
  name: string;
  slug: string;
  priceUSD?: number;
  comparePriceUSD?: number;
  images?: string[];
  adultsOnly?: boolean;
  variants?: Array<{ priceUSD?: number; comparePriceUSD?: number }>;
};

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const productsPerPage = 12;
  const router = useRouter();
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete('page'); else params.set('page', String(p));
    router.replace(params.toString() ? `?${params.toString()}` : '/products', { scroll: false });
  };

  // Cargar categorías
  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
    }).catch(() => {
      // Ignorar errores
    });
  }, []);

  // Cargar productos cuando cambian los filtros
  const loadProducts = useCallback(async () => {
    let cancelled = false;

    try {
      setLoading(true);

      const filters: any = { page: currentPage, limit: productsPerPage };

      // Aplicar filtros de la URL
      if (searchParams.get('search')) filters.search = searchParams.get('search');
      if (searchParams.get('categoryId')) filters.categoryId = searchParams.get('categoryId');
      if (searchParams.get('minPrice')) filters.minPrice = Number(searchParams.get('minPrice'));
      if (searchParams.get('maxPrice')) filters.maxPrice = Number(searchParams.get('maxPrice'));
      if (searchParams.get('inStock') === 'true') filters.inStock = true;
      if (searchParams.get('isFeatured') === 'true') filters.isFeatured = true;
      if (searchParams.get('sortBy')) filters.sortBy = searchParams.get('sortBy');
      if (searchParams.get('filter') === 'combos') filters.isCombo = true;

      const response = await api.getProducts(filters);
      const mapped = response.data.map(mapBackendProductToFrontend) as any[];

      const next: UIProduct[] = mapped.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceUSD: p.priceUSD,
        comparePriceUSD: p.comparePriceUSD,
        images: p.images,
        adultsOnly: p.adultsOnly,
        variants: p.variants,
      }));

      if (!cancelled) {
        setProducts(next);
        setTotalResults(response.meta?.total || 0);
      }
    } catch (e) {
      console.error('Error al cargar productos:', e);
      if (!cancelled) {
        setProducts([]);
        setTotalResults(0);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [searchParams.toString(), currentPage]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const totalPages = Math.ceil(totalResults / productsPerPage);
  const pagedProducts = products;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-primary transition-colors">Productos</Link>
            {searchParams.get('categoryId') && (() => {
              const cat = categories.find((c) => c.id === searchParams.get('categoryId'));
              return cat ? (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link href={`/products?categoryId=${searchParams.get('categoryId')}`} className="hover:text-primary transition-colors">{cat.name}</Link>
                </>
              ) : null;
            })()}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">
              {searchParams.get('filter') === 'combos' ? 'Combos' : searchParams.get('categoryId') ? 'Productos' : 'Todos'}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        <h1 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-6 md:mb-8">
          {searchParams.get('filter') === 'combos' ? 'Combos' : 'Productos'}
        </h1>

        <ProductFilters categories={categories} />

        {!loading && (
          <div className="mb-4 text-sm text-muted-foreground">
            {totalResults === 0
              ? 'No se encontraron productos'
              : totalResults === 1
                ? '1 producto encontrado'
                : `${totalResults} productos encontrados`}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <AnimatedList
            staggerDelay={0.03}
            enableAnimations={true}
            animateOnViewport={false}
            className="grid gap-4 md:gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </AnimatedList>
        ) : pagedProducts.length === 0 ? (
          <EmptyState
            variant="search"
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title="No se encontraron productos"
            description={searchParams.get('search')
              ? `No hay resultados para «${searchParams.get('search')}». Prueba con otra palabra o revisa los filtros.`
              : 'Intenta ajustar los filtros o realizar una búsqueda diferente.'}
            action={
              <Button variant="outline" asChild>
                <Link href="/products">Limpiar y ver todos</Link>
              </Button>
            }
            className="py-16"
          />
        ) : (
          <>
            <div aria-live="polite" aria-label="Listado de productos">
              <AnimatedList
                staggerDelay={0.05}
                enableAnimations={true}
                animateOnViewport={true}
                className="grid gap-4 md:gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]"
              >
                {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    images: p.images,
                    priceUSD: toNumber(p.variants?.[0]?.priceUSD ?? p.priceUSD) ?? undefined,
                    comparePriceUSD: toNumber(p.variants?.[0]?.comparePriceUSD ?? p.comparePriceUSD) ?? undefined,
                    adultsOnly: p.adultsOnly,
                    variants: p.variants?.map((v: any) => ({
                      id: v.id,
                      name: v.name,
                      priceUSD: v.priceUSD,
                      comparePriceUSD: v.comparePriceUSD,
                    })),
                  }}
                />
              ))}
              </AnimatedList>
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginación" aria-live="polite">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Página anterior">
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground" aria-current="page">
                  Página {currentPage} de {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Página siguiente">
                  Siguiente
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
