import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartImage } from '@/components/ui/smart-image';

async function getCategories() {
  try {
    const response = await api.get('/categories');
    return response.data || [];
  } catch (error) {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Categorías</h1>
        <p className="text-xl text-gray-600">
          Explora nuestros productos por categoría
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any) => (
            <Link key={category.id} href={`/products?categoryId=${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {getImageUrl(category.image) && (
                    <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                      <SmartImage
                        src={getImageUrl(category.image)!}
                        alt={`Imagen de la categoría ${category.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        aspectRatio="16/9"
                        width={800}
                        height={450}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Ver productos de esta categoría →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

