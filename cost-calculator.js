


function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}




function estimateCost(text) {
    const tokens = estimateTokens(text);
    const millionTokens = tokens / 1_000_000;
    const pricing = [
        { name: "Mistral Small", rate: 0.20 },
        { name: "Groq Llama 3",  rate: 0.05 },
        { name: "GPT-4o",        rate: 2.50 }
    ];


    console.log(`\nTexte : "${text}"`);
    console.log(`📏 Estimation : ${text.length} caractères → ~${tokens} tokens\n`);

    const results = pricing.map(p => {
        const costPerRequest = millionTokens * p.rate;
        return {
            "Provider": p.name,
            "Coût estimé (1 req)": costPerRequest.toFixed(8) + "€",
            "Pour 1000 requêtes": (costPerRequest * 1000).toFixed(5) + "€"
        };
    });

    console.table(results);
}


const userText = process.argv.slice(2).join(" ") || "Calcul du coût pour ce texte ";

estimateCost(userText);