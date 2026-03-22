/**
 * Teste rápido da API Google Gemini
 * Execute: node test-gemini.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Permite passar API key como argumento: node test-gemini.js YOUR_KEY
const apiKey = process.argv[2] || process.env.GEMINI_API_KEY || 'your_api_key_here';

console.log('🔍 Testando conexão com Google Gemini API...');
console.log('🔑 API Key:', apiKey === 'your_api_key_here' ? 'NÃO CONFIGURADA' : apiKey.substring(0, 15) + '...' + apiKey.slice(-4));
console.log('');

if (apiKey === 'your_api_key_here') {
  console.log('❌ ERRO: API Key não configurada!');
  console.log('');
  console.log('📋 Como obter sua API key GRATUITA:');
  console.log('   1. Acesse: https://aistudio.google.com/app/apikey');
  console.log('   2. Clique em "Create API Key"');
  console.log('   3. Copie a chave gerada');
  console.log('   4. Cole no arquivo .env.local: GEMINI_API_KEY=sua_chave_aqui');
  console.log('');
  console.log('   OU execute: node test-gemini.js SUA_CHAVE_AQUI');
  console.log('');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testAPI() {
  try {
    console.log('📡 Enviando requisição de teste...');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Responda apenas "OK" se você está funcionando.');
    const response = result.response.text();

    console.log('');
    console.log('✅ SUCESSO! A API está funcionando!');
    console.log('');
    console.log('📊 Resposta da API:', response.trim());
    console.log('');
    console.log('🎉 Sua chave Google Gemini está ATIVA e pronta para uso!');
    console.log('');
    console.log('💡 Próximo passo: Adicione a chave no arquivo .env.local:');
    console.log('   GEMINI_API_KEY=' + apiKey);
    console.log('');

    process.exit(0);

  } catch (error) {
    console.log('');
    console.log('❌ ERRO ao conectar com a API');
    console.log('');
    console.log('📋 Detalhes do erro:');
    console.log('   Mensagem:', error.message || 'Unknown error');
    console.log('');

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      console.log('🔴 PROBLEMA: API Key inválida');
      console.log('   Solução: Gerar nova API key em https://aistudio.google.com/app/apikey');
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      console.log('🔴 PROBLEMA: Limite de uso excedido');
      console.log('   Solução: Aguarde ou upgrade para plano pago em https://ai.google.dev/pricing');
    } else {
      console.log('🔴 PROBLEMA: Erro desconhecido');
      console.log('   Erro completo:', error);
    }

    console.log('');
    process.exit(1);
  }
}

testAPI();
