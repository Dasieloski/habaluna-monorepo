'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { ProductPrice } from "@/components/product/product-price"
import { toNumber } from "@/lib/money"
import { useToast } from "@/hooks/use-toast"
import { getTriggerRect } from "@/lib/contextual-toast-utils"
import { api, getApiBaseUrlLazy } from "@/lib/api"
import { useCartStore } from "@/lib/store/cart-store"
import {
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ReturnIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons/streamline-icons"
import { SmartImage } from "@/components/ui/smart-image"

import { ProductReviews } from "@/components/reviews/product-reviews"

interface ProductClientProps {
  product: any
  relatedProducts?: any[]
  initialReviews?: any[]
  initialReviewsMeta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder.svg"
  
  // Eliminar referencias a Cloudinary - usar solo imágenes de la BD
  if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary')) {
    console.warn('[normalizeImageUrl] URL de Cloudinary detectada, ignorando:', imagePath)
    return "/placeholder.svg"
  }
  
  // Si es una URL completa que NO es Cloudinary, retornarla
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }
  
  // Usar getApiBaseUrlLazy() en lugar de localhost hardcodeado
  const base = getApiBaseUrlLazy()
  
  // Priorizar URLs de la BD: /api/media/{id}
  if (imagePath.startsWith("/api/media/")) {
    return `${base}${imagePath}`
  }
  
  if (imagePath.startsWith("/")) return `${base}${imagePath}`
  return `${base}/uploads/${imagePath}`
}

