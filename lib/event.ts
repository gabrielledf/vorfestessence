// Configurações centrais do evento Vorfest Essence.
// Ajuste a CHAVE PIX e os dados do recebedor antes de ir para produção.

export const EVENT = {
  name: 'Essence Vorfest',
  tagline: 'O Aquece Oficial da Oktoberfest',
  venue: 'Restaurante Essence',
  date: 'Sábado, 26 de Setembro de 2026',
  time: 'A partir das 20h',
  location: 'Restaurante Essence — Evento Indoor',
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
