/**
 * Canais de venda simulados. Para adicionar um canal, basta incluir um item aqui.
 * extraTax: comissão do canal (%)   |   cardTax: taxa de cartão/pagamento (%)
 */
export const CHANNELS = [
  { id: 'balcao', name: 'Balcão / Loja física', extraTax: 0, cardTax: 2.5 },
  { id: 'ecommerce', name: 'E-commerce próprio', extraTax: 3.5, cardTax: 2.9 },
  { id: 'mercadolivre', name: 'Mercado Livre', extraTax: 16.5, cardTax: 0 },
  { id: 'shopee', name: 'Shopee', extraTax: 14.0, cardTax: 0 },
  { id: 'ifood', name: 'iFood / Delivery', extraTax: 23.0, cardTax: 0 },
]
