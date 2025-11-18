'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Estadísticas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.totalProducts || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.overview?.totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatPrice(stats?.overview?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">{order.orderNumber}</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.user?.email} - {order.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No hay pedidos recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos con Bajo Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts?.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">{product.name}</span>
                      <span className="text-destructive">Stock: {product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Todos los productos tienen stock suficiente
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