export function ProductClient({
  product,
  relatedProducts = [],
  initialReviews = [],
  initialReviewsMeta,
}: ProductClientProps) {
  const { toast, showSuccess, showError, showAddToCart } = useToast()
  const addToCart = useCartStore((s) => s.addToCart)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>("desc")
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => product?.variants?.[0]?.id || "")
  const [stockNotifyEmail, setStockNotifyEmail] = useState("")
  const [stockNotifyLoading, setStockNotifyLoading] = useState(false)
  const [stockNotifyDone, setStockNotifyDone] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const relatedScrollRef = useRef<HTMLDivElement>(null)
  const isCombo = Boolean(product?.isCombo)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)


  const images = useMemo(() => {
    const raw: string[] = Array.isArray(product?.images) ? product.images : []
    const combined: string[] = raw.map(normalizeImageUrl).filter(Boolean)

    // Si es combo, meter también imágenes de los productos incluidos para verlas en el carrusel
    if (isCombo) {
      const items = Array.isArray(product?.comboItems) ? product.comboItems : []
      for (const ci of items) {
        const p = ci?.product || ci?.item || ci?.includedProduct || null
        const imgs: string[] = Array.isArray(p?.images) ? p.images : []
        for (const img of imgs) {
          const u = normalizeImageUrl(img || "")
          if (u) combined.push(u)
        }
      }
    }

    const deduped = Array.from(new Set(combined))
    return deduped.length > 0 ? deduped : ["/placeholder.svg"]
  }, [isCombo, product?.comboItems, product?.images])

  useEffect(() => {
    if (selectedImage >= images.length) setSelectedImage(0)
  }, [images.length, selectedImage])

  const comboItems = useMemo(() => {
    const raw = Array.isArray(product?.comboItems) ? product.comboItems : []
    return raw
      .map((ci: any) => {
        const p = ci?.product || ci?.item || ci?.includedProduct || null
        const rawImages: string[] = Array.isArray(p?.images) ? p.images : []
        const image = normalizeImageUrl(rawImages[0] || "")
        const name = p?.name || "Producto"
        const slug = p?.slug || ""
        const id = ci?.id || `${ci?.comboId || product?.id || "combo"}-${p?.id || slug || name}`
        const quantity = Math.max(1, Number(ci?.quantity ?? 1) || 1)

        return { id, name, slug, image, quantity }
      })
      .filter((x: any) => Boolean(x?.name))
  }, [product?.comboItems, product?.id])

  const variants = Array.isArray(product?.variants) ? product.variants : []
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || null

  const priceUSD = toNumber(selectedVariant?.priceUSD ?? product?.priceUSD) ?? 0
  const comparePriceUSD = toNumber(selectedVariant?.comparePriceUSD ?? product?.comparePriceUSD)
  const hasDiscount = comparePriceUSD !== null && comparePriceUSD > priceUSD
  const salePercentage =
    hasDiscount && comparePriceUSD
      ? Math.round(((comparePriceUSD - priceUSD) / comparePriceUSD) * 100)
      : null

  const stock = selectedVariant ? Number(selectedVariant.stock ?? 0) : Number(product?.stock ?? 0)
  const stockLabel = stock <= 0 ? "Agotado" : stock < 5 ? `Quedan ${stock}` : "En stock"
  const reviewCount = initialReviewsMeta?.total ?? product?.reviewCount ?? 0
  const avgRating = product?.averageRating != null ? Number(product.averageRating).toFixed(1) : null

  const handleStockNotify = async () => {
    const email = stockNotifyEmail.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Email inválido", description: "Escribe un correo válido.", variant: "destructive" })
      return
    }
    setStockNotifyLoading(true)
    try {
      await api.stockNotify(product.id, email)
      setStockNotifyDone(true)
      showSuccess("¡Listo! 📧", "Te avisaremos cuando haya stock.")
    } catch (e: any) {
      showError("Error", e?.response?.data?.message || "No se pudo registrar. Intenta de nuevo.")
    } finally {
      setStockNotifyLoading(false)
    }
  }

  const shareProduct = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const title = product?.name || "Producto"
      const text = product?.shortDescription || ""

      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }

      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
        toast({ title: "Enlace copiado 📋", description: "¡Compártelo!" })
        return
      }

      toast({
        title: "Ups… tu navegador no colabora 😅",
        description: "No puede compartir ni copiar el enlace. Prueba en otro dispositivo.",
        variant: "destructive",
      })
    } catch (e: any) {
      // Si el usuario cancela el share, no es error real
      if (e?.name === "AbortError") return
      toast({
        title: "Ups… no se pudo compartir 😅",
        description: "Algo falló al intentar. Prueba de nuevo.",
        variant: "destructive",
      })
    }
  }


  const scrollRelated = (direction: "left" | "right") => {
    if (!relatedScrollRef.current) return
    const scrollAmount = 280
    relatedScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Link href="/" className="hover:text-accent transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-accent transition-colors">
            Productos
          </Link>
          {product?.categoryId && (
            <>
              <span>/</span>
              <Link
                href={`/products?categoryId=${encodeURIComponent(product.categoryId)}`}
                className="hover:text-accent transition-colors"
              >
                {product?.category?.name || "Categoría"}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product?.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <section className="container mx-auto px-4 pb-8 md:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
          {/* Left - Gallery */}
          <div className="w-full overflow-hidden" style={{ maxWidth: '100%' }}>
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all relative ${
                      selectedImage === idx
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <SmartImage
                      src={img || "/placeholder.svg"}
                      alt={`Vista ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      objectFit="cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative w-full aspect-square bg-muted rounded-xl md:rounded-2xl overflow-hidden group">
                <SmartImage
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={product?.name || "Producto"}
                  fill
                  className="p-4 md:p-8 object-contain group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  objectFit="contain"
                  priority
                />
                {images.length > 1 && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-background/80 text-xs text-muted-foreground">
                    {selectedImage + 1} / {images.length}
                  </span>
                )}
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background dark:hover:bg-card transition-all z-10 text-foreground"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-background/90 dark:bg-card/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background dark:hover:bg-card transition-all z-10 text-foreground"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="w-full flex flex-col bg-background dark:bg-card relative z-10 rounded-xl md:rounded-2xl p-4 md:p-6 border border-transparent dark:border-border" style={{ minWidth: 0 }}>
            {/* Category */}
            {product?.category?.name && (
              <span className="text-xs md:text-sm text-accent font-medium mb-1 md:mb-2">{product.category.name}</span>
            )}

            {/* Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">{product?.name}</h1>
                {isCombo && (
                  <div className="mb-2 md:mb-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wide uppercase bg-accent text-accent-foreground px-3 py-1 rounded-full">
                        Combo
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        Incluye varios productos seleccionados
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {product?.shortDescription && (
              <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-3">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-2 md:mb-3">
              <ProductPrice priceUSD={priceUSD} comparePriceUSD={comparePriceUSD ?? undefined} variant="large" />
              {salePercentage !== null && (
                <span className="text-xs md:text-sm font-semibold text-highlight-foreground bg-highlight px-3 py-1 rounded-full">
                  -{salePercentage}%
                </span>
              )}
            </div>
            {product?.sku && (
              <p className="text-xs text-muted-foreground mb-1">Ref. {product.sku}</p>
            )}
            {reviewCount > 0 && (
              <a href="#reviews" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors mb-2">
                ★ {avgRating || "—"} ({reviewCount} reseña{reviewCount !== 1 ? "s" : ""})
              </a>
            )}

            {/* Combo contents */}
            {isCombo && comboItems.length > 0 && (
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm md:text-base font-semibold text-foreground">Este combo incluye</h3>
                  <span className="text-xs text-muted-foreground">{comboItems.length} productos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {comboItems.map((item: any) => {
                    const card = (
                      <>
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                          <SmartImage
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            objectFit="cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                      </>
                    )

                    if (item.slug) {
                      return (
                        <Link
                          key={item.id}
                          href={`/products/${encodeURIComponent(item.slug)}`}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:bg-muted/40 transition-colors"
                        >
                          {card}
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 opacity-80"
                      >
                        {card}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variants: chips si ≤4, sino select */}
            {variants.length > 0 && (
              <div className="mb-4 md:mb-6">
                <span className="block text-sm font-medium text-foreground mb-2">Elige una opción</span>
                {variants.length <= 4 ? (
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v: any) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedVariantId === v.id
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border hover:border-accent/50 text-foreground"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <select
                    id="product-variant-select"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full md:w-auto px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-ring bg-background dark:bg-input"
                    aria-label="Seleccionar variante del producto"
                  >
                    {variants.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {stock > 0 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs text-muted-foreground">{stockLabel}</p>
                </div>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
                  >
                    +
                  </button>
                </div>
              </>
            )}

            {/* Add to cart (UI) o Agotado + Avísame */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              {stock <= 0 ? (
                <div className="flex-1 space-y-3">
                  <p className="text-muted-foreground font-medium">Agotado</p>
                  {!stockNotifyDone ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={stockNotifyEmail}
                        onChange={(e) => setStockNotifyEmail(e.target.value)}
                        placeholder="Tu email"
                        className="flex-1 px-3 py-2 border border-border rounded-xl text-sm bg-background"
                      />
                      <button
                        onClick={handleStockNotify}
                        disabled={stockNotifyLoading}
                        className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
                      >
                        {stockNotifyLoading ? "..." : "Avísame cuando haya stock"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-accent">Te avisaremos por email.</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={async (e) => {
                    const rect = getTriggerRect(e.currentTarget)
                    try {
                      await addToCart({
                        product: {
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          priceUSD: product.priceUSD ?? null,
                          priceMNs: product.priceMNs ?? null,
                          images: Array.isArray(product.images) ? product.images : [],
                        },
                        productVariant: selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, priceUSD: selectedVariant.priceUSD ?? null, priceMNs: selectedVariant.priceMNs ?? null } : null,
                        quantity,
                      })
                      setAddedFeedback(true)
                      setTimeout(() => setAddedFeedback(false), 2000)
                      if (rect) showAddToCart({ productName: `${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ""}`, triggerRect: rect })
                      else showSuccess("¡Al carrito! 🛒", `${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ""} se agregó.`)
                    } catch (err: any) {
                      showError("Ups… no se pudo añadir 😅", err?.response?.data?.message || err?.message || "No se pudo añadir")
                    }
                  }}
                  aria-label={addedFeedback ? `Añadido` : `Añadir ${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ""} al carrito`}
                  className="cart-btn flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 md:py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all text-sm md:text-base"
                >
                  {addedFeedback ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ✓ Añadido
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Añadir al carrito
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setIsFavorite(!isFavorite)
                  if (!isFavorite) toast({ title: "Añadido a favoritos", description: "En tu lista de deseos" })
                }}
                aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
                className={`heart-btn p-3.5 md:p-4 rounded-xl border transition-all ${
                  isFavorite ? "bg-red-500/10 border-red-400 text-red-500" : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <HeartIcon className="w-5 h-5 md:w-6 md:h-6" filled={isFavorite} />
              </button>
              <button onClick={shareProduct} className="p-3.5 md:p-4 rounded-xl border border-border hover:bg-muted transition-all" aria-label={`Compartir ${product.name}`} type="button">
                <ShareIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
              <Link href="/returns" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                <ReturnIcon className="w-4 h-4 md:w-5 md:h-5" />
                Devoluciones en 30 días
              </Link>
              <Link href="/shipping" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                <TruckIcon className="w-4 h-4 md:w-5 md:h-5" />
                Envío en 24–72h
              </Link>
            </div>

            {/* Delivery info */}
            <div className="bg-background dark:bg-card rounded-xl p-4 mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-transparent dark:bg-highlight/30 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrega prevista:</p>
                  <p className="text-sm font-medium text-foreground">24–72h (estimado)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-accent font-medium">
                  {freeShippingThreshold != null ? `Envío gratis desde $${freeShippingThreshold}` : "Envío en 24–72h"}
                </p>
                <Link href="/shipping" className="text-xs text-accent/80 hover:underline font-medium">Saber más</Link>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-border">
              {[
                { id: "brief", title: "Breve descripción", content: product?.shortDescription || "" },
                { id: "desc", title: "Descripción", content: product?.description || "" },
                {
                  id: "details",
                  title: "Detalles",
                  content: [
                    product?.sku ? `SKU: ${product.sku}` : null,
                    product?.weight ? `Peso: ${product.weight}` : null,
                    Array.isArray(product?.allergens) && product.allergens.length > 0
                      ? `Alérgenos: ${product.allergens.join(", ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n"),
                },
              ].filter((x) => x.id !== "brief" || x.content).map((item) => (
                <div key={item.id} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                    className="w-full py-4 flex items-center justify-between text-sm md:text-base font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {item.title}
                    <ChevronRightIcon
                      className={`w-5 h-5 transition-transform ${openAccordion === item.id ? "rotate-90" : ""}`}
                    />
                  </button>
                  {openAccordion === item.id && (
                    <div className="pb-4 text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-10 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="font-heading text-xl md:text-3xl font-bold text-foreground">También te puede interesar</h2>
                <p className="text-sm text-muted-foreground mt-1">Más productos de la misma categoría</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  aria-label="Desplazar productos relacionados hacia la izquierda"
                  className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  aria-label="Desplazar productos relacionados hacia la derecha"
                  className="p-3 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div ref={relatedScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
              {relatedProducts.map((p: any) => (
                <div key={p.id} className="shrink-0 w-[160px] md:w-[240px]">
                  <ProductCard
                    product={{
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      images: p.images?.map(normalizeImageUrl),
                      priceUSD: toNumber(p.priceUSD) ?? undefined,
                      comparePriceUSD: toNumber(p.comparePriceUSD) ?? undefined,
                      variants: p.variants,
                    }}
                    badge={undefined}
              />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-10 md:py-16 bg-muted/50 dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <ProductReviews
              productId={product?.id}
              productName={product?.name || "Producto"}
              initialReviews={initialReviews}
              initialMeta={initialReviewsMeta}
            />
          </div>
        </div>
      </section>
    </>
  )
}

