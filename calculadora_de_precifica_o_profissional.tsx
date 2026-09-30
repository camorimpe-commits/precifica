import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Store, 
  Target, 
  FolderKanban, 
  Plus, 
  Trash2, 
  Download, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Layers, 
  RefreshCw,
  Search,
  FileSpreadsheet,
  Info,
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const DEFAULT_CHANNELS = [
  { id: 'balcao', name: 'Loja Física / Balcão', commission: 0, fixedFee: 0, tax: 6 },
  { id: 'mercadolivre', name: 'Mercado Livre (Clássico)', commission: 12, fixedFee: 6.00, tax: 6 },
  { id: 'shopee', name: 'Shopee Standard', commission: 14, fixedFee: 4.00, tax: 6 },
  { id: 'ifood', name: 'iFood Entrega', commission: 12, fixedFee: 0, tax: 6 },
  { id: 'site', name: 'E-commerce Próprio', commission: 3.5, fixedFee: 0.50, tax: 6 },
];

const formatBRL = (val) => {
  if (isNaN(val) || !isFinite(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatPct = (val) => {
  if (isNaN(val) || !isFinite(val)) return '0,00%';
  return `${Number(val).toFixed(2).replace('.', ',')}%`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'channels' | 'reverse' | 'catalog'

  /* --- CALCULATOR STATE --- */
  const [productName, setProductName] = useState('Novo Produto');
  const [directCost, setDirectCost] = useState(35.00);
  const [extraCost, setExtraCost] = useState(5.00);
  const [variableCostPct, setVariableCostPct] = useState(5.00); // Ex: comissão, taxa cartão
  const [taxPct, setTaxPct] = useState(6.00); // Impostos
  const [fixedCostPct, setFixedCostPct] = useState(15.00); // Rateio custos fixos
  const [profitMarginPct, setProfitMarginPct] = useState(20.00); // Margem desejada

  /* --- REVERSE PRICING STATE --- */
  const [targetPrice, setTargetPrice] = useState(100.00);
  const [revVarCostPct, setRevVarCostPct] = useState(5.00);
  const [revTaxPct, setRevTaxPct] = useState(6.00);
  const [revFixedCostPct, setRevFixedCostPct] = useState(15.00);
  const [revProfitMarginPct, setRevProfitMarginPct] = useState(20.00);

  /* --- CHANNELS SIMULATOR STATE --- */
  const [channelProdCost, setChannelProdCost] = useState(40.00);
  const [channelFixedCostPct, setChannelFixedCostPct] = useState(15.00);
  const [channelProfitMarginPct, setChannelProfitMarginPct] = useState(20.00);
  const [customChannels, setCustomChannels] = useState(DEFAULT_CHANNELS);

  /* --- CATALOG STATE (LOCALSTORAGE) --- */
  const [savedProducts, setSavedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('precificacao_produtos_db');
      if (stored) {
        setSavedProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar do localStorage", e);
    }
  }, []);

  const saveProductsToStorage = (updatedList) => {
    setSavedProducts(updatedList);
    try {
      localStorage.setItem('precificacao_produtos_db', JSON.stringify(updatedList));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  };

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const calculatePricing = (cDirect, cExtra, pVar, pTax, pFixed, pProfit) => {
    const totalDirectCost = (parseFloat(cDirect) || 0) + (parseFloat(cExtra) || 0);
    const sumPercentages = (parseFloat(pVar) || 0) + (parseFloat(pTax) || 0) + (parseFloat(pFixed) || 0) + (parseFloat(pProfit) || 0);

    const isInvalid = sumPercentages >= 100;
    const markupDivisor = isInvalid ? 0 : (100 - sumPercentages) / 100;
    
    const sellingPrice = (markupDivisor > 0 && totalDirectCost > 0) ? totalDirectCost / markupDivisor : 0;
    
    // Detailed values in R$
    const variableCostVal = sellingPrice * ((parseFloat(pVar) || 0) / 100);
    const taxVal = sellingPrice * ((parseFloat(pTax) || 0) / 100);
    const fixedCostVal = sellingPrice * ((parseFloat(pFixed) || 0) / 100);
    const netProfitVal = sellingPrice * ((parseFloat(pProfit) || 0) / 100);
    
    // Contribution Margin (Preço de Venda - Custos Variáveis Diretos - Custos Variáveis %)
    const contributionMarginVal = sellingPrice - totalDirectCost - variableCostVal - taxVal;
    const contributionMarginPct = sellingPrice > 0 ? (contributionMarginVal / sellingPrice) * 100 : 0;

    return {
      totalDirectCost,
      sumPercentages,
      isInvalid,
      markupDivisor,
      sellingPrice,
      variableCostVal,
      taxVal,
      fixedCostVal,
      netProfitVal,
      contributionMarginVal,
      contributionMarginPct
    };
  };

  const currentPricing = useMemo(() => {
    return calculatePricing(directCost, extraCost, variableCostPct, taxPct, fixedCostPct, profitMarginPct);
  }, [directCost, extraCost, variableCostPct, taxPct, fixedCostPct, profitMarginPct]);

  const reversePricing = useMemo(() => {
    const price = parseFloat(targetPrice) || 0;
    const sumPct = (parseFloat(revVarCostPct) || 0) + (parseFloat(revTaxPct) || 0) + (parseFloat(revFixedCostPct) || 0) + (parseFloat(revProfitMarginPct) || 0);
    const isInvalid = sumPct >= 100;
    const multiplier = isInvalid ? 0 : (100 - sumPct) / 100;
    
    const maxDirectCost = price * multiplier;
    const netProfitVal = price * ((parseFloat(revProfitMarginPct) || 0) / 100);
    
    return {
      price,
      sumPct,
      isInvalid,
      maxDirectCost,
      netProfitVal
    };
  }, [targetPrice, revVarCostPct, revTaxPct, revFixedCostPct, revProfitMarginPct]);

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      showToast('Por favor, informe o nome do produto.', 'error');
      return;
    }
    if (currentPricing.isInvalid || currentPricing.sellingPrice <= 0) {
      showToast('A soma dos percentuais é inválida ou o preço é zero.', 'error');
      return;
    }

    const newProd = {
      id: Date.now().toString(),
      name: productName,
      directCost: parseFloat(directCost) || 0,
      extraCost: parseFloat(extraCost) || 0,
      variableCostPct: parseFloat(variableCostPct) || 0,
      taxPct: parseFloat(taxPct) || 0,
      fixedCostPct: parseFloat(fixedCostPct) || 0,
      profitMarginPct: parseFloat(profitMarginPct) || 0,
      sellingPrice: currentPricing.sellingPrice,
      netProfitVal: currentPricing.netProfitVal,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newProd, ...savedProducts];
    saveProductsToStorage(updated);
    showToast(`Produto "${productName}" salvo no catálogo!`);
  };

  const exportToCSV = () => {
    if (savedProducts.length === 0) {
      showToast('Nenhum produto cadastrado para exportar.', 'error');
      return;
    }

    const headers = ['Nome', 'Custo Direto (R$)', 'Custo Extra (R$)', 'Taxas Var (%)', 'Impostos (%)', 'Rateio Fixo (%)', 'Margem Lucro (%)', 'Preço Venda (R$)', 'Lucro Líquido (R$)', 'Data'];
    const rows = savedProducts.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.directCost.toFixed(2),
      p.extraCost.toFixed(2),
      p.variableCostPct.toFixed(2),
      p.taxPct.toFixed(2),
      p.fixedCostPct.toFixed(2),
      p.profitMarginPct.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.netProfitVal.toFixed(2),
      p.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_produtos_precificados_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Catálogo exportado para CSV com sucesso!');
  };

  const filteredProducts = useMemo(() => {
    return savedProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [savedProducts, searchTerm]);

  const pieChartData = useMemo(() => {
    if (currentPricing.isInvalid || currentPricing.sellingPrice <= 0) return [];
    return [
      { name: 'Custos Diretos', value: currentPricing.totalDirectCost, color: '#3b82f6' },
      { name: 'Taxas Variáveis', value: currentPricing.variableCostVal, color: '#f59e0b' },
      { name: 'Impostos', value: currentPricing.taxVal, color: '#ef4444' },
      { name: 'Rateio Custo Fixo', value: currentPricing.fixedCostVal, color: '#8b5cf6' },
      { name: 'Lucro Líquido', value: currentPricing.netProfitVal, color: '#10b981' }
    ];
  }, [currentPricing]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 animate-bounce ${
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-800 text-rose-200' : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {notification.msg}
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                PrecificaPRO
              </h1>
              <p className="text-xs text-slate-400">Inteligência Financeira & Precificação Real</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calculator' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden md:inline">Calculadora Principal</span>
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'channels' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden md:inline">Canais & Marketplaces</span>
            </button>
            <button
              onClick={() => setActiveTab('reverse')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reverse' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden md:inline">Preço Alvo Inverso</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalog' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span className="hidden md:inline">Catálogo Salvo ({savedProducts.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN - FORM INPUTS */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-100">1. Identificação do Produto</h2>
                      <p className="text-xs text-slate-400">Insira as informações básicas para salvar depois</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Nome do Produto / SKU</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Camiseta de Algodão Premium"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* DIRECT COSTS CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">2. Custos Diretos em Dinheiro (R$)</h2>
                    <p className="text-xs text-slate-400">Quanto você gasta diretamente por unidade fabricada ou comprada</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                      <span>Insumos / Fornecedor (R$)</span>
                      <span className="text-slate-500 text-[10px]">Custo Base</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={directCost}
                        onChange={(e) => setDirectCost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                      <span>Custos Extras (Embalagem, Frete) (R$)</span>
                      <span className="text-slate-500 text-[10px]">Adicionais</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={extraCost}
                        onChange={(e) => setExtraCost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Custo Direto Total por Unidade:</span>
                  <span className="text-sm font-bold text-emerald-400">{formatBRL(currentPricing.totalDirectCost)}</span>
                </div>
              </div>

              {/* PERCENTAGE DEDUCTIONS CARD */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">3. Deduções Percentuais e Margem (%)</h2>
                    <p className="text-xs text-slate-400">Porcentagens calculadas sobre o Preço Final de Venda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Taxas Variáveis de Venda (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={variableCostPct}
                        onChange={(e) => setVariableCostPct(e.target.value)}
                        placeholder="Ex: 5"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Comissões, taxas de cartão, gateway</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Impostos Diretos (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={taxPct}
                        onChange={(e) => setTaxPct(e.target.value)}
                        placeholder="Ex: 6"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Simples Nacional, MEI, ICMS, ISS</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Rateio de Custos Fixos (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={fixedCostPct}
                        onChange={(e) => setFixedCostPct(e.target.value)}
                        placeholder="Ex: 15"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Contribuição p/ aluguel, salários, luz</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2 text-emerald-400 font-semibold">
                      Margem de Lucro Desejada (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={profitMarginPct}
                        onChange={(e) => setProfitMarginPct(e.target.value)}
                        placeholder="Ex: 20"
                        className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-2.5 text-emerald-500 text-sm font-bold">%</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">Lucro líquido livre no seu bolso</span>
                  </div>
                </div>

                {/* Validation Indicator Bar */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Soma Total das Alíquotas (%):</span>
                    <span className={`font-bold ${currentPricing.isInvalid ? 'text-rose-400' : 'text-slate-200'}`}>
                      {formatPct(currentPricing.sumPercentages)} / 100%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        currentPricing.isInvalid ? 'bg-rose-500' : currentPricing.sumPercentages > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(currentPricing.sumPercentages, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - PRICING RESULTS & VISUALIZATION */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* WARNING BOX IF INVALID */}
              {currentPricing.isInvalid ? (
                <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm text-rose-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                    <h3 className="font-bold text-base">Operação Inválida!</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-300">
                    A soma das suas taxas, impostos e margem de lucro atingiu ou ultrapassou <strong>100%</strong> ({formatPct(currentPricing.sumPercentages)}).
                  </p>
                  <p className="text-xs leading-relaxed text-rose-300">
                    Matematicamente é impossível precificar um produto onde as deduções consomem todo o valor da venda. Reduza a margem ou os custos fixos.
                  </p>
                </div>
              ) : (
                /* MAIN PRICING RESULT CARD */
                <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    Preço de Venda Recomendado
                  </span>

                  <div className="mt-4 mb-6">
                    <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {formatBRL(currentPricing.sellingPrice)}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Calculado com base no Markup Divisor de <span className="text-slate-200 font-semibold">{currentPricing.markupDivisor.toFixed(4)}</span>
                    </p>
                  </div>

                  {/* KEY METRICS GRID */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Lucro Líquido (R$)</span>
                      <span className="text-lg font-bold text-emerald-400">{formatBRL(currentPricing.netProfitVal)}</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Margem Contribuição</span>
                      <span className="text-lg font-bold text-blue-400">{formatPct(currentPricing.contributionMarginPct)}</span>
                    </div>
                  </div>

                  {/* DETAILED PRICE BREAKDOWN TABLE */}
                  <div className="space-y-2 border-t border-slate-800/80 pt-4 text-xs">
                    <h4 className="font-semibold text-slate-300 mb-3 flex items-center justify-between">
                      <span>Para onde vai o dinheiro?</span>
                      <span className="text-slate-500 font-normal">Valor / %</span>
                    </h4>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Custos Diretos (Produto/Insumo)
                      </span>
                      <span className="font-medium text-slate-200">{formatBRL(currentPricing.totalDirectCost)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Taxas Variáveis ({formatPct(variableCostPct)})
                      </span>
                      <span className="font-medium text-slate-200">{formatBRL(currentPricing.variableCostVal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        Impostos Diretos ({formatPct(taxPct)})
                      </span>
                      <span className="font-medium text-slate-200">{formatBRL(currentPricing.taxVal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        Rateio de Custos Fixos ({formatPct(fixedCostPct)})
                      </span>
                      <span className="font-medium text-slate-200">{formatBRL(currentPricing.fixedCostVal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 font-semibold text-emerald-400 bg-emerald-950/20 px-2 rounded-lg mt-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Lucro Líquido Real ({formatPct(profitMarginPct)})
                      </span>
                      <span>{formatBRL(currentPricing.netProfitVal)}</span>
                    </div>
                  </div>

                  {/* SAVE PRODUCT BUTTON */}
                  <button
                    onClick={handleSaveProduct}
                    className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Salvar Produto no Catálogo
                  </button>
                </div>
              )}

              {/* RECHARTS PIE CHART VISUALIZATION */}
              {!currentPricing.isInvalid && currentPricing.sellingPrice > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    Composição Gráfica do Preço
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => formatBRL(value)}
                          contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-400" />
                    Simulador Multi-Canais de Venda
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Compare automaticamente quanto seu produto deve custar na Shopee, Mercado Livre, iFood e Loja Física para manter a **mesma margem de lucro**.
                  </p>
                </div>
              </div>

              {/* BASE SIMULATION INPUTS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Custo Direto do Produto (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={channelProdCost}
                      onChange={(e) => setChannelProdCost(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Rateio de Custo Fixo (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={channelFixedCostPct}
                      onChange={(e) => setChannelFixedCostPct(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2 text-emerald-400 font-semibold">Margem de Lucro Alvo (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={channelProfitMarginPct}
                      onChange={(e) => setChannelProfitMarginPct(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-2.5 text-emerald-500 text-sm font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CHANNELS COMPARISON CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customChannels.map((channel) => {
                // Calculation per channel: Price = (DirectCost + FixedFee) / (1 - (Commission + Tax + FixedCostPct + ProfitMarginPct)/100)
                const cProd = parseFloat(channelProdCost) || 0;
                const cFixedPct = parseFloat(channelFixedCostPct) || 0;
                const cProfitPct = parseFloat(channelProfitMarginPct) || 0;

                const totalPct = channel.commission + channel.tax + cFixedPct + cProfitPct;
                const isInvalid = totalPct >= 100;
                const divisor = isInvalid ? 0 : (100 - totalPct) / 100;

                const calculatedPrice = (divisor > 0) ? (cProd + channel.fixedFee) / divisor : 0;
                const netProfit = calculatedPrice * (cProfitPct / 100);
                const platformCut = (calculatedPrice * (channel.commission / 100)) + channel.fixedFee;

                return (
                  <div key={channel.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                        <h3 className="font-bold text-base text-slate-100">{channel.name}</h3>
                        <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                          Taxa: {channel.commission}% {channel.fixedFee > 0 && `+ ${formatBRL(channel.fixedFee)}`}
                        </span>
                      </div>

                      {isInvalid ? (
                        <div className="p-4 bg-rose-950/30 border border-rose-800 rounded-xl text-rose-300 text-xs">
                          Alíquotas somam {formatPct(totalPct)} (&ge; 100%). Inviável.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <span className="text-xs text-slate-400 block">Preço de Venda Recomendado</span>
                            <span className="text-3xl font-extrabold text-white">{formatBRL(calculatedPrice)}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                              <span className="text-slate-500 block text-[10px]">Corte do Marketplace</span>
                              <span className="font-semibold text-rose-400">{formatBRL(platformCut)}</span>
                            </div>

                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                              <span className="text-slate-500 block text-[10px]">Lucro Líquido Real</span>
                              <span className="font-semibold text-emerald-400">{formatBRL(netProfit)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Imposto: {channel.tax}%</span>
                      <span>Rateio Fixo: {cFixedPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {}
        {activeTab === 'reverse' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-100">Calculadora de Preço Alvo (Inverso)</h2>
                    <p className="text-xs text-slate-400">Descubra qual o CUSTO MÁXIMO do produto para poder vender pelo preço do concorrente</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Preço Alvo de Venda Desejado (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="Ex: 99.90"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Taxas Variáveis (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={revVarCostPct}
                        onChange={(e) => setRevVarCostPct(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Impostos (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={revTaxPct}
                        onChange={(e) => setRevTaxPct(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Rateio Fixo (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={revFixedCostPct}
                        onChange={(e) => setRevFixedCostPct(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2 font-semibold text-emerald-400">Margem Lucro (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={revProfitMarginPct}
                        onChange={(e) => setRevProfitMarginPct(e.target.value)}
                        className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REVERSE RESULT CARD */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                    Resultado da Engenharia Reversa
                  </span>

                  <div className="mt-6 mb-6">
                    <span className="text-xs text-slate-400 block mb-1">Custo Direto Máximo Permitido por Unidade</span>
                    <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                      {reversePricing.isInvalid ? 'Inviável' : formatBRL(reversePricing.maxDirectCost)}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Para vender por <span className="text-slate-200 font-bold">{formatBRL(reversePricing.price)}</span> e ainda lucrar <span className="text-emerald-400 font-bold">{formatBRL(reversePricing.netProfitVal)}</span> ({formatPct(revProfitMarginPct)}), seus insumos não podem custar mais que o valor acima.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Preço de Venda Final:</span>
                      <span className="text-slate-200 font-semibold">{formatBRL(reversePricing.price)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Deduções e Margem Combinadas:</span>
                      <span className="text-slate-200 font-semibold">{formatPct(reversePricing.sumPct)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800">
                      <span>Lucro Líquido Garantido:</span>
                      <span>{formatBRL(reversePricing.netProfitVal)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Use essa ferramenta para negociar descontos com fornecedores antes de lançar o produto.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-emerald-400" />
                    Catálogo de Produtos Precificados
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Seus produtos salvos ficam armazenados no navegador e podem ser exportados para planilhas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Exportar CSV / Excel
                  </button>
                </div>
              </div>

              {/* SEARCH BAR */}
              <div className="mt-6 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produto por nome..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* CATALOG TABLE / GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <FolderKanban className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-sm">Nenhum produto cadastrado no catálogo.</p>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Precificar Primeiro Produto
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 font-semibold">Produto</th>
                        <th className="py-3.5 px-4 font-semibold">Custo Direto</th>
                        <th className="py-3.5 px-4 font-semibold">Taxas + Impostos</th>
                        <th className="py-3.5 px-4 font-semibold">Margem</th>
                        <th className="py-3.5 px-4 font-semibold">Preço Venda</th>
                        <th className="py-3.5 px-4 font-semibold">Lucro Líquido</th>
                        <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white">{prod.name}</td>
                          <td className="py-3.5 px-4">{formatBRL(prod.directCost + prod.extraCost)}</td>
                          <td className="py-3.5 px-4 text-slate-400">{formatPct(prod.variableCostPct + prod.taxPct)}</td>
                          <td className="py-3.5 px-4 text-emerald-400 font-medium">{formatPct(prod.profitMarginPct)}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{formatBRL(prod.sellingPrice)}</td>
                          <td className="py-3.5 px-4 font-semibold text-emerald-400">{formatBRL(prod.netProfitVal)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                const updated = savedProducts.filter(p => p.id !== prod.id);
                                saveProductsToStorage(updated);
                                showToast(`Produto removido com sucesso.`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all"
                              title="Excluir produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© PrecificaPRO — Calculadora de Precificação Financeira de Alta Precisão</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Markup Divisor</span>
            <span>•</span>
            <span>Pronto para Vercel</span>
          </div>
        </div>
      </footer>

    </div>
  );
}