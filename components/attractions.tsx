import { Beer, Music, UtensilsCrossed, Wine, Sparkles, Shirt } from 'lucide-react'

const ATTRACTIONS = [
  {
    icon: UtensilsCrossed,
    title: 'Gastronomia Típica',
    description: 'Open food com diversos sabores de cucas; linguiça em fatias e o melhor da culinária alemã servidos no capricho.',
    image: '/cuca-linguica.png',
    imageAlt: 'Cuca com linguiça em fatias sobre tábua rústica',
  },
  {
    icon: Wine,
    title: 'Espumante',
    description: 'Open bar de espumantes. Brinde à noite toda com espumante liberada.',
    image: '/espumante.png',
    imageAlt: '',
  },
  {
    icon: Beer,
    title: 'Chopp Hellen Gelado',
    description: 'Open bar com chopp Hellen na temperatura perfeita, com colarinho cremoso a noite toda.',
    image: '/chopp-hellen.png',
    imageAlt: 'Caneca de chopp gelado com espuma',
  },
  {
    icon: Music,
    title: 'Músicas Típicas',
    description: 'Bandas alemãs ao vivo com o repertório clássico da Oktoberfest.',
    image: '/banda-tipica.png',
    imageAlt: 'Banda típica alemã tocando ao vivo',
  },
  {
    icon: Sparkles,
    title: 'Decoração Temática',
    description: 'Decoração temática alemã para suas fotos ficarem no clima da festa',
    image: '/decoracao.png',
    imageAlt: 'Decoração temática alemã',
  },
  {
    icon: Shirt,
    title: 'Concurso Trajes Típicos',
    description: 'Venha vestido a caráter e concorra a prêmios especiais.',
    image: '/traje.png',
    imageAlt: 'Concurso Trajes Típicos',
  },
]

export function Attractions() {
  return (
    <section id="atracoes" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
          As atrações
        </p>
        <h2 className="mt-3 text-balance font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
          Tudo que faz a Oktoberfest inesquecível
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ATTRACTIONS.map((item) => (
          <article
            key={item.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
          >
            {item.image ? (
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image || '/placeholder.svg'}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center bg-accent/30">
                <item.icon className="h-14 w-14 text-primary" aria-hidden="true" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
