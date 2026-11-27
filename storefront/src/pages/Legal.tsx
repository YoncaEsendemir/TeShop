import { legalDocs } from '../data/legal'
import Seo from '../components/Seo'
import NotFound from './NotFound'

export default function Legal({ slug }: { slug: string }) {
  const doc = legalDocs[slug]

  if (!doc) return <NotFound />

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Seo title={doc.title} description={doc.description} />

      <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">{doc.title}</h1>
      <p className="mt-2 text-sm text-text-subtle">Son güncelleme: {doc.updated}</p>

      <div className="mt-8 space-y-8">
        {doc.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="mb-3 font-display text-xl font-semibold text-text">
                {section.heading}
              </h2>
            )}
            <div className="space-y-3">
              {section.body.map((p, j) => (
                <p key={j} className="leading-relaxed text-text-muted">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
