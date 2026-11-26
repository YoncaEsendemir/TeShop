import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title: string
  description?: string
  /** Yapılandırılmış veri (JSON-LD) — ürün detayda Product/Offer */
  jsonLd?: Record<string, unknown>
}

const SITE = 'TeShop'

export default function Seo({ title, description, jsonLd }: SeoProps) {
  const fullTitle = title === SITE ? title : `${title} · ${SITE}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
