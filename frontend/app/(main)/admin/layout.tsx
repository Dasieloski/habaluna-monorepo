'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/logo';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen p-6">
          <Link href="/" className="block mb-8">
            <LogoWithText />
          </Link>
          <h2 className="text-lg font-semibold text-gray-600 mb-6">Panel de Administración</h2>
          <nav className="space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Productos
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="ghost" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Categorías
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Pedidos
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Usuarios
              </Button>
            </Link>
            <Link href="/admin/stats">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Estadísticas
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start mt-8"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

