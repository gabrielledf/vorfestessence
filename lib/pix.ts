// Gerador de payload PIX "Copia e Cola" (BR Code / padrão EMV do Banco Central).
// 100% gratuito e offline — não depende de gateway. Usa uma chave PIX estática.

export interface PixParams {
  /** Chave PIX do recebedor (CPF/CNPJ, e-mail, telefone ou aleatória) */
  pixKey: string
  /** Nome do recebedor (máx. 25 caracteres) */
  merchantName: string
  /** Cidade do recebedor (máx. 15 caracteres) */
  merchantCity: string
  /** Valor da transação. Ex.: 170.0 */
  amount: number
  /** Identificador da transação (txid). Máx. 25 caracteres, sem espaços */
  txid?: string
}

/** Remove acentos e caracteres fora do padrão aceito pelo BR Code */
function sanitize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
}

/** Monta um campo EMV no formato ID + tamanho(2) + valor */
function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

/** CRC16/CCITT-FALSE — polinômio 0x1021, valor inicial 0xFFFF */
function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Gera o payload PIX "Copia e Cola".
 * Retorna a string EMV completa já com o CRC16 calculado.
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid = '***',
}: PixParams): string {
  const gui = field('00', 'br.gov.bcb.pix')
  const key = field('01', pixKey)
  const merchantAccountInfo = field('26', `${gui}${key}`)

  const cleanTxid = sanitize(txid).replace(/ /g, '').slice(0, 25) || '***'
  const additionalData = field('62', field('05', cleanTxid))

  let payload =
    field('00', '01') + // Payload Format Indicator
    merchantAccountInfo + // Merchant Account Information
    field('52', '0000') + // Merchant Category Code
    field('53', '986') + // Moeda: BRL
    field('54', amount.toFixed(2)) + // Valor
    field('58', 'BR') + // País
    field('59', sanitize(merchantName).slice(0, 25)) + // Nome do recebedor
    field('60', sanitize(merchantCity).slice(0, 15)) + // Cidade
    additionalData +
    '6304' // Placeholder do CRC (id 63 + len 04)

  const crc = crc16(payload)
  return payload + crc
}
