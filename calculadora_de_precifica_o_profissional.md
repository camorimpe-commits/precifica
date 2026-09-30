import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function App() {
  // --- ESTADOS DO FORMULÁRIO ---
  
  // 1. Custos Fixos
  const [custosFixos, setCustosFixos] = useState([
    { id: 1, nome: 'Aluguel / Espaço', valor: 800 },
    { id: 2, nome: 'Internet e Telefone', valor: 150 },
    { id: 3, nome: 'Energia e Água', valor: 200 },
    { id: 4, nome: 'Software e Ferramentas', valor: 150 },
  ]);

  // 2. Metas Financeiras
  const [prolaboreDesejado, setProlaboreDesejado] = useState(5000);
  const [diasTrabalhadosMes, setDiasTrabalhadosMes] = useState(20);
  const [horasTrabalhadasDia, setHorasTrabalhadasDia] = useState(8);
  const [porcentagemHorasProdutivas, setPorcentagemHorasProdutivas] = useState(70); // % de tempo vendável

  // 3. Custos Variáveis do Projeto/Serviço
  const [custosVariaveis, setCustosVariaveis] = useState([
    { id: 1, nome: 'Insumos / Materiais Diretos', valor: 100 },
    { id: 2, nome: 'Transporte / Deslocamento', valor: 50 },
  ]);

  // 4. Parâmetros do Projeto
  const [horasProjeto, setHorasProjeto] = useState(15);
  const [margemLucroDesejada, setMargemLucroDesejada] = useState(20); // %
  const [impostos, setImpostos] = useState(6); // % (ex: Simples Nacional / MEI)
  const [taxaCartao, setTaxaCartao] = useState(5); // % (taxas de meio de pagamento)

  // Modais de ajuda
  const [activeHelp, setActiveHelp] = useState(null);

  // --- CÁLCULOS ---

  // Total de Custos Fixos Mensais
  const totalCustosFixos = useMemo(() => {
    return custosFixos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [custosFixos]);

  // Horas totais e produtivas no mês
  const horasTotaisMes = useMemo(() => {
    return diasTrabalhadosMes * horasTrabalhadasDia;
  }, [diasTrabalhadosMes, horasTrabalhadasDia]);

  const horasProdutivasMes = useMemo(() => {
    return horasTotaisMes * (porcentagemHorasProdutivas / 100);
  }, [horasTotaisMes, porcentagemHorasProdutivas]);

  // Custo por hora total (Fixos + Pro-labore) / Horas Vendáveis
  const custoTotalMensal = useMemo(() => {
    return totalCustosFixos + Number(prolaboreDesejado);
  }, [totalCustosFixos, prolaboreDesejado]);

  const valorHoraBase = useMemo(() => {
    if (horasProdutivasMes <= 0) return 0;
    return custoTotalMensal / horasProdutivasMes;
  }, [custoTotalMensal, horasProdutivasMes]);

  // Total de Custos Diretos/Variáveis do Projeto
  const totalCustosVariaveis = useMemo(() => {
    return custosVariaveis.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  }, [custosVariaveis]);

  // Custo Direto da Mão de Obra do Projeto
  const custoMaoDeObraProjeto = useMemo(() => {
    return valorHoraBase * Number(horasProjeto);
  }, [valorHoraBase, horasProjeto]);

  // Subtotal (Mão de obra + Custos diretos)
  const subtotalProjeto = useMemo(() => {
    return custoMaoDeObraProjeto + totalCustosVariaveis;
  }, [custoMaoDeObraProjeto, totalCustosVariaveis]);

  /* 
     Cálculo do Preço Final com Margem e Deduções de Venda:
     Preço = (Subtotal) / (1 - (Impostos% + TaxaCartao% + Lucro%) / 100)
  */
  const somaPorcentagensDeducoes = useMemo(() => {
    return (Number(impostos) || 0) + (Number(taxaCartao) || 0) + (Number(margemLucroDesejada) || 0);
  }, [impostos, taxaCartao, margemLucroDesejada]);

  const precoSugerido = useMemo(() => {
    const divisor = 1 - (somaPorcentagensDeducoes / 100);
    if (divisor <= 0) return 0; // Previne divisão por zero ou negativa
    return subtotalProjeto / divisor;
  }, [subtotalProjeto, somaPorcentagensDeducoes]);

  // Valores Brutos em R$
  const valorImpostos = useMemo(() => (precoSugerido * (impostos / 100)), [precoSugerido, impostos]);
  const valorTaxaCartao = useMemo(() => (precoSugerido * (taxaCartao / 100)), [precoSugerido, taxaCartao]);
  const valorLucroEmpresa = useMemo(() => (precoSugerido * (margemLucroDesejada / 100)), [precoSugerido, margemLucroDesejada]);

  // --- FUNÇÕES AUXILIARES ---
  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const handleAddCustoFixo = () => {
    setCustosFixos([...custosFixos, { id: Date.now(), nome: '', valor: 0 }]);
  };

  const handleRemoveCustoFixo = (id) => {
    setCustosFixos(custosFixos.filter(item => item.id !== id));
  };

  const handleUpdateCustoFixo = (id, field, value) => {
    setCustosFixos(custosFixos.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'valor' ? Number(value) : value };
      }
      return item;
    }));
  };

  const handleAddCustoVariavel = () => {
    setCustosVariaveis([...custosVariaveis, { id: Date.now(), nome: '', valor: 0 }]);
  };

  const handleRemoveCustoVariavel = (id) => {
    setCustosVariaveis(custosVariaveis.filter(item => item.id !== id));
  };

  const handleUpdateCustoVariavel = (id, field, value) => {
    setCustosVariaveis(custosVariaveis.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'valor' ? Number(value) : value };
      }
      return item;
    }));
  };

  // Dados para o Gráfico de Pizza
  const pieChartData = [
    { name: 'Mão de Obra', value: custoMaoDeObraProjeto, color: '#3B82F6' },
    { name: 'Custos Diretos', value: totalCustosVariaveis, color: '#F59E0B' },
    { name: 'Impostos', value: valorImpostos, color: '#EF4444' },
    { name: 'Taxas de Cobrança', value: valorTaxaCartao, color: '#8B5CF6' },
    { name: 'Lucro Líquido', value: valorLucroEmpresa, color: '#10B981' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-8 text-center md:text-left md:flex md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Calculator className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Calculadora de Precificação Profissional
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Calcule o valor ideal da sua hora de trabalho e precifique serviços e projetos com margem de lucro garantida.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">Método de Precificação por Margem de Contribuição</span>
        </div>
      </header>

      {/* PAINEL PRINCIPAL GRID */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: ENTRADA DE DADOS (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PASSO 1: ESTRUTURA DE CUSTOS FIXOS */}
          <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">1. Custos Fixos Mensais</h2>
              </div>
              <button 
                onClick={handleAddCustoFixo}
                className="flex items-center gap-1.5 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Custo
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Gastos recorrentes para manter seu negócio funcionando, mesmo sem clientes no mês.
            </p>

            <div className="space-y-3">
              {custosFixos.map((custo) => (
                <div key={custo.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome da despesa"
                    value={custo.nome}
                    onChange={(e) => handleUpdateCustoFixo(custo.id, 'nome', e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="relative w-32 md:w-40">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs">R$</span>
                    <input
                      type="number"
                      value={custo.valor}
                      onChange={(e) => handleUpdateCustoFixo(custo.id, 'valor', e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors text-right"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveCustoFixo(custo.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Total de Custos Fixos:</span>
              <span className="text-indigo-300 font-bold text-base">{formatMoney(totalCustosFixos)}</span>
            </div>
          </section>

          {/* PASSO 2: PRÓ-LABORE E JORNADA DE TRABALHO */}
          <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">2. Meta Salarial & Capacidade</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Pró-Labore Desejado (Seu Salário Líquido Mensal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">R$</span>
                  <input
                    type="number"
                    value={prolaboreDesejado}
                    onChange={(e) => setProlaboreDesejado(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Dias Trabalhados/Mês
                </label>
                <input
                  type="number"
                  value={diasTrabalhadosMes}
                  onChange={(e) => setDiasTrabalhadosMes(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Horas Trabalhadas/Dia
                </label>
                <input
                  type="number"
                  value={horasTrabalhadasDia}
                  onChange={(e) => setHorasTrabalhadasDia(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    Horas Produtivas (Faturáveis)
                    <button 
                      type="button" 
                      onClick={() => setActiveHelp(activeHelp === 'produtivas' ? null : 'produtivas')}
                      className="text-slate-400 hover:text-indigo-400"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </label>
                  <span className="text-xs font-semibold text-indigo-400">{porcentagemHorasProdutivas}%</span>
                </div>
                
                {activeHelp === 'produtivas' && (
                  <div className="p-3 bg-indigo-950/60 border border-indigo-800/50 rounded-xl text-xs text-indigo-200 mb-2">
                    Nem todo tempo de trabalho é cobrado do cliente (reuniões, estudos, financeiro, marketing). Recomendamos entre 60% a 70% de eficiência.
                  </div>
                )}

                <input
                  type="range"
                  min="30"
                  max="100"
                  value={porcentagemHorasProdutivas}
                  onChange={(e) => setPorcentagemHorasProdutivas(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>30% (Muitas reuniões/estudo)</span>
                  <span>70% (Recomendado)</span>
                  <span>100% (Sem pausas/gestão)</span>
                </div>
              </div>
            </div>

            {/* Resumo da Hora Base */}
            <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-300">Custo da Sua Hora Mínima</p>
                <p className="text-xs text-slate-400">Total de {horasProdutivasMes.toFixed(0)}h vendáveis/mês</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-indigo-300">{formatMoney(valorHoraBase)}</span>
                <span className="text-xs text-slate-400">/hora</span>
              </div>
            </div>
          </section>

          {/* PASSO 3: DADOS DO PROJETO / SERVIÇO */}
          <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">3. Especificações do Projeto</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Horas Estimadas para este Projeto
                </label>
                <input
                  type="number"
                  value={horasProjeto}
                  onChange={(e) => setHorasProjeto(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                />
              </div>

              {/* Custos Variáveis do Projeto */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-300 font-medium">
                    Custos Diretos/Insumos para este Projeto
                  </label>
                  <button 
                    onClick={handleAddCustoVariavel}
                    className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Insumo
                  </button>
                </div>

                <div className="space-y-2">
                  {custosVariaveis.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Licença de software, frete, material"
                        value={item.nome}
                        onChange={(e) => handleUpdateCustoVariavel(item.id, 'nome', e.target.value)}
                        className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs">R$</span>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={(e) => handleUpdateCustoVariavel(item.id, 'valor', e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-right"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveCustoVariavel(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impostos, Taxas e Margem de Lucro */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Impostos (%)
                  </label>
                  <input
                    type="number"
                    value={impostos}
                    onChange={(e) => setImpostos(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Taxa Cartão/Meio (%)
                  </label>
                  <input
                    type="number"
                    value={taxaCartao}
                    onChange={(e) => setTaxaCartao(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Lucro da Empresa (%)
                  </label>
                  <input
                    type="number"
                    value={margemLucroDesejada}
                    onChange={(e) => setMargemLucroDesejada(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold text-emerald-400"
                  />
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* COLUNA DIREITA: RESULTADOS E GRÁFICOS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD DE RESULTADO PRINCIPAL */}
          <div className="bg-gradient-to-b from-indigo-900/40 via-slate-800/80 to-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden sticky top-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Preço Sugerido de Venda
            </span>

            <div className="mt-4 mb-6">
              <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {formatMoney(precoSugerido)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Valor ideal para cobrir custos, impostos e garantir o lucro esperado.
              </p>
            </div>

            {/* DEMONSTRATIVO DE REPARTIÇÃO DO VALOR */}
            <div className="space-y-2.5 border-t border-slate-700/60 pt-4 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Mão de Obra ({horasProjeto}h x {formatMoney(valorHoraBase)})
                </span>
                <span className="font-semibold text-slate-100">{formatMoney(custoMaoDeObraProjeto)}</span>
              </div>

              {totalCustosVariaveis > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Custos Diretos do Projeto
                  </span>
                  <span className="font-semibold text-slate-100">{formatMoney(totalCustosVariaveis)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Impostos ({impostos}%)
                </span>
                <span className="font-semibold text-slate-100">{formatMoney(valorImpostos)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Taxa de Meios de Pagamento ({taxaCartao}%)
                </span>
                <span className="font-semibold text-slate-100">{formatMoney(valorTaxaCartao)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-700/40 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Lucro Líquido Retido ({margemLucroDesejada}%)
                </span>
                <span className="text-sm">{formatMoney(valorLucroEmpresa)}</span>
              </div>
            </div>

            {/* GRÁFICO DE COMPOSIÇÃO */}
            <div className="mt-6 pt-4 border-t border-slate-700/60">
              <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5" /> Composição do Preço
              </p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatMoney(val)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DICA FINAL DE VENDAS */}
            <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Dica: O valor da hora base cobre seus custos pessoais e de empresa. O <strong>Lucro Líquido</strong> serve para criar caixa de emergência e reinvestir no seu negócio.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}