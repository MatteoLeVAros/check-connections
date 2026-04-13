import dotenv from "dotenv";
dotenv.config();





async function checkProvider(config) {
    const start = Date.now();
    
    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.key}`,
            },
            
            body: JSON.stringify(config.body)

        });

        const latency = Date.now() - start;

        return {
            provider: config.name,
            status: response.ok ? 'OK' : 'ERROR',
            latency: latency,
            ...( !response.ok && { error: `HTTP ${response.status}` })
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






const providers = [
    {
        name: 'Mistral',
        url: 'https://api.mistral.ai/v1/chat/completions',
        key: process.env.MISTRAL_API_KEY,
        body: {
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
        }
    },
    {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        key: process.env.GROQ_API_KEY,
        body: {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
        }
    },
    {
        name: 'HuggingFace',
        url: 'https://router.huggingface.co/v1/chat/completions',
        key: process.env.HF_API_KEY, 
        body: {
            model: 'meta-llama/Llama-3.1-8B-Instruct',
            messages: [
            { role: 'user', content: 'ping' }
            ],
            max_tokens: 5
        }    
        
    }
];






const results = await Promise.all(providers.map(p => checkProvider(p)));

function displayResults(results) {
    console.log("🔍 Vérification des connexions API...\n");

    let success = 0;

    results.forEach(r => {
        const icon = r.status === 'OK' ? '✅' : '❌';
        const name = r.provider.padEnd(15, ' ');

        if (r.status === 'OK') {
            console.log(`${icon} ${name} ${r.latency}ms`);
            success++;
        } else {
            console.log(`${icon} ${name} ERROR (${r.error})`);
        }
    });

    console.log(`\n${success}/${results.length} connexions actives`);

    if (success === results.length) {
        console.log("Tout est ok");
    }
}

displayResults(results);