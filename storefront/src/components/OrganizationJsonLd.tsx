import { Helmet } from 'react-helmet-async'

/** Site geneli Organization + WebSite yapılandırılmış verisi (SEO). */
export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TeShop',
    description: 'Modern, minimal ve monokrom giyim mağazası.',
    // Yayında gerçek domain ile değiştir:
    url: 'https://example.com',
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}
