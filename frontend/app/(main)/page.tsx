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

async function getAllProducts() {
  try {
    // Obtener todos los productos
    const params = new URLSearchParams({
      limit: '100',
      page: '1',
    });
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
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
  const productsData = await getAllProducts();
  const categories = await getCategories();
  
  // Agrupar productos por categoría
  const productsByCategory: Record<string, any[]> = {};
  productsData.data?.forEach((product: any) => {
    const categoryName = product.category?.name || 'Otros';
    if (!productsByCategory[categoryName]) {
      productsByCategory[categoryName] = [];
    }
    productsByCategory[categoryName].push(product);
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-luna-blue via-luna-blue-light to-luna-blue-pastel overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-8 animate-fade-in">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up delay-100 drop-shadow-lg">
            Habanaluna
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-4 font-light animate-fade-in-up delay-200 drop-shadow-md">
            Productos gourmet de la más alta calidad
          </p>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-300">
            Descubre una selección cuidadosa de productos premium que transformarán tu experiencia culinaria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-400">
            <Link href="#productos">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 group bg-white text-luna-blue hover:bg-white/90 shadow-xl">
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-luna-blue shadow-xl">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-8 rounded-2xl bg-white hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-luna-blue to-luna-blue-light text-white mb-4 shadow-lg">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Envío Gratis</h3>
              <p className="text-gray-600 text-sm">En pedidos superiores a 50€</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-luna-blue to-luna-blue-light text-white mb-4 shadow-lg">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Garantía de Calidad</h3>
              <p className="text-gray-600 text-sm">Productos seleccionados artesanalmente</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-luna-blue to-luna-blue-light text-white mb-4 shadow-lg">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Productos Premium</h3>
              <p className="text-gray-600 text-sm">Solo lo mejor para tu mesa</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-luna-blue to-luna-blue-light text-white mb-4 shadow-lg">
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Hecho con Amor</h3>
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

      {/* Products by Category Section */}
      <section id="productos" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-luna-blue to-luna-blue-light bg-clip-text text-transparent">
              Nuestros Productos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra selección premium organizada por categorías
            </p>
          </div>

          {Object.entries(productsByCategory).map(([categoryName, products]) => (
            <div key={categoryName} className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="w-1 h-12 bg-gradient-to-b from-luna-blue to-luna-blue-light rounded-full"></span>
                  {categoryName}
                </h3>
                <Link 
                  href={`/products?categoryId=${products[0]?.categoryId}`}
                  className="text-luna-blue hover:text-luna-blue-light font-semibold flex items-center gap-2 transition-colors"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.slice(0, 10).map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                        {getFirstImage(product.images) ? (
                          <img
                            src={getFirstImage(product.images)!}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-6xl">🍽️</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-luna-blue transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm min-h-[2.5rem]">
                          {product.shortDescription || product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <ProductPrice
                            priceUSD={product.variants && product.variants.length > 0 ? product.variants[0].priceUSD : product.priceUSD}
                            priceMNs={product.variants && product.variants.length > 0 ? product.variants[0].priceMNs : product.priceMNs}
                            comparePriceUSD={product.variants && product.variants.length > 0 ? product.variants[0].comparePriceUSD : product.comparePriceUSD}
                            comparePriceMNs={product.variants && product.variants.length > 0 ? product.variants[0].comparePriceMNs : product.comparePriceMNs}
                            variant="default"
                          />
                          <div className="text-luna-blue group-hover:text-luna-blue-light transition-colors flex items-center gap-1 text-sm font-medium">
                            Ver
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {products.length > 10 && (
                <div className="text-center mt-8">
                  <Link 
                    href={`/products?categoryId=${products[0]?.categoryId}`}
                    className="inline-flex items-center gap-2 text-luna-blue hover:text-luna-blue-light font-semibold transition-colors"
                  >
                    Ver {products.length - 10} productos más de {categoryName}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          ))}

          {(!productsData.data || productsData.data.length === 0) && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl mb-2">No hay productos disponibles</p>
              <p className="text-gray-400 text-sm">
                Los productos aparecerán aquí cuando estén disponibles
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
      <section className="py-20 bg-gradient-to-br from-luna-blue via-luna-blue-light to-luna-blue-pastel text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
            ¿Listo para descubrir sabores únicos?
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto drop-shadow-md">
            Únete a nuestra comunidad de amantes de la buena comida y disfruta de productos
            seleccionados especialmente para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-luna-blue hover:bg-white/90 shadow-xl">
                Ver Catálogo Completo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-luna-blue shadow-xl">
                Explorar Categorías
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
