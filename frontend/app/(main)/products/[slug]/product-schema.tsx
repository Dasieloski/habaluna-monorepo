
export function ProductSchema({ product }: { product: any }) {
    if (!product) return null

    // Construir URL absoluta de la imagen
    const imageUrl = product.images?.[0]
        ? (product.images[0].startsWith('http')
            ? product.images[0]
            : `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`)
        : undefined

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || product.shortDescription,
        "image": imageUrl,
        "brand": {
            "@type": "Brand",
            "name": "Habaluna"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://www.habaluna.com/products/${product.slug}`,
            "priceCurrency": "USD",
            "price": product.priceUSD,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        // Si hay reseñas, agregarlas
        ...(product.rating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviewCount || 1,
                "bestRating": "5",
                "worstRating": "1"
            }
        }),
        ...(product.reviews?.length > 0 && {
            "review": product.reviews.map((r: any) => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": r.userName || "Cliente Verificado"
                },
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": r.rating,
                    "bestRating": "5"
                },
                "reviewBody": r.comment,
                "datePublished": r.createdAt
            }))
        })
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
