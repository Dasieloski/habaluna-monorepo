import Link from 'next/link';
import { LogoWithText } from '@/components/logo';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <LogoWithText className="mb-4" />
            <p className="text-sm text-gray-600">
              Productos gourmet de la más alta calidad para los paladares más exigentes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-gray-600 hover:text-primary">
                  Iniciar Sesión
                </Link>
              </li>
              <Link href="/auth/register" className="text-gray-600 hover:text-primary">
                Registrarse
              </Link>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <p className="text-sm text-gray-600">
              Email: info@habanaluna.com
              <br />
              Teléfono: +34 900 000 000
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Habaluna. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

