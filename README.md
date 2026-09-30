# Precifica - Calculadora de Precificação

App mobile-first (PWA) para calcular o preço de venda ideal usando **Markup Divisor**:

```
Preço de venda = Custo direto / (1 - (fixos% + variáveis% + impostos% + lucro%))
```

## Funcionalidades

- **Calcular**: preço ideal, lucro por unidade e gráfico de para onde vai cada real.
- **Canais**: preço necessário em balcão, e-commerce, Mercado Livre, Shopee e iFood.
- **Preço alvo**: dado o preço do mercado, mostra o custo máximo que ainda dá o lucro desejado.
- **Salvos**: guarda produtos no aparelho (localStorage) para editar depois.

## Como rodar

Requisito: [Node.js 18+](https://nodejs.org)

```bash
npm install
npm run dev        # abre em http://localhost:5173 (e na rede local, para testar no celular)
npm run build      # gera a pasta dist/
npm run preview    # testa o build
```

Para testar no celular, conecte-o na mesma rede Wi-Fi e abra o endereço "Network" que o `npm run dev` mostra.

## Estrutura

```
src/
├── App.jsx                 # Estado global e navegação entre abas
├── main.jsx
├── index.css
├── components/             # Telas (CalculatorTab, ChannelsTab...) e peças reutilizáveis
├── hooks/                  # usePricingForm, useLocalStorage
├── utils/
│   ├── pricing.js          # Regras financeiras (funções puras)
│   └── format.js           # Formatação R$ / % e conversão de texto para número
└── constants/
    ├── channels.js         # Canais de venda e taxas (edite aqui)
    └── tabs.js             # Abas do app
```

**Como escalar**: regras de negócio ficam em `utils/pricing.js` (sem React), então podem ser testadas ou
reaproveitadas. Novos canais entram em `constants/channels.js`. Para trocar o `localStorage` por um backend
(ex.: Supabase/Firebase), altere apenas o `useLocalStorage` / a lista de produtos no `App.jsx`.

## Publicar no GitHub Pages

1. Suba o projeto para um repositório no GitHub (branch `main`).
2. Em **Settings → Pages**, selecione **Source: GitHub Actions**.
3. A cada push, o workflow `.github/workflows/deploy.yml` publica o app automaticamente.

No celular, abra o link e use **Adicionar à tela inicial** para instalar como app.

## Subir para o GitHub

```bash
git init
git add .
git commit -m "Precifica: versão inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/precifica.git
git push -u origin main
```
