'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  slug: z.string().min(1, 'Slug requerido'),
  description: z.string().optional(),
  order: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: 'Orden inválido',
  }),
  isActive: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function EditCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>('');
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/categories/${categoryId}`);
        const category = response.data;

        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          order: category.order?.toString() || '0',
          isActive: category.isActive,
        });
        setImage(category.image || '');
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [categoryId, reset]);

  const onSubmit = async (data: CategoryForm) => {
    setLoading(true);
    try {
      await api.patch(`/categories/${categoryId}`, {
        ...data,
        order: parseInt(data.order),
        image: image || undefined,
      });
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Editar Categoría</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
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
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen de la Categoría</Label>
              <ImageUpload value={image ? [image] : []} onChange={(urls) => setImage(urls[0] || '')} multiple={false} maxFiles={1} />
              <p className="text-sm text-gray-500">
                Imagen representativa de la categoría
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input id="order" type="number" {...register('order')} />
                {errors.order && (
                  <p className="text-sm text-destructive">{errors.order.message}</p>
                )}
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register('isActive')} />
                  <span>Activa</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

