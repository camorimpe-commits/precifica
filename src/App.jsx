import { useEffect, useRef, useState } from 'react'
import BottomNav from './components/BottomNav'
import CalculatorTab from './components/CalculatorTab'
import ChannelsTab from './components/ChannelsTab'
import ReverseTab from './components/ReverseTab'
import SavedTab from './components/SavedTab'
import Toast from './components/Toast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePricingForm } from './hooks/usePricingForm'

// Mesma chave da versão anterior: produtos já salvos continuam aparecendo.
const STORAGE_KEY = 'precifica_products'

const TITLES = {
  calculator: 'Calculadora de preço',
  channels: 'Preço por canal de venda',
  reverse: 'Preço alvo',
  saved: 'Produtos salvos',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [savedProducts, setSavedProducts] = useLocalStorage(STORAGE_KEY, [])
  const { form, params, result, setField, reset, load } = usePricingForm()

  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const notify = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2500)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const changeTab = (tab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0 })
  }

  const handleSave = () => {
    if (!form.name.trim()) return notify('Digite o nome do produto para salvar.')
    if (!result.isCalculable) return notify('A soma das porcentagens precisa ser menor que 100%.')

    const product = {
      id: Date.now(),
      name: form.name.trim(),
      ...params,
      sellingPrice: Number(result.sellingPrice.toFixed(2)),
      profitVal: Number(result.values.profit.toFixed(2)),
      createdAt: new Date().toLocaleDateString('pt-BR'),
    }

    setSavedProducts((list) => [product, ...list])
    setField('name', '')
    notify('Produto salvo!')
  }

  const handleDelete = (id) => {
    setSavedProducts((list) => list.filter((p) => p.id !== id))
    notify('Produto excluído.')
  }

  const handleLoad = (product) => {
    load(product)
    changeTab('calculator')
    notify('Produto carregado na calculadora.')
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <header className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Precifica</h1>
        <p className="text-sm font-semibold text-slate-400">{TITLES[activeTab]}</p>
      </header>

      <main>
        {activeTab === 'calculator' && (
          <CalculatorTab form={form} result={result} setField={setField} onSave={handleSave} onReset={reset} />
        )}
        {activeTab === 'channels' && <ChannelsTab params={params} result={result} />}
        {activeTab === 'reverse' && <ReverseTab params={params} result={result} />}
        {activeTab === 'saved' && <SavedTab products={savedProducts} onLoad={handleLoad} onDelete={handleDelete} />}
      </main>

      <Toast message={toast} />
      <BottomNav active={activeTab} onChange={changeTab} savedCount={savedProducts.length} />
    </div>
  )
}
