/**
 * Lista modelos disponíveis no Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.argv[2] || 'your_key_here';

console.log('🔍 Listando modelos disponíveis no Gemini...');
console.log('🔑 API Key:', apiKey.substring(0, 15) + '...' + apiKey.slice(-4));
console.log('');

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('📡 Consultando modelos disponíveis...');
    console.log('');

    // Tenta diferentes endpoints
    const endpoints = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];

    for (const modelName of endpoints) {
      try {
        console.log(`Testando: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = result.response.text();

        console.log(`✅ FUNCIONA! Modelo: ${modelName}`);
        console.log(`   Resposta: ${response.substring(0, 50)}...`);
        console.log('');

        console.log('🎉 Use este modelo no código:');
        console.log(`   model: "${modelName}"`);
        console.log('');
        process.exit(0);

      } catch (err) {
        console.log(`❌ Não funciona: ${err.message.substring(0, 80)}...`);
      }
    }

    console.log('');
    console.log('❌ Nenhum modelo funcionou!');
    console.log('');
    console.log('Possíveis causas:');
    console.log('1. API key não tem permissões corretas');
    console.log('2. Gemini API não está habilitada');
    console.log('3. Restrições regionais');
    console.log('');
    console.log('Solução:');
    console.log('1. Acesse: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    console.log('2. Clique em "ENABLE" (Habilitar)');
    console.log('3. Aguarde 1-2 minutos');
    console.log('4. Teste novamente');
    console.log('');

  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('');
    console.log('Detalhes:', error);
  }
}

listModels();
