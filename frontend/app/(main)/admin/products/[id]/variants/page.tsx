'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    priceUSD: '',
    priceMNs: '',
    comparePriceUSD: '',
    comparePriceMNs: '',
    sku: '',
    stock: '0',
    weight: '',
    unit: '',
    order: '0',
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      const [productResponse, variantsResponse] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/product-variants?productId=${productId}`),
      ]);
      setProduct(productResponse.data);
      setVariants(variantsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        productId,
        name: formData.name,
        priceUSD: formData.priceUSD ? parseFloat(formData.priceUSD) : undefined,
        priceMNs: formData.priceMNs ? parseFloat(formData.priceMNs) : undefined,
        comparePriceUSD: formData.comparePriceUSD ? parseFloat(formData.comparePriceUSD) : undefined,
        comparePriceMNs: formData.comparePriceMNs ? parseFloat(formData.comparePriceMNs) : undefined,
        sku: formData.sku || undefined,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        unit: formData.unit || undefined,
        order: parseInt(formData.order),
        isActive: formData.isActive,
      };

      if (editingVariant) {
        await api.patch(`/product-variants/${editingVariant.id}`, data);
      } else {
        await api.post('/product-variants', data);
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      priceUSD: variant.priceUSD?.toString() || '',
      priceMNs: variant.priceMNs?.toString() || '',
      comparePriceUSD: variant.comparePriceUSD?.toString() || '',
      comparePriceMNs: variant.comparePriceMNs?.toString() || '',
      sku: variant.sku || '',
      stock: variant.stock.toString(),
      weight: variant.weight?.toString() || '',
      unit: variant.unit || '',
      order: variant.order?.toString() || '0',
      isActive: variant.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return;

    try {
      await api.delete(`/product-variants/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      priceUSD: '',
      priceMNs: '',
      comparePriceUSD: '',
      comparePriceMNs: '',
      sku: '',
      stock: '0',
      weight: '',
      unit: '',
      order: '0',
      isActive: true,
    });
    setEditingVariant(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/products/${productId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold">Variantes de Producto</h1>
          {product && <p className="text-gray-600 mt-1">{product.name}</p>}
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva Variante'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingVariant ? 'Editar Variante' : 'Nueva Variante'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: 500 gr, Contenedor, Parlets, Caja"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceUSD">Precio USD</Label>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceMNs">Precio MNs</Label>
                  <Input
                    id="priceMNs"
                    type="number"
                    step="0.01"
                    value={formData.priceMNs}
                    onChange={(e) => setFormData({ ...formData, priceMNs: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comparePriceUSD">Precio Comparación USD</Label>
                  <Input
                    id="comparePriceUSD"
                    type="number"
                    step="0.01"
                    value={formData.comparePriceUSD}
                    onChange={(e) => setFormData({ ...formData, comparePriceUSD: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePriceMNs">Precio Comparación MNs</Label>
                  <Input
                    id="comparePriceMNs"
                    type="number"
                    step="0.01"
                    value={formData.comparePriceMNs}
                    onChange={(e) => setFormData({ ...formData, comparePriceMNs: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Peso</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="gr, kg, ml, l, unidad"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Activa</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {editingVariant ? 'Guardar Cambios' : 'Crear Variante'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Variantes</CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay variantes. Crea una nueva variante para este producto.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{variant.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Precio: {formatPrice(variant.priceUSD, variant.priceMNs)}
                      {(variant.comparePriceUSD || variant.comparePriceMNs) && (
                        <span className="ml-2 text-gray-400 line-through">
                          {formatPrice(variant.comparePriceUSD, variant.comparePriceMNs)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Stock: {variant.stock} | Orden: {variant.order}
                      {variant.weight && variant.unit && (
                        <span className="ml-2">
                          | {variant.weight} {variant.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        variant.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {variant.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(variant)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(variant.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

