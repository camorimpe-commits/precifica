
import { useMemo, useState } from 'react'

const EMPTY_INGREDIENT = {
  name: '',
  purchaseQty: '',
  unit: 'g',
  purchasePrice: '',
  usedQty: '',
}

export default function CostCompositionTab() {
  const [productName, setProductName] = useState('')
  const [yieldQty, setYieldQty] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [ingredient, setIngredient] = useState(EMPTY_INGREDIENT)

  const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const addIngredient = () => {
    const name = ingredient.name.trim()
    const purchaseQty = Number(ingredient.purchaseQty)
    const purchasePrice = Number(ingredient.purchasePrice)
    const usedQty = Number(ingredient.usedQty)

    if (!name) return
    if (purchaseQty <= 0) return
    if (purchasePrice <= 0) return
    if (usedQty <= 0) return

    const unitCost = purchasePrice / purchaseQty
    const usedCost = unitCost * usedQty

    const newIngredient = {
      id: Date.now(),
      name,
      purchaseQty,
      unit: ingredient.unit,
      purchasePrice,
      usedQty,
      unitCost,
      usedCost,
    }

    setIngredients((list) => [...list, newIngredient])
    setIngredient({ ...EMPTY_INGREDIENT })
  }

  const removeIngredient = (id) => {
    setIngredients((list) =>
      list.filter((item) => item.id !== id)
    )
  }

  const totalCost = useMemo(() => {
    return ingredients.reduce(
      (total, item) => total + item.usedCost,
      0
    )
  }, [ingredients])

  const costPerUnit = useMemo(() => {
    const quantity = Number(yieldQty)

    if (quantity <= 0) return 0

    return totalCost / quantity
  }, [totalCost, yieldQty])

  return (
    <div className="space-y-4">

      {/* CABEÇALHO DA RECEITA */}
      <section className="rounded-2xl bg-slate-800 p-4">

        <h2 className="mb-1 text-lg font-bold text-white">
          Custos e insumos
        </h2>

        <p className="mb-4 text-sm text-slate-400">
          Monte a composição do produto para descobrir o custo real.
        </p>

        <div className="space-y-3">

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Produto
            </label>

            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex.: Brigadeiro"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Rendimento da receita
            </label>

            <input
              type="number"
              min="1"
              value={yieldQty}
              onChange={(e) => setYieldQty(e.target.value)}
              placeholder="Ex.: 30"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
            />

            <p className="mt-1 text-xs text-slate-500">
              Quantas unidades essa receita produz?
            </p>
          </div>

        </div>
      </section>

      {/* NOVO INSUMO */}
      <section className="rounded-2xl bg-slate-800 p-4">

        <h2 className="mb-3 text-lg font-bold text-white">
          Adicionar insumo
        </h2>

        <div className="space-y-3">

          {/* NOME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Nome do insumo
            </label>

            <input
              value={ingredient.name}
              onChange={(e) =>
                setIngredient({
                  ...ingredient,
                  name: e.target.value,
                })
              }
              placeholder="Ex.: Leite condensado"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
            />
          </div>

          {/* QUANTIDADE COMPRADA + UNIDADE */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Quantidade comprada
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={ingredient.purchaseQty}
                onChange={(e) =>
                  setIngredient({
                    ...ingredient,
                    purchaseQty: e.target.value,
                  })
                }
                placeholder="395"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Unidade
              </label>

              <select
                value={ingredient.unit}
                onChange={(e) =>
                  setIngredient({
                    ...ingredient,
                    unit: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
              >
                <option value="g">gramas (g)</option>
                <option value="kg">quilogramas (kg)</option>
                <option value="ml">mililitros (ml)</option>
                <option value="l">litros (L)</option>
                <option value="un">unidade</option>
              </select>
            </div>

          </div>

          {/* PREÇO + UTILIZAÇÃO */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Preço pago
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={ingredient.purchasePrice}
                onChange={(e) =>
                  setIngredient({
                    ...ingredient,
                    purchasePrice: e.target.value,
                  })
                }
                placeholder="6.50"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Quantidade utilizada
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={ingredient.usedQty}
                onChange={(e) =>
                  setIngredient({
                    ...ingredient,
                    usedQty: e.target.value,
                  })
                }
                placeholder="395"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-profit"
              />
            </div>

          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="w-full rounded-xl bg-profit px-4 py-3 font-bold text-ink transition-opacity hover:opacity-90"
          >
            + Adicionar insumo
          </button>

        </div>
      </section>

      {/* INSUMOS ADICIONADOS */}
      {ingredients.length > 0 && (
        <section className="rounded-2xl bg-slate-800 p-4">

          <h2 className="mb-3 text-lg font-bold text-white">
            Insumos da receita
          </h2>

          <div className="space-y-3">

            {ingredients.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-3"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="font-bold text-white">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Compra: {item.purchaseQty} {item.unit} por{' '}
                      {money(item.purchasePrice)}
                    </p>

                    <p className="text-xs text-slate-400">
                      Utilizado: {item.usedQty} {item.unit}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(item.id)}
                    className="shrink-0 text-xs font-semibold text-red-400"
                  >
                    Excluir
                  </button>

                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3">

                  <span className="text-sm text-slate-400">
                    Custo utilizado
                  </span>

                  <strong className="text-profit">
                    {money(item.usedCost)}
                  </strong>

                </div>

              </div>
            ))}

          </div>

        </section>
      )}

      {/* RESULTADO */}
      <section className="rounded-2xl bg-profit p-5 text-ink">

        <p className="text-sm font-semibold opacity-80">
          {productName || 'Produto'}
        </p>

        <p className="mt-1 text-3xl font-extrabold">
          {money(totalCost)}
        </p>

        <p className="text-sm font-medium opacity-80">
          Custo total dos insumos
        </p>

        {Number(yieldQty) > 0 && (
          <div className="mt-4 border-t border-ink/20 pt-4">

            <p className="text-sm font-medium opacity-80">
              Custo por unidade
            </p>

            <p className="text-2xl font-extrabold">
              {money(costPerUnit)}
            </p>

            <p className="mt-1 text-xs opacity-70">
              Rendimento: {yieldQty} unidades
            </p>

          </div>
        )}

      </section>

    </div>
  )
}
```
