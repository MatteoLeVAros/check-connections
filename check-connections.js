import dotenv from "dotenv";
dotenv.config();

console.log("--- Phase 1 : Vérification des clés API ---");

// On vérifie si les variables existent dans le .env
const mistralPresent = process.env.MISTRAL_API_KEY ? "présente ✅" : "manquante ❌";
const groqPresent = process.env.GROQ_API_KEY ? "présente ✅" : "manquante ❌";
const hfPresent = process.env.HF_API_KEY ? "présente ✅" : "manquante ❌";

console.log(`MISTRAL_API_KEY: ${mistralPresent}`);
console.log(`GROQ_API_KEY: ${groqPresent}`);
console.log(`HF_API_KEY: ${hfPresent}`);

console.log("\n--- Test de connexion (Mistral) ---");

// On ajoute le code du prof pour tester si la clé Mistral FONCTIONNE vraiment
if (process.env.MISTRAL_API_KEY) {
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [{ role: 'user', content: 'Test connection' }],
                max_tokens: 10
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('Connexion réussie !');
            console.log('Réponse test :', data.choices[0].message.content);
        } else {
            console.log('Erreur API :', data.error.message);
        }
    } catch (error) {
        console.log('Erreur réseau :', error.message);
    }
}