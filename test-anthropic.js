/**
 * Teste rápido da API Anthropic
 * Execute: node test-anthropic.js
 */

const Anthropic = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY || '';

console.log('🔍 Testando conexão com Anthropic API...');
console.log('🔑 API Key:', apiKey.substring(0, 20) + '...' + apiKey.slice(-4));
console.log('');

const anthropic = new Anthropic({ apiKey });

async function testAPI() {
  try {
    console.log('📡 Enviando requisição de teste...');

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: 'Responda apenas "OK" se você está funcionando.'
      }]
    });

    console.log('');
    console.log('✅ SUCESSO! A API está funcionando!');
    console.log('');
    console.log('📊 Resposta da API:');
    console.log('   Modelo:', message.model);
    console.log('   ID:', message.id);
    console.log('   Resposta:', message.content[0].text);
    console.log('');
    console.log('🎉 Sua conta Anthropic está ATIVA e pronta para uso!');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.log('');
    console.log('❌ ERRO ao conectar com a API');
    console.log('');
    console.log('📋 Detalhes do erro:');
    console.log('   Status:', error.status || 'N/A');
    console.log('   Tipo:', error.error?.type || error.type || 'unknown');
    console.log('   Mensagem:', error.error?.message || error.message || 'Unknown error');
    console.log('');

    if (error.status === 401) {
      console.log('🔴 PROBLEMA: API Key inválida ou expirada');
      console.log('   Solução: Gerar nova API key em https://console.anthropic.com/settings/keys');
    } else if (error.status === 400 && error.message?.includes('credit')) {
      console.log('🔴 PROBLEMA: Créditos insuficientes');
      console.log('   Solução: Adicionar créditos em https://console.anthropic.com/settings/billing');
    } else if (error.error?.type === 'not_found_error') {
      console.log('🔴 PROBLEMA: Conta não tem acesso aos modelos Claude');
      console.log('   Possíveis causas:');
      console.log('   1. Pagamento não configurado');
      console.log('   2. Conta aguardando aprovação');
      console.log('   3. Restrições regionais');
      console.log('');
      console.log('   Soluções:');
      console.log('   1. Adicione método de pagamento: https://console.anthropic.com/settings/billing');
      console.log('   2. Verifique email para mensagens da Anthropic');
      console.log('   3. Aguarde aprovação (pode levar 24-48h)');
      console.log('   4. Contacte suporte: support@anthropic.com');
    } else {
      console.log('🔴 PROBLEMA: Erro desconhecido');
      console.log('   Erro completo:', JSON.stringify(error, null, 2));
    }

    console.log('');
    process.exit(1);
  }
}

testAPI();
