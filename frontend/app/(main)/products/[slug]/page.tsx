import { api } from "@/lib/api"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductClient } from "./product-client"

export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
    const product: any = response.data

    // Generar descripción rica y evitar que sea vacía
    const description = product?.shortDescription
      || product?.description?.substring(0, 160)
      || `Compra ${product?.name} en Habaluna. Calidad garantizada, precios competitivos y envío a toda Cuba.`

    // Construir URL de imagen absoluta
    const imageUrl = product?.images?.[0]
      ? (product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`)
      : undefined

    const url = `/products/${slug}`

    return {
      title: `${product?.name || 'Producto'} | Habaluna`,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: product?.name,
        description,
        url,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'website',
        siteName: 'Habaluna',
      },
      twitter: {
        card: 'summary_large_image',
        title: product?.name,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch {
    return {
      title: "Producto | Habaluna",
      robots: {
        index: false, // Si falla la carga, no indexar producto roto
        follow: true
      }
    }
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  let product: any
  try {
    const response = await api.get(`/products/slug/${encodeURIComponent(slug)}`)
    product = response.data
  } catch {
    notFound()
  }

  let relatedProducts: any[] = []
  try {
    // Usar el nuevo endpoint de productos relacionados
    if (product?.id) {
      relatedProducts = await api.getRelatedProducts(product.id, 8)
    }
  } catch {
    // Fallback a búsqueda manual si el endpoint falla
    try {
      if (product?.categoryId) {
        const res = await api.getProducts({ page: 1, limit: 24, categoryId: product.categoryId })
        relatedProducts = (res.data || []).filter((p: any) => p.id !== product.id).slice(0, 8)
      }
    } catch {
      relatedProducts = []
    }
  }

  let reviewsData: any = null
  try {
    if (product?.id) {
      reviewsData = await api.getProductReviews(product.id, 1, 5)
    }
  } catch {
    reviewsData = null
  }

  return (
    <ProductClient
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={reviewsData?.data || []}
      initialReviewsMeta={reviewsData?.meta}
    />
  )
}
