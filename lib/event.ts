// Configurações centrais do evento Vorfest Essence.
// Ajuste a CHAVE PIX e os dados do recebedor antes de ir para produção.

export const EVENT = {
  name: 'Essence Vorfest',
  tagline: 'O Aquece da Oktoberfest',
  venue: 'Essence Restaurante e Eventos',
  date: 'Sábado, 26 de Setembro de 2026',
  time: 'A partir das 20h',
  location: 'Essence Restaurante e Eventos (indoor)',
  totalTickets: 200,
  ticketPrice: 1,
  maxPerOrder: 10,
} as const

// Dados do recebedor PIX (chave estática).
// Substitua pela chave PIX real do restaurante Essence.
export const PIX_RECEIVER = {
  key: '45129900000171', // Ex.: CNPJ do restaurante
  name: 'Essence Restaurante',
  city: 'Santa Cruz do Sul',
} as const

// Número que receberá os comprovantes. Configure NEXT_PUBLIC_ESSENCE_WHATSAPP
// com DDI + DDD + número, apenas dígitos. Ex.: 5551999999999.
export const ESSENCE_WHATSAPP = process.env.NEXT_PUBLIC_ESSENCE_WHATSAPP ?? ''
