# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### FunnelChart

A visualização de funil ignora registros cujo valor não seja um número finito.
As taxas de conversão entre etapas são calculadas automaticamente em relação ao
estágio válido anterior e exibidas no *tooltip*. Etapas com dados ausentes ou
inválidos são simplesmente desconsideradas no cálculo.
