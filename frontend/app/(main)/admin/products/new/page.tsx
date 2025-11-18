'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  shortDescription: z.string().optional(),
  priceUSD: z.string().optional(),
  priceMNs: z.string().optional(),
  comparePriceUSD: z.string().optional(),
  comparePriceMNs: z.string().optional(),
  sku: z.string().optional(),
  stock: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Stock inválido',
  }),
  categoryId: z.string().min(1, 'Categoría requerida'),
});

type ProductForm = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    try {
      await api.post('/products', {
        ...data,
        priceUSD: data.priceUSD ? parseFloat(data.priceUSD) : undefined,
        priceMNs: data.priceMNs ? parseFloat(data.priceMNs) : undefined,
        comparePriceUSD: data.comparePriceUSD ? parseFloat(data.comparePriceUSD) : undefined,
        comparePriceMNs: data.comparePriceMNs ? parseFloat(data.comparePriceMNs) : undefined,
        stock: parseInt(data.stock),
        isActive: true,
        isFeatured: false,
        images: images,
        allergens: [],
      });
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Nuevo Producto</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register('slug')} />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <textarea
                id="description"
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripción Corta</Label>
              <Input id="shortDescription" {...register('shortDescription')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceUSD">Precio USD</Label>
                <Input id="priceUSD" type="number" step="0.01" {...register('priceUSD')} />
                {errors.priceUSD && (
                  <p className="text-sm text-destructive">{errors.priceUSD.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceMNs">Precio MNs</Label>
                <Input id="priceMNs" type="number" step="0.01" {...register('priceMNs')} />
                {errors.priceMNs && (
                  <p className="text-sm text-destructive">{errors.priceMNs.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comparePriceUSD">Precio Comparación USD</Label>
                <Input id="comparePriceUSD" type="number" step="0.01" {...register('comparePriceUSD')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePriceMNs">Precio Comparación MNs</Label>
                <Input id="comparePriceMNs" type="number" step="0.01" {...register('comparePriceMNs')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register('sku')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <select
                  id="categoryId"
                  {...register('categoryId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imágenes del Producto</Label>
              <ImageUpload value={images} onChange={setImages} multiple maxFiles={10} />
              <p className="text-sm text-gray-500">
                Puedes subir hasta 10 imágenes. La primera será la imagen principal.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Producto'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

