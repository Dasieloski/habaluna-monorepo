import { Suspense } from "react"
import ProductsClient from "./products-client"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productos | Habaluna",
  description:
    "Explora nuestro catálogo completo de productos únicos: alimentos gourmet, bebidas premium, materiales de construcción y más. Calidad garantizada y envíos a toda Cuba.",
  alternates: {
    canonical: "/products",
  },
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-sm text-gray-600">Cargando...</div>}>
      <ProductsClient />
    </Suspense>
  )
}

