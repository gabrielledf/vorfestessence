import { ChevronDown, QrCode, ShieldCheck, Smartphone } from 'lucide-react'

const STEPS = [
  {
    icon: Smartphone,
    title: '1. Compre pelo site',
    description: 'Preencha seus dados e pague via PIX. Tudo em poucos segundos, sem filas.',
  },
  {
    icon: QrCode,
    title: '2. Receba o voucher',
    description: 'Assim que o pagamento for confirmado, seu voucher chega direto no WhatsApp.',
  },
  {
    icon: ShieldCheck,
    title: '3. Retire a pulseira',
    description: 'Apresente o voucher, antecipadamente no Essence Restaurante, de seg - sáb, das 9h-13h, ou na entrada do evento para trocar pela sua pulseira de acesso.',
  },
]

const FAQ = [
  {
    q: 'Como recebo meu ingresso?',
    a: 'Após a confirmação do pagamento via PIX, você recebe automaticamente o voucher no número de WhatsApp informado na compra.',
  },
  {
    q: 'Onde e quando retiro a pulseira?',
    a: 'A pulseira pode ser retirada antecipadamente no Essence Restaurante, de seg - sáb, das 9h-13h ou na entrada do evento, apresentando o voucher recebido no WhatsApp junto com um documento com foto.',
  },
   {
    q: 'Posso comprar mais de um ingresso?',
    a: 'Sim. Você pode adquirir de 1 a 10 ingressos por compra. Cada ingresso gera o direito a uma pulseira.',
  },
  {
    q: 'As vagas são realmente limitadas?',
    a: 'Sim. São apenas 200 ingressos disponíveis para garantir o conforto de todos no evento indoor. Quando esgotar, não haverá vendas na porta.',
  },
  {
    q: 'O que está incluso no ingresso?',
    a: 'O acesso ao evento com todas as atrações: bandas, DJ, decoração temática, copo para chopp/espumante e ambiente completo da Oktoberfest. Open bar incluso com espumante, chopp Hellen, água e refrigerante liberados. Open food de comidas típicas: cucas artesanais, linguiça e pretzels (self-service)',
  },
]

export function InfoFaq() {
  return (
    <>
      <section id="info" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
              Como funciona
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
              Da compra à retirada da pulseira
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-background p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Dúvidas frequentes
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-card px-5 py-4 [&_svg]:open:rotate-180"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {item.q}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-primary transition-transform"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
