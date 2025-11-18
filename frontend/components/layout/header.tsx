'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/logo';
import { ShoppingCart, User, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <LogoWithText />
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-sm font-medium hover:text-primary">
            Productos
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-primary">
            Categorías
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.firstName || user?.email}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

