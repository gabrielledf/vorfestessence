// Configurações centrais do evento Vorfest Essence.
// Ajuste a CHAVE PIX e os dados do recebedor antes de ir para produção.

export const EVENT = {
  name: 'Vorfest Essence',
  tagline: 'O Aquece Oficial da Oktoberfest',
  venue: 'Restaurante Essence',
  date: 'Sábado, 27 de Setembro de 2026',
  time: 'A partir das 19h',
  location: 'Restaurante Essence — Evento Indoor',
  totalTickets: 200,
  ticketPrice: 170,
  maxPerOrder: 10,
} as const

// Dados do recebedor PIX (chave estática).
// Substitua pela chave PIX real do restaurante Essence.
export const PIX_RECEIVER = {
  key: '12345678000199', // Ex.: CNPJ do restaurante
  name: 'Restaurante Essence',
  city: 'CURITIBA',
} as const
