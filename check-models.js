/**
 * Check available models via direct API call
 */

const apiKey = process.argv[2] || 'your_key_here';

console.log('🔍 Checking available Gemini models...');
console.log('🔑 API Key:', apiKey.substring(0, 15) + '...' + apiKey.slice(-4));
console.log('');

async function checkModels() {
  try {
    // Call ListModels endpoint directly
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('');
      console.log('Response:', errorText);
      console.log('');

      if (response.status === 403) {
        console.log('🔴 API não está habilitada ou chave sem permissão');
        console.log('');
        console.log('Soluções:');
        console.log('1. Habilite a API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('2. Verifique que a chave foi criada no projeto correto');
        console.log('3. Aguarde 1-2 minutos após habilitar');
      }

      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ API respondeu com sucesso!');
    console.log('');
    console.log('📋 Modelos disponíveis:');
    console.log('');

    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`  • ${model.name}`);
        console.log(`    Suporta: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });

      console.log('');
      console.log('🎉 Use um destes modelos no código!');
      console.log('');

      // Find the best model to use
      const flashModel = data.models.find(m => m.name.includes('gemini-1.5-flash'));
      const proModel = data.models.find(m => m.name.includes('gemini-1.5-pro'));
      const basicModel = data.models.find(m => m.name.includes('gemini-pro') || m.name.includes('gemini-1.0-pro'));

      const recommended = flashModel || proModel || basicModel || data.models[0];

      if (recommended) {
        // Remove 'models/' prefix if present
        const modelName = recommended.name.replace('models/', '');
        console.log('💡 Modelo recomendado:');
        console.log(`   model: "${modelName}"`);
        console.log('');
      }

    } else {
      console.log('⚠️ Nenhum modelo disponível');
      console.log('');
      console.log('Isso pode significar:');
      console.log('- A API key não tem permissões corretas');
      console.log('- Restrições regionais aplicam-se');
      console.log('- A conta precisa de verificação');
    }

  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('');
    console.log('Erro completo:', error);
  }
}

checkModels();
