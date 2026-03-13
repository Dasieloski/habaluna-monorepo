"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth-store"
import { useCartStore } from "@/lib/store/cart-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { api } from "@/lib/api"
import { SearchAutocomplete } from "@/components/product/search-autocomplete"
import {
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
  TruckIcon,
  ReturnIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons/streamline-icons"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const searchParams = useSearchParams()
  const { user, logout } = useAuthStore()
  const authed = useAuthStore((s) => s.user !== null && !!s.accessToken)
  const cartCount = useCartStore((s) => s.getItemCount())
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [isHidden, setIsHidden] = useState(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)
  const [cartBounce, setCartBounce] = useState(false)

  const [ui, setUi] = useState<{
    announcement: string
    announcementVariant?: "default" | "promo"
    highlights: [string, string, string, string]
  }>({
    announcement: "Envíos a toda la Habana - Entrega rápida",
    highlights: ["Envío gratis +$50", "30 días devolución", "Pago seguro", "4.8/5 valoración"],
  })

  const [navItems, setNavItems] = useState<Array<{ name: string; href: string }>>([])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push("/")
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    // Sincronizar carrito server cuando hay sesión
    if (authed) {
      fetchCart()
      fetchWishlist()
    }
  }, [authed, fetchCart, fetchWishlist])

  useEffect(() => {
    // Evitar hydration mismatch (persist rehidrata antes del primer paint)
    setMounted(true)
  }, [])

  useEffect(() => {
    const h = () => { setCartBounce(true); setTimeout(() => setCartBounce(false), 600) }
    window.addEventListener('contextual-toast-cart-bounce', h)
    return () => window.removeEventListener('contextual-toast-cart-bounce', h)
  }, [])

  useEffect(() => {
    // Cargar textos configurables (público) + categorías del menú
    let cancelled = false
    ;(async () => {
      try {
        const [res, cats, reviewStats] = await Promise.all([
          api.getUiSettings?.().catch(() => null),
          api.getCategories?.(),
          api.getReviewsGlobalStats?.().catch(() => null),
        ])
        if (cancelled) return

        const highlights = Array.isArray((res as any)?.headerHighlights) ? (res as any).headerHighlights : []
        let h3 = String(highlights[3] || ui.highlights[3])
        if (reviewStats && reviewStats.totalReviews > 0) {
          h3 = `${Number(reviewStats.averageRating).toFixed(1)}/5 (${reviewStats.totalReviews})`
        }
        setUi({
          announcement: (res as any)?.headerAnnouncement || ui.announcement,
          announcementVariant: (res as any)?.headerAnnouncementVariant === "promo" ? "promo" : "default",
          highlights: [
            String(highlights[0] || ui.highlights[0]),
            String(highlights[1] || ui.highlights[1]),
            String(highlights[2] || ui.highlights[2]),
            h3,
          ],
        })

        const categories = Array.isArray(cats) ? cats : []
        const byId = new Map<string, any>(categories.map((c: any) => [String(c.id), c]))
        const configured = Array.isArray((res as any)?.headerNavCategories) ? (res as any).headerNavCategories : []
        const ids: string[] =
          configured.length > 0
            ? configured.map((x: any) => String(x)).filter((x: string) => !!x)
            : categories.slice(0, 6).map((c: any) => String(c.id))

        const items = ids
          .filter((id) => byId.has(id))
          .slice(0, 6)
          .map((id) => ({
            name: String(byId.get(id)?.name || "Categoría"),
            href: `/products?categoryId=${encodeURIComponent(id)}`,
          }))

        setNavItems(items)
      } catch {
        // Fallback suave: no bloquear el header
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Ocultar al bajar, mostrar al subir (animado)
    lastYRef.current = window.scrollY || 0
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const delta = y - lastYRef.current

        // Si menú móvil abierto o dropdown de usuario abierto, mantener visible
        if (mobileMenuOpen || userMenuOpen) {
          setIsHidden(false)
          lastYRef.current = y
          tickingRef.current = false
          return
        }

        // Ignorar micro-movimientos
        if (Math.abs(delta) > 12) {
          if (y > 120 && delta > 0) setIsHidden(true)
          if (delta < 0) setIsHidden(false)
        }
        lastYRef.current = y
        tickingRef.current = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [mobileMenuOpen, userMenuOpen])

  // Función para manejar la búsqueda del navbar (se ejecuta al seleccionar sugerencia)
  const handleNavbarSearch = (searchValue: string) => {
    const value = searchValue.trim()
    if (!value) return
    setMobileMenuOpen(false)
    router.push(`/products?search=${encodeURIComponent(value)}`)
  }

  // Sincronizar searchQuery con la URL solo cuando estamos en /products y la URL cambia externamente
  // PERO solo si NO viene del navbar (para evitar conflictos)
  useEffect(() => {
    // Solo sincronizar si estamos en /products y el cambio viene de fuera (no de nuestro propio input)
    if (pathname === "/products") {
      const urlSearch = searchParams?.get("search") || ""
      // Solo actualizar si es diferente y no estamos escribiendo activamente en el navbar
      const isNavbarInputFocused = document.activeElement?.closest('[data-navbar-search]')
      if (urlSearch !== searchQuery && !isNavbarInputFocused) {
        setSearchQuery(urlSearch)
      }
    } else {
      // Si no estamos en /products, mantener el searchQuery para uso futuro
      // No limpiar para mantener el valor mientras navegas
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.get("search")])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
        style={{
          background: isHome
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: isHome
            ? '0 0 1px rgba(59, 130, 246, 0.1)'
            : '0 8px 32px rgba(59, 130, 246, 0.08)',
        }}
      >
        {/* Dark mode styles */}
        <div className="dark:absolute dark:inset-0 dark:bg-slate-900/50 dark:backdrop-blur-3xl dark:border-b dark:border-white/10" />

        <div
          className={`text-foreground text-xs md:text-sm py-3 text-center relative z-10 transition-all duration-300 ${isHome ? "bg-gradient-to-r from-slate-950 via-blue-950 to-violet-950 text-slate-100 border-b border-slate-800/80" : "bg-background/40 dark:bg-slate-900/30 border-b " + (ui.announcementVariant === "promo" ? "border-accent/30" : "border-border/20")}`}
        >
          <p className="font-medium">{ui.announcement}</p>
        </div>

        <div className={`relative z-20 ${isHome ? "" : "border-b border-white/10 dark:border-white/5"}`}>
        <div className={`container mx-auto px-4 md:px-6 ${isHome ? "max-w-6xl" : ""}`}>
          <div className={`flex items-center justify-between ${isHome ? "h-[84px]" : "h-16 md:h-18"}`}>
            <button
              className="md:hidden p-2.5 -ml-2 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 active:scale-95"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center shrink-0 group">
              <span className={`font-logo ${isHome ? "text-3xl md:text-4xl tracking-tight" : "text-2xl md:text-4xl"} text-foreground transition-all duration-300 group-hover:text-primary drop-shadow-[0_2px_10px_rgba(59,130,246,0.18)]`}>
                Habaluna
              </span>
            </Link>

            {/* Búsqueda desktop: centrada en la fila principal */}
            <div className="hidden md:flex flex-1 min-w-0 mx-4 md:mx-10 md:max-w-xl">
              <div className="w-full rounded-2xl bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/10 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/15 focus-within:bg-white/70 dark:focus-within:bg-white/20 focus-within:border-white/50 dark:focus-within:border-white/20" style={{ backdropFilter: 'blur(16px)' }}>
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={handleNavbarSearch}
                  placeholder="¿Qué estás buscando?"
                  className="w-full"
                  animatedPlaceholder
                />
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
              <ThemeToggle className="shrink-0" />
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2.5 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 active:scale-95 hover:shadow-lg"
                >
                  <UserIcon className="w-5 h-5 transition-transform duration-300" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/30 dark:border-white/10 overflow-hidden z-50 animate-fade-in shadow-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="dark:absolute dark:inset-0 dark:bg-slate-900/50 dark:backdrop-blur-3xl dark:border dark:border-white/10" />
                    <div className="relative z-10">
                      {authed && user ? (
                        <>
                          <div className="p-4 border-b border-white/10 dark:border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/10">
                            <p className="text-sm font-semibold text-foreground">
                              {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                          </div>
                          <div className="p-2 space-y-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:text-primary"
                              onClick={() => setUserMenuOpen(false)}
                            >
                            <svg
                              className="w-5 h-5 text-accent"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                              />
                            </svg>
                              Mi perfil
                            </Link>
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:text-primary"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg
                                className="w-5 h-5 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                                />
                              </svg>
                              Mis pedidos
                            </Link>
                            {user.role === 'ADMIN' && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:text-primary"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <svg
                                  className="w-5 h-5 text-accent"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                                  />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Panel Admin
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-destructive/10 hover:text-destructive w-full text-left text-destructive"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                  />
                                </svg>
                                Cerrar sesión
                              </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/10">
                            <p className="text-sm font-semibold text-foreground">Mi cuenta</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Accede o crea tu cuenta</p>
                          </div>
                          <div className="p-2 space-y-1">
                            <Link
                              href="/auth/login"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:text-primary"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg
                                className="w-5 h-5 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                                />
                              </svg>
                              Iniciar sesión
                            </Link>
                            <Link
                              href="/auth/register"
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:text-primary"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg
                                className="w-5 h-5 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                                />
                              </svg>
                              Crear una cuenta
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/wishlist"
                className="heart-btn hidden md:flex p-2.5 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 active:scale-95 hover:shadow-lg group"
              >
                <HeartIcon className="w-5 h-5 transition-all duration-300 group-hover:text-red-500" />
              </Link>
              <Link
                href="/cart"
                className="cart-btn relative flex p-2.5 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 active:scale-95 hover:shadow-lg group"
              >
                <CartIcon 
                  className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
                    cartBounce ? "animate-cart-bounce" : "scale-100"
                  }`}
                />
                {cartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg ${
                    cartBounce ? "animate-cart-bounce" : "animate-pulse"
                  }`}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="md:hidden pt-3 pb-4 border-t border-border/30">
            <SearchAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleNavbarSearch}
              placeholder="¿Qué estás buscando?"
              className="w-full"
              animatedPlaceholder
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={`hidden md:block ${isHome ? "" : "border-t border-white/10"}`}>
          <div className="container mx-auto px-4 md:px-6">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item) => {
                const itemCategoryId = (item.href.match(/categoryId=([^&]+)/) || [])[1]
                const currentCategoryId = searchParams?.get("categoryId") ?? null
                const isActive = pathname === "/products" && currentCategoryId != null && itemCategoryId === currentCategoryId
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-5 py-3.5 text-sm font-semibold rounded-full transition-all duration-300 group relative ${
                        isActive
                          ? "text-primary bg-white/20 dark:bg-white/10 shadow-md"
                          : "text-foreground hover:text-primary hover:bg-white/15 dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </div>

      <div className={`relative z-10 py-4 md:py-4 border-t border-white/10 transition-all duration-300`} style={{ background: isHome ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="dark:absolute dark:inset-0 dark:bg-slate-900/30 dark:backdrop-blur-2xl dark:border-t dark:border-white/5" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex items-center justify-center gap-6 md:gap-12 text-xs md:text-sm overflow-x-auto scrollbar-hide text-muted-foreground">
            <div className="flex items-center gap-3 whitespace-nowrap shrink-0 group transition-all duration-300 hover:text-foreground">
              <TruckIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span>{ui.highlights[0]}</span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap shrink-0 group transition-all duration-300 hover:text-foreground">
              <ReturnIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span>{ui.highlights[1]}</span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap shrink-0 group transition-all duration-300 hover:text-foreground">
              <ShieldIcon className="w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span>{ui.highlights[2]}</span>
            </div>
            <div className="hidden lg:flex items-center gap-3 whitespace-nowrap shrink-0 group transition-all duration-300 hover:text-foreground">
              <StarIcon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span>{ui.highlights[3]}</span>
            </div>
          </div>
        </div>
      </div>

    </header>

    {/* Mobile menu (fuera del header para evitar bugs de `fixed` dentro de elementos con `transform`) */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-40 animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="h-[220px]" />
        <nav className="container mx-auto px-4 pb-8">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={item.name} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up">
                <Link
                  href={item.href}
                  className="flex items-center px-5 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:bg-white/15 hover:text-primary active:scale-95"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    )}
    </>
  )
}
