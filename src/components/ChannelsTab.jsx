import Card from './Card'
import Notice from './Notice'
import { CHANNELS } from '../constants/channels'
import { calcPrice } from '../utils/pricing'
import { formatBRL, formatPct } from '../utils/format'

export default function ChannelsTab({ params, result }) {
  if (!result.isCalculable) {
    return <Notice>Ajuste as porcentagens na aba Calcular (a soma deve ser menor que 100%) para simular os canais.</Notice>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Preço necessário em cada canal para manter o mesmo lucro de {formatPct(params.desiredProfitPct)} sobre o preço,
        já descontadas as taxas.
      </p>

      <ul className="space-y-3">
        {CHANNELS.map((ch) => {
          const fee = ch.extraTax + ch.cardTax
          const r = calcPrice(params, fee)
          const diff = r.sellingPrice - result.sellingPrice

          return (
            <li key={ch.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{ch.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {fee > 0 ? `Taxas do canal: ${formatPct(fee)}` : 'Sem taxas do canal'}
                    </p>
                  </div>
                  {r.isCalculable ? (
                    <div className="text-right">
                      <p className="text-2xl font-extrabold tabular-nums text-white">{formatBRL(r.sellingPrice)}</p>
                      <p className={`text-xs font-semibold ${diff > 0.005 ? 'text-amber-400' : 'text-profit'}`}>
                        {diff > 0.005 ? `+${formatBRL(diff)} vs. preço base` : 'Igual ao preço base'}
                      </p>
                    </div>
                  ) : (
                    <p className="max-w-[9rem] text-right text-sm font-semibold text-amber-400">
                      Inviável: as taxas somam 100% ou mais
                    </p>
                  )}
                </div>
                {r.isCalculable && (
                  <p className="mt-3 border-t border-line pt-2 text-sm text-slate-300">
                    Taxa do canal: <strong>{formatBRL(r.values.extra)}</strong> · Lucro:{' '}
                    <strong className="text-profit">{formatBRL(r.values.profit)}</strong>
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
