import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  PieChart as PieChartIcon, 
  Target, 
  Store, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function App() {
  // --- ESTADOS DO CÁLCULO PRINCIPAL ---
  const [productName, setProductName] = useState('');
  const [directCost, setDirectCost] = useState(50);
  const [fixedCostPct, setFixedCostPct] = useState(10);
  const [variableCostPct, setVariableCostPct] = useState(5);
  const [taxPct, setTaxPct] = useState(6);
  const [desiredProfitPct, setDesiredProfitPct] = useState(20);

  // --- ESTADOS DE PRODUTOS SALVOS ---
  const [savedProducts, setSavedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'channels' | 'reverse' | 'saved'

  // --- ESTADOS DO CÁLCULO REVERSO (PREÇO ALVO) ---
  const [targetPrice, setTargetPrice] = useState(100);

  // Carregar produtos salvos do LocalStorage
  useEffect(() => {
    const localData = localStorage.getItem('precifica_products');
    if (localData) {
      try {
        setSavedProducts(JSON.parse(localData));
      } catch (e) {
        console.error("Erro ao carregar do localStorage", e);
      }
    }
  }, []);

  // Salvar no LocalStorage ao atualizar produtos
  const saveToLocalStorage = (products) => {
    setSavedProducts(products);
    localStorage.setItem('precifica_products', JSON.stringify(products));
  };

  // --- LÓGICA FINANCEIRA (MARKUP DIVISOR) ---
  const totalDeductionPct = Number(fixedCostPct) + Number(variableCostPct) + Number(taxPct) + Number(desiredProfitPct);
  const isCalculable = totalDeductionPct < 100 && totalDeductionPct >= 0;
  
  const divisor = isCalculable ? (1 - (totalDeductionPct / 100)) : 0;
  const sellingPrice = isCalculable && divisor > 0 ? directCost / divisor : 0;

  // Valores em Reais
  const fixedCostVal = (sellingPrice * (fixedCostPct / 100));
  const variableCostVal = (sellingPrice * (variableCostPct / 100));
  const taxVal = (sellingPrice * (taxPct / 100));
  const profitVal = (sellingPrice * (desiredProfitPct / 100));

  // --- CÁLCULO REVERSO (PREÇO ALVO -> CUSTO MÁXIMO) ---
  const targetMaxDirectCost = isCalculable ? targetPrice * divisor : 0;

  // --- DADOS PARA O GRÁFICO ---
  const chartData = [
    { name: 'Custo Direto', value: Number(directCost), color: '#3B82F6' },
    { name: 'Custos Fixos', value: Number(fixedCostVal.toFixed(2)), color: '#6366F1' },
    { name: 'Custos Variáveis', value: Number(variableCostVal.toFixed(2)), color: '#EC4899' },
    { name: 'Impostos', value: Number(taxVal.toFixed(2)), color: '#F59E0B' },
    { name: 'Lucro Líquido', value: Number(profitVal.toFixed(2)), color: '#10B981' },
  ].filter(item => item.value > 0);

  // --- CANAIS DE VENDA SIMULADOS ---
  const channels = [
    { name: 'Balcão / Loja Física', extraTax: 0, cardTax: 2.5 },
    { name: 'E-commerce Próprio', extraTax: 3.5, cardTax: 2.9 },
    { name: 'Mercado Livre', extraTax: 16.5, cardTax: 0 },
    { name: 'Shopee', extraTax: 14.0, cardTax: 0 },
    { name: 'iFood / Delivery', extraTax: 23.0, cardTax: 0 },
  ];

  // Handler para salvar produto
  const handleSaveProduct = () => {
    if (!productName.trim()) {
      alert("Por favor, digite o nome do produto.");
      return;
    }
    if (!isCalculable) {
      alert("A soma das porcentagens não pode ultrapassar ou ser igual a 100%.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: productName,
      directCost: Number(directCost),
      fixedCostPct: Number(fixedCostPct),
      variableCostPct: Number(variableCostPct),
      taxPct: Number(taxPct),
      desiredProfitPct: Number(desiredProfitPct),
      sellingPrice: Number(sellingPrice.toFixed(2)),
      profitVal: Number(profitVal.toFixed(2)),
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newProduct, ...savedProducts];
    saveToLocalStorage(updated);
    setProductName('');
    alert("Produto salvo com sucesso!");
  };

  const handleDeleteProduct = (id) => {
    const updated = savedProducts.filter(p => p.id !== id);
    saveToLocalStorage(updated);
  };

  return (
