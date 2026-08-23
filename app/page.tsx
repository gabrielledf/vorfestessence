import { Attractions } from '@/components/attractions'
import { Checkout } from '@/components/checkout'
import { EventPartners } from '@/components/event-partners'
import { Hero } from '@/components/hero'
import { InfoFaq } from '@/components/info-faq'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Attractions />
      <Checkout />
      <InfoFaq />
      <EventPartners />
      <SiteFooter />
    </main>
  )
}
