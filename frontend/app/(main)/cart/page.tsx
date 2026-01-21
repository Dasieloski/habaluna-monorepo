"use client"

import { useEffect, useMemo, useState } from "react"
import type { MouseEvent } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, ChevronDown, ChevronUp, Truck, Gift, ShoppingBag, AlertTriangle, Tag, X } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartValidation } from "@/hooks/use-cart-validation"
import { api, mapBackendProductToFrontend } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getTriggerRect } from "@/lib/contextual-toast-utils"
import { SmartImage } from "@/components/ui/smart-image"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { CartItemSkeleton } from "@/components/cart/cart-item-skeleton"

export default function CartPage() {
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number; name: string } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState("")
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const { isAuthenticated } = useAuthStore()
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)
  const { items, subtotal, fetchCart, updateItemQuantity, removeItem, addToCart } = useCartStore()
  const { validation, getItemErrorMessage, hasItemIssue, getItemAvailableStock } = useCartValidation()
  const { toast, showAddToCart } = useToast()

  useEffect(() => {
    const loadCart = async () => {
      if (!isBootstrapped) return
      if (isAuthenticated()) {
        setIsLoadingCart(true)
        try {
          await fetchCart()
        } finally {
          setIsLoadingCart(false)
        }
      } else {
        setIsLoadingCart(false)
      }
    }
    loadCart()
  }, [fetchCart, isAuthenticated, isBootstrapped])

  // Cargar productos sugeridos
  useEffect(() => {
    const loadSuggestedProducts = async () => {
      try {
        setLoadingSuggestions(true)
        // Obtener productos destacados o productos relacionados
        // Excluir productos que ya están en el carrito
        const cartProductIds = new Set(items.map(item => item.product.id))
        
        // Intentar obtener productos destacados primero
        const response = await api.getProducts({
          page: 1,
          limit: 12,
          isFeatured: true,
        })

        let products = response.data || []
        
        // Si no hay suficientes productos destacados, obtener más productos
        if (products.length < 4) {
          const moreProducts = await api.getProducts({
            page: 1,
            limit: 20,
          })
          products = [...products, ...(moreProducts.data || [])]
        }

        // Filtrar productos que ya están en el carrito y mapear
        const mapped = products
          .map(mapBackendProductToFrontend)
          .filter((p: any) => !cartProductIds.has(p.id))
          .slice(0, 6) // Mostrar máximo 6 productos

        setSuggestedProducts(mapped)
      } catch (error) {
        console.error('Error al cargar productos sugeridos:', error)
        setSuggestedProducts([])
      } finally {
        setLoadingSuggestions(false)
      }
    }

    if (items.length > 0) {
      loadSuggestedProducts()
    } else {
      setSuggestedProducts([])
      setLoadingSuggestions(false)
    }
  }, [items])

  const handleAddSuggestedProduct = async (product: any, e: MouseEvent<HTMLElement>) => {
    const rect = getTriggerRect(e.currentTarget)
    try {
      await addToCart({
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          priceUSD: product.priceUSD ?? product.variants?.[0]?.priceUSD ?? null,
          priceMNs: product.priceMNs ?? product.variants?.[0]?.priceMNs ?? null,
          images: product.images || [],
        },
        productVariant: product.variants?.[0]?.id
          ? {
              id: product.variants[0].id,
              name: product.variants[0].name || "Variante",
              priceUSD: product.variants[0].priceUSD ?? null,
              priceMNs: product.variants[0].priceMNs ?? null,
            }
          : null,
        quantity: 1,
      })
      if (rect) showAddToCart({ productName: product.name, triggerRect: rect })
      else toast({ title: "¡Listo! 🛒", description: `${product.name} se añadió al carrito` })
    } catch (error: any) {
      toast({
        title: "Ups… no se pudo añadir 😅",
        description: error?.response?.data?.message || error?.message || "Revisa e intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const [transportEstimate, setTransportEstimate] = useState<{
    shipping: number
    positiveMessage: string
    appliedRule: { discountType: string; discountValue: number } | null
    config?: { freeShippingThresholdUSD?: number | null }
  } | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      setTransportEstimate(null)
      return
    }
    let cancelled = false
    api.getTransportEstimate(itemCount, subtotal).then((r) => {
      if (!cancelled) setTransportEstimate({ shipping: r.shipping, positiveMessage: r.positiveMessage, appliedRule: r.appliedRule, config: r.config })
    }).catch(() => { if (!cancelled) setTransportEstimate(null) })
    return () => { cancelled = true }
  }, [itemCount, items.length, subtotal])

  const shipping = transportEstimate?.shipping ?? 0
  const discount = appliedCoupon?.discount ?? 0
  const total = subtotal - discount + shipping

  const handleApplyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) {
      setCouponError("Ingresa un código")
      return
    }
    setValidatingCoupon(true)
    setCouponError("")
    try {
      const result = await api.validateOffer(code, subtotal)
      if (result.valid && result.offer) {
        setAppliedCoupon({
          id: result.offer.id,
          code: result.offer.code,
          discount: result.discount,
          name: result.offer.name,
        })
        setCouponCode("")
        toast({ title: "Cupón aplicado 🎟️", description: `Descuento: $${Number(result.discount).toFixed(2)}` })
      } else {
        setCouponError(result.message || "Cupón no válido")
        toast({ title: "Cupón no válido", description: result.message || "Revisa el código", variant: "destructive" })
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "No se pudo validar"
      setCouponError(msg)
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError("")
  }

  // Mostrar skeleton mientras carga el carrito
  if (isLoadingCart) {
    return (
      <div className="bg-muted/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <nav className="text-sm text-gray-500 mb-4 md:mb-6">
            <span className="animate-pulse">Home &gt; Carrito</span>
          </nav>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6 h-9 w-64 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-muted/80 rounded-xl p-4 md:p-6 border border-border animate-pulse">
                <div className="h-6 w-32 bg-muted-foreground/20 rounded mb-4" />
                <div className="space-y-3 mb-4">
                  <div className="h-4 bg-muted-foreground/20 rounded w-full" />
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-4 bg-muted-foreground/20 rounded w-full" />
                </div>
                <div className="border-t border-border pt-4">
                  <div className="h-5 bg-muted-foreground/20 rounded w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        variant="cart"
        icon={<ShoppingBag className="h-24 w-24" strokeWidth={1} />}
        title="Tu carrito está vacío"
        description="Añade algunos productos para empezar"
        action={
          <Button asChild>
            <Link href="/products">Explorar Productos</Link>
          </Button>
        }
        className="min-h-[60vh]"
      />
    )
  }

  return (
    <div className="bg-muted/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-4 md:mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">{">"}</span>
          <span className="text-foreground">Carrito de la compra</span>
        </nav>

        {/* Título */}
        <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
          Tu carrito de la compra
        </h1>

        {/* Alertas de stock */}
        {validation && validation.hasIssues && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Problemas de disponibilidad</h3>
                <ul className="space-y-1 text-sm text-red-800">
                  {validation.items
                    .filter((item) => item.issue !== null)
                    .map((item) => {
                      const errorMsg = getItemErrorMessage(item.itemId)
                      const slug = items.find((i) => i.id === item.itemId)?.product?.slug
                      return errorMsg ? (
                        <li key={item.itemId} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          {slug ? (
                            <Link href={`/products/${slug}`} className="text-red-800 underline hover:text-red-900">
                              {errorMsg}
                            </Link>
                          ) : (
                            <span>{errorMsg}</span>
                          )}
                        </li>
                      ) : null
                    })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bloque de transporte */}
        <div className="bg-card rounded-xl p-4 mb-6 flex items-center gap-4 border-l-4 border-primary">
          <div className="flex-1">
            {transportEstimate?.appliedRule ? (
              <p className="text-sm md:text-base text-gray-700">
                <span className="text-emerald-600 font-medium">
                  Descuento en transporte aplicado
                  {transportEstimate.appliedRule.discountType === "percent"
                    ? ` (${transportEstimate.appliedRule.discountValue}%)`
                    : ` ($${Number(transportEstimate.appliedRule.discountValue).toFixed(2)})`}
                </span>
              </p>
            ) : (
              <p className="text-sm md:text-base text-gray-700">
                {transportEstimate?.positiveMessage || "Transporte calculado al costo justo"}
              </p>
            )}
          </div>
          <div className="shrink-0 text-sky-500">
            <Truck className="h-10 w-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = Number(item.productVariant?.priceUSD ?? item.product.priceUSD ?? 0)
              const option = item.productVariant?.name || "Producto"
              const imageSrc = item.product.images?.[0] || "/placeholder.svg"
              return (
              <div key={item.id} className="bg-white rounded-xl p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Imagen: SmartImage resuelve IDs de Media a /api/media/{id} */}
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden bg-muted relative">
                    <SmartImage
                      src={imageSrc}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      objectFit="cover"
                    />
                  </div>

                    {/* Info del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 truncate">{item.product.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">Opción: {option}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-primary">${price.toFixed(2)}</span>
                    </div>
                    
                    {/* Alerta de stock para este item */}
                    {hasItemIssue(item.id) && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {getItemErrorMessage(item.id)}
                        </p>
                        {(() => {
                          const availableStock = getItemAvailableStock(item.id)
                          return availableStock !== null && availableStock > 0 ? (
                            <p className="text-xs text-red-600 mt-1">
                              Stock disponible: {availableStock}
                            </p>
                          ) : null
                        })()}
                      </div>
                    )}
                    
                    {/* Indicador de stock disponible */}
                    {!hasItemIssue(item.id) && (() => {
                      const availableStock = getItemAvailableStock(item.id)
                      return availableStock !== null ? (
                        <p className="text-xs text-gray-500 mb-3">
                          {availableStock > 0 
                            ? `${availableStock} disponible${availableStock > 1 ? 's' : ''}`
                            : 'En stock'}
                        </p>
                      ) : null
                    })()}

                    {/* Acciones móvil y desktop */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <Link href={`/products/${item.product.slug}`} className="text-xs md:text-sm text-gray-500 hover:text-sky-600 underline">
                        Ver producto
                      </Link>

                      <div className="flex items-center gap-3">
                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        </button>

                        {/* Control de cantidad */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-input text-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Reducir cantidad"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-sky-600">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const availableStock = getItemAvailableStock(item.id)
                              const maxQuantity = availableStock !== null ? availableStock : item.quantity + 1
                              updateItemQuantity(item.id, Math.min(item.quantity + 1, maxQuantity))
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar cantidad"
                            disabled={(() => {
                              const availableStock = getItemAvailableStock(item.id)
                              return availableStock !== null && item.quantity >= availableStock
                            })()}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})}

            {/* Sección Mejora tu pedido */}
            {suggestedProducts.length > 0 && (
              <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  Mejora tu pedido
                </h3>
                {loadingSuggestions ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="shrink-0 w-32 md:w-40 animate-pulse">
                        <div className="aspect-square rounded-lg bg-gray-200 mb-2" />
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-8 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {suggestedProducts.map((product) => {
                      const price = Number(product.variants?.[0]?.priceUSD ?? product.priceUSD ?? 0)
                      const image = product.images?.[0] || "/placeholder.svg"
                      return (
                        <div key={product.id} className="shrink-0 w-32 md:w-40">
                          <Link href={`/products/${product.slug}`} className="block mb-2">
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                              <SmartImage
                                src={image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="160px"
                                objectFit="cover"
                              />
                            </div>
                          </Link>
                          <Link href={`/products/${product.slug}`}>
                            <h4 className="text-xs md:text-sm text-gray-700 mb-1 line-clamp-2 hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                          </Link>
                          <p className="text-sm font-bold text-foreground mb-2">
                            ${price.toFixed(2)}
                          </p>
                          <button
                            onClick={(e) => handleAddSuggestedProduct(product, e)}
                            aria-label={`Añadir ${product.name} al carrito`}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 px-3 rounded-full transition-colors"
                          >
                            Añadir al carrito
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-muted/80 rounded-xl p-4 md:p-6 sticky top-24 border border-border">
              <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Resumen</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                {(() => {
                  const th = transportEstimate?.config?.freeShippingThresholdUSD
                  if (th != null && shipping > 0 && subtotal < Number(th)) {
                    const add = (Number(th) - subtotal).toFixed(2)
                    return (
                      <p className="text-xs text-accent">
                        Añade ${add} más para envío gratis
                      </p>
                    )
                  }
                  return null
                })()}
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cupón de descuento */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="bg-accent/10 border border-accent rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{appliedCoupon.code}</span>
                      <span className="text-xs text-muted-foreground">-${appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      aria-label="Quitar cupón"
                      className="p-1 hover:bg-accent/20 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCoupon(!showCoupon)}
                      aria-label={showCoupon ? "Ocultar cupón" : "Mostrar cupón"}
                      className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 mb-2"
                    >
                      <Tag className="h-4 w-4" />
                      <span className="underline">Cupón de descuento</span>
                      {showCoupon ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {showCoupon && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); setCouponError("") }}
                          placeholder="Código"
                          className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          aria-label="Aplicar cupón"
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                        >
                          {validatingCoupon ? "..." : "Aplicar"}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                  </>
                )}
              </div>

              {/* Fecha estimada de entrega (2–3 días laborables) */}
              {(() => {
                const start = new Date()
                let days = 0
                for (let i = 1; days < 2; i++) {
                  start.setDate(start.getDate() + 1)
                  if (start.getDay() !== 0 && start.getDay() !== 6) days++
                  if (i > 10) break
                }
                const end = new Date(start)
                end.setDate(end.getDate() + 1)
                const fmt = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })
                return (
                  <div className="bg-accent/10 rounded-lg p-3 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha estimada de entrega:</p>
                      <p className="text-sm font-medium text-foreground">{fmt(start)} – {fmt(end)}</p>
                    </div>
                  </div>
                )
              })()}

              {/* Botón finalizar compra */}
              <Link
                href="/checkout"
                className={`w-full ${
                  validation && validation.hasIssues
                    ? 'bg-muted cursor-not-allowed pointer-events-none text-muted-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                } py-3 md:py-4 rounded-full font-medium transition-colors block text-center`}
              >
                {validation && validation.hasIssues
                  ? 'Resuelve los problemas de stock'
                  : 'Finalizar compra'}
              </Link>
              <Link href="/products" className="block text-center text-sm text-accent hover:underline mt-3">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>

        {/* Sección de beneficios */}
        <div className="bg-muted/50 rounded-xl mt-8 p-6 md:p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Devoluciones en 30 días sin coste
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Devolución del dinero garantizada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Pago seguro
                </li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Pago 100% seguro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
