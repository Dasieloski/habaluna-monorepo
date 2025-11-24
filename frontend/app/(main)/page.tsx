import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { api } from '@/lib/api';
import { getFirstImage, getImageUrl } from '@/lib/image-utils';
import { ArrowRight, Star, Truck, Shield, Award, Heart } from 'lucide-react';
import { ProductPrice } from '@/components/product/product-price';

async function getBanners() {
  try {
    const response = await api.get('/banners');
    return response.data;
  } catch (error) {
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    // Usar URLSearchParams para construir la query string correctamente
    const params = new URLSearchParams({
      isFeatured: 'true',
      limit: '6',
      page: '1',
    });
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return { data: [], meta: { total: 0 } };
  }
}

async function getCategories() {
  try {
    const response = await api.get('/categories');
    return response.data || [];
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const banners = await getBanners();
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-8 animate-fade-in">
            <Logo size="lg" />
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-4 font-light animate-fade-in-up delay-100">
            Productos gourmet de la más alta calidad
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Descubre una selección cuidadosa de productos premium que transformarán tu experiencia culinaria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <Link href="/products">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Explorar Productos
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Ver Categorías
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600 text-sm">En pedidos superiores a 50€</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantía de Calidad</h3>
              <p className="text-gray-600 text-sm">Productos seleccionados artesanalmente</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Productos Premium</h3>
              <p className="text-gray-600 text-sm">Solo lo mejor para tu mesa</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hecho con Amor</h3>
              <p className="text-gray-600 text-sm">Productos artesanales y tradicionales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Nuestras Categorías</h2>
              <p className="text-xl text-gray-600">Explora nuestra selección premium</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category: any) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🍯</span>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Productos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una selección cuidadosa de nuestros productos más exclusivos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.data?.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                    {getFirstImage(product.images) ? (
                      <img
                        src={getFirstImage(product.images)!}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Destacado
                      </div>
                    )}
                    {product.comparePrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        -{Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {product.shortDescription || product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <ProductPrice
                        priceUSD={product.variants && product.variants.length > 0 ? product.variants[0].priceUSD : product.priceUSD}
                        priceMNs={product.variants && product.variants.length > 0 ? product.variants[0].priceMNs : product.priceMNs}
                        comparePriceUSD={product.variants && product.variants.length > 0 ? product.variants[0].comparePriceUSD : product.comparePriceUSD}
                        comparePriceMNs={product.variants && product.variants.length > 0 ? product.variants[0].comparePriceMNs : product.comparePriceMNs}
                        variant="large"
                      />
                      <div className="text-primary group-hover:underline transition-colors flex items-center gap-1 text-sm font-medium">
                        Ver más
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {(!featuredProducts.data || featuredProducts.data.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos destacados disponibles</p>
              <p className="text-gray-400 text-sm mt-2">
                Los productos destacados aparecerán aquí cuando estén disponibles
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner: any) => (
                <Link
                  key={banner.id}
                  href={banner.link || '#'}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="aspect-[2/1] bg-gradient-to-br from-primary to-primary/80 relative">
                    {getImageUrl(banner.image) ? (
                      <img
                        src={getImageUrl(banner.image)!}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-8">
                      <h3 className="text-3xl font-bold mb-2">{banner.title}</h3>
                      {banner.description && (
                        <p className="text-lg opacity-90">{banner.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para descubrir sabores únicos?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a nuestra comunidad de amantes de la buena comida y disfruta de productos
            seleccionados especialmente para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Comenzar a Comprar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
