import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'cost_composition_recipe'

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
  const [margin, setMargin] = useState('40')
  const [ingredients, setIngredients] = useState([])
  const [ingredient, setIngredient] = useState(EMPTY_INGREDIENT)
  const [saved, setSaved] = useState(false)

  // ============================================================
  // CARREGAR DADOS SALVOS
  // ============================================================

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)

      if (!savedData) return

      const data = JSON.parse(savedData)

      setProductName(data.productName || '')
      setYieldQty(data.yieldQty || '')
      setMargin(data.margin || '40')
      setIngredients(data.ingredients || [])
    } catch (error) {
      console.error('Erro ao carregar composição:', error)
    }
  }, [])

  // ============================================================
  // SALVAR AUTOMATICAMENTE
  // ============================================================

  useEffect(() => {
    const data = {
      productName,
      yieldQty,
      margin,
      ingredients,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    setSaved(true)

    const timer = setTimeout(() => {
      setSaved(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [productName, yieldQty, margin, ingredients])

  // ============================================================
  // FORMATAÇÃO DE DINHEIRO
  // ============================================================

  const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  // ============================================================
  // ADICIONAR INSUMO
  // ============================================================

  const addIngredient = () => {
    const name = ingredient.name.trim()
    const purchaseQty = Number(ingredient.purchaseQty)
    const purchasePrice = Number(ingredient.purchasePrice)
    const usedQty = Number(ingredient.usedQty)

    if (!name) {
      alert('Informe o nome do insumo.')
      return
    }

    if (purchaseQty <= 0) {
      alert('Informe uma quantidade comprada válida.')
      return
    }

    if (purchasePrice <= 0) {
      alert('Informe um preço de compra válido.')
      return
    }

    if (usedQty <= 0) {
      alert('Informe a quantidade utilizada.')
      return
    }

    if (usedQty > purchaseQty) {
      alert(
        'A quantidade utilizada não pode ser maior que a quantidade comprada.'
      )
      return
    }

    const unitCost = purchasePrice / purchaseQty
    const usedCost = unitCost * usedQty

    const newIngredient = {
      id: `${Date.now()}-${Math.random()}`,
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

  // ============================================================
  // EXCLUIR INSUMO
  // ============================================================

  const removeIngredient = (id) => {
    setIngredients((list) =>
      list.filter((item) => item.id !== id)
    )
  }

  // ============================================================
  // CUSTO TOTAL
  // ============================================================

  const totalCost = useMemo(() => {
    return ingredients.reduce(
      (total, item) => total + Number(item.usedCost || 0),
      0
    )
  }, [ingredients])

  // ============================================================
  // CUSTO POR UNIDADE
  // ============================================================

  const costPerUnit = useMemo(() => {
    const quantity = Number(yieldQty)

    if (quantity <= 0) return 0

    return totalCost / quantity
  }, [totalCost, yieldQty])

  // ============================================================
  // PREÇO DE VENDA
  //
  // Fórmula:
  //
  // Preço = Custo / (1 - Margem)
  //
  // Exemplo:
  // Custo = R$ 2,00
  // Margem = 40%
  //
  // 2 / (1 - 0,40)
  // = R$ 3,33
  // ============================================================

  const salePrice = useMemo(() => {
    const marginValue = Number(margin) / 100

    if (costPerUnit <= 0) return 0

    if (marginValue >= 1) return 0

    return costPerUnit / (1 - marginValue)
  }, [costPerUnit, margin])

  // ============================================================
  // LUCRO POR UNIDADE
  // ============================================================

  const profitPerUnit = useMemo(() => {
    if (salePrice <= 0 || costPerUnit <= 0) return 0

    return salePrice - costPerUnit
  }, [salePrice, costPerUnit])

  // ============================================================
  // LUCRO TOTAL DA RECEITA
  // ============================================================

  const totalProfit = useMemo(() => {
    const quantity = Number(yieldQty)

    if (quantity <= 0 || salePrice <= 0) return 0

    return profitPerUnit * quantity
  }, [profitPerUnit, salePrice, yieldQty])

  // ============================================================
  // RECEITA BRUTA DA PRODUÇÃO
  // ============================================================

  const totalRevenue = useMemo(() => {
    const quantity = Number(yieldQty)

    if (quantity <= 0 || salePrice <= 0) return 0

    return salePrice * quantity
  }, [salePrice, yieldQty])

  return (
    <div className="space-y-4">

      {/* ======================================================
          CABEÇALHO DA RECEITA
      ====================================================== */}

      <section className="rounded-2xl bg-slate-800 p-4">

        <div className="flex items-start justify-between gap-3">

          <div>
            <h2 className="mb-1 text-lg font-bold text-white">
              Custos e insumos
            </h2>

            <p className="text-sm text-slate-400">
              Monte a composição do produto e descubra o custo e
              preço de venda.
            </p>
          </div>

          {saved && (
            <span className="shrink-0 rounded-full bg-profit/20 px-3 py-1 text-xs font-semibold text-profit">
              ✓ Salvo
            </span>
          )}

        </div>

        <div className="mt-4 space-y-3">

          {/* PRODUTO */}

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

          {/* RENDIMENTO */}

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

          {/* MARGEM */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Margem de lucro desejada
            </label>

            <div className="relative">

              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="40"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 pr-10 text-white outline-none focus:border-profit"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                %
              </span>

            </div>

            <p className="mt-1 text-xs text-slate-500">
              Percentual de lucro considerado na formação do preço.
            </p>
          </div>

        </div>

      </section>

      {/* ======================================================
          NOVO INSUMO
      ====================================================== */}

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

          {/* QUANTIDADE + UNIDADE */}

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

      {/* ======================================================
          INSUMOS ADICIONADOS
      ====================================================== */}

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

      {/* ======================================================
          RESUMO DE CUSTOS
      ====================================================== */}

      <section className="rounded-2xl bg-slate-800 p-5">

        <h2 className="mb-4 text-lg font-bold text-white">
          Resumo de custos
        </h2>

        <div className="space-y-3">

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Custo total da receita
            </span>

            <strong className="text-white">
              {money(totalCost)}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Rendimento
            </span>

            <strong className="text-white">
              {Number(yieldQty) > 0 ? `${yieldQty} unidades` : '—'}
            </strong>
          </div>

          <div className="flex items-center justify-between border-t border-slate-700 pt-3">

            <span className="font-semibold text-slate-300">
              Custo por unidade
            </span>

            <strong className="text-xl text-profit">
              {money(costPerUnit)}
            </strong>

          </div>

        </div>

      </section>

      {/* ======================================================
          PREÇO DE VENDA
      ====================================================== */}

      <section className="rounded-2xl bg-profit p-5 text-ink">

        <p className="text-sm font-semibold opacity-80">
          PREÇO DE VENDA SUGERIDO
        </p>

        <p className="mt-1 text-4xl font-extrabold">
          {money(salePrice)}
        </p>

        <p className="mt-1 text-sm font-medium opacity-80">
          por unidade
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/20 pt-4">

          <div>

            <p className="text-xs font-medium opacity-70">
              Custo unitário
            </p>

            <p className="text-lg font-bold">
              {money(costPerUnit)}
            </p>

          </div>

          <div>

            <p className="text-xs font-medium opacity-70">
              Margem
            </p>

            <p className="text-lg font-bold">
              {Number(margin || 0).toFixed(0)}%
            </p>

          </div>

          <div>

            <p className="text-xs font-medium opacity-70">
              Lucro por unidade
            </p>

            <p className="text-lg font-bold">
              {money(profitPerUnit)}
            </p>

          </div>

          <div>

            <p className="text-xs font-medium opacity-70">
              Receita da produção
            </p>

            <p className="text-lg font-bold">
              {money(totalRevenue)}
            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          LUCRO TOTAL
      ====================================================== */}

      {Number(yieldQty) > 0 && salePrice > 0 && (

        <section className="rounded-2xl border border-slate-700 bg-slate-800 p-5">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Lucro estimado da receita
              </p>

              <p className="mt-1 text-2xl font-extrabold text-white">
                {money(totalProfit)}
              </p>

            </div>

            <div className="text-right">

              <p className="text-xs text-slate-500">
                Venda de {yieldQty} unidades
              </p>

              <p className="text-xs text-slate-500">
                a {money(salePrice)} cada
              </p>

            </div>

          </div>

        </section>

      )}

    </div>
  )
}
