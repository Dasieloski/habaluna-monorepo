import { api, mapBackendProductToFrontend } from "@/lib/api"
import { HeroBanner } from "@/components/sections/hero-banner"
import { ProductCarousel } from "@/components/sections/product-carousel"
import { CategoryGrid } from "@/components/sections/category-grid"
import { TopSales } from "@/components/sections/top-sales"
import { BenefitsBar } from "@/components/sections/benefits-bar"

// Evita que Vercel intente prerenderizar esta página en build (puede colgarse si el backend tarda/no responde).
export const dynamic = "force-dynamic"
export const revalidate = 0 // No cachear, siempre obtener datos frescos del backend

async function getBanners() {
  try {
    const banners = await api.getBanners()
    const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim()
    const apiBase = (raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw).replace(/\/api\/?$/, "")
    const normalize = (img: string) => {
      if (!img) return ""
      if (img.startsWith("http://") || img.startsWith("https://")) return img
      if (img.startsWith("/")) return `${apiBase}${img}`
      return `${apiBase}/uploads/${img}`
    }
    // Mapear a formato que usa HeroBanner
    return (Array.isArray(banners) ? banners : []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.description || undefined,
      image: normalize(b.image),
      link: b.link || undefined,
      buttonText: b.link ? "Ver más" : undefined,
      backgroundColor: "#e0f2fe",
    }))
  } catch (error) {
    return []
  }
}

async function getAllProducts() {
  try {
    // Usar la función helper del API que ya maneja correctamente los parámetros
    const productsResponse = await api.getProducts({
      limit: 100,
      page: 1,
    })
    return {
      data: productsResponse.data.map(mapBackendProductToFrontend),
      meta: productsResponse.meta,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0 } }
  }
}

async function getCategories() {
  try {
    // Usar la función helper del API
    const categories = await api.getCategories()
    return categories || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function Home() {
  const [banners, productsData, categories, bestSellersRaw] = await Promise.all([
    getBanners(),
    getAllProducts(),
    getCategories(),
    (async () => {
      try {
        return await api.getBestSellers(5)
      } catch {
        return []
      }
    })(),
  ])

  const products = productsData.data || []
  const bestSellers = (Array.isArray(bestSellersRaw) && bestSellersRaw.length > 0)
    ? bestSellersRaw.map((p: any) => mapBackendProductToFrontend(p))
    : products.slice(0, 5)

  // Debug: verificar productos +18
  if (process.env.NODE_ENV === 'development') {
    const adultsOnlyProducts = products.filter((p: any) => p.adultsOnly)
    if (adultsOnlyProducts.length > 0) {
      console.log('[Home] Productos +18 encontrados:', adultsOnlyProducts.length, adultsOnlyProducts.map((p: any) => ({ name: p.name, adultsOnly: p.adultsOnly })))
    }
  }

  // Normalizar categorías desde BD (mantener diseño actual: solo cambia fuente de datos)
  const homeCategories = (Array.isArray(categories) ? categories : []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name),
    slug: c.slug ? String(c.slug) : undefined,
    image: c.image ? String(c.image) : undefined,
  }))

  // Reutilizar las categorías de BD en todas las secciones (cards / circles / banners)
  // Mantener el layout actual: diferentes secciones pueden mostrar distintos subconjuntos.
  const displayCategories = homeCategories.slice(0, 8)
  const circleCategories = homeCategories.slice(0, 12)
  const bannerCategories = homeCategories.slice(4, 12).length > 0 ? homeCategories.slice(4, 12) : homeCategories

  // Usar solo productos del backend, sin fallback estático
  const allProducts = products

  // Ofertas del día: solo productos con descuento (comparePrice > price)
  const offersOfDay = allProducts.filter((p: any) => {
    const price = typeof p.priceUSD === "number" ? p.priceUSD : 0
    const compare = typeof p.comparePriceUSD === "number" ? p.comparePriceUSD : undefined
    return compare !== undefined && compare > price
  })

  // Productos destacados: solo productos marcados como isFeatured (desde admin)
  const featuredProducts = allProducts.filter((p: any) => !!p?.isFeatured)

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner banners={banners} />

      <ProductCarousel
        title="Ofertas del Día"
        products={offersOfDay.slice(0, 8)}
        viewAllLink="/products?filter=offers"
        badgeType="sale"
        autoSlide={true}
        className="pt-16 md:pt-24"
      />

      <CategoryGrid categories={displayCategories} variant="cards" />

      <TopSales products={bestSellers} className="pb-16 md:pb-20" />

      <ProductCarousel
        title="Productos Destacados"
        products={(featuredProducts.length > 0 ? featuredProducts : allProducts).slice(0, 8)}
        viewAllLink="/products?filter=top"
        badgeType="personalized"
        className="pt-16 md:pt-24"
      />

      <CategoryGrid categories={circleCategories} variant="circles" title="Explora por Categoría" />

      <CategoryGrid categories={bannerCategories} variant="banners" />

      <BenefitsBar />
    </div>
  )
}
