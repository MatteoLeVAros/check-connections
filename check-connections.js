import dotenv from "dotenv";
dotenv.config();

const isVerbose = process.argv.includes('--verbose');



async function checkChatProvider(config) {
    const start = Date.now();
    const prompt = isVerbose ? "Donne-moi la capitale de la France en un mot." : "ping";
    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.key}`,
            },
            
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 10
            })

        });

        const data = await response.json();
        const latency = Date.now() - start;

        let answer = "";
        if (isVerbose && response.ok) {
            answer = ` → "${data.choices[0].message.content.trim()}"`;
        }

        return {
            provider: config.name,
            status: response.ok ? 'OK' : 'ERROR',
            latency: latency,
            answer: answer,
            error: response.ok ? null : `HTTP ${response.status}`
        };
    } catch (err) {
        return { 
            provider: config.name, 
            status: 'ERROR', 
            latency: Date.now() - start, 
            error: err.message 
        };
    }
}


async function checkPinecone() {
    const start = Date.now();
    try {
        const response = await fetch('https://api.pinecone.io/indexes', {
            method: 'GET',
            headers: {
                'Api-Key': process.env.PINECONE_API_KEY,
                'X-Pinecone-API-Version': '2024-07'
            }
        });
        const latency = Date.now() - start;
        return {
            provider: 'Pinecone',
            status: response.ok ? 'OK' : 'ERROR',
            latency: latency,
            answer: "",
            error: response.ok ? null : `HTTP ${response.status}`
        };
    } catch (err) {
        return { provider: 'Pinecone', status: 'ERROR', latency: Date.now() - start, error: err.message };
    }
}

async function listMistralModels() {
    try {
        const response = await fetch('https://api.mistral.ai/v1/models', {
            headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` }
        });
        const data = await response.json();
        console.log("\n📦 Modèles Mistral disponibles:", data.data.map(m => m.id).slice(0, 5).join(', ') + '...');
    } catch (e) { /* silent error */ }
}

const chatConfigs = [
    {
        name: 'Mistral',
        url: 'https://api.mistral.ai/v1/chat/completions',
        key: process.env.MISTRAL_API_KEY,
        model: 'mistral-small-latest'
    },
    {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        key: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile'
    },
    {
        name: 'HuggingFace',
        url: 'https://router.huggingface.co/v1/chat/completions',
        key: process.env.HF_API_KEY, 
        model: 'meta-llama/Llama-3.1-8B-Instruct'
    }
];






const results = await Promise.all([
    ...chatConfigs.map(c => checkChatProvider(c)),
    checkPinecone()
]);


console.log("\n🔍 Vérification des connexions API...");
let successCount = 0;

results.forEach(r => {
    const icon = r.status === 'OK' ? '✅' : '❌';
    const name = r.provider.padEnd(15, ' ');
    const latency = `${r.latency}ms`.padEnd(8, ' ');
    
    if (r.status === 'OK') {
        console.log(`${icon} ${name} ${latency}${r.answer || ""}`);
        successCount++;
    } else {
        console.log(`${icon} ${name} ERROR (${r.error})`);
    }
});

console.log(`\n${successCount}/${results.length} connexions actives`);
if (successCount === results.length) console.log("Tout est vert. Vous êtes prêts pour la suite ! 🚀");

if (isVerbose) await listMistralModels();