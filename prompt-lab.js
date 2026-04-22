
import dotenv from "dotenv";
dotenv.config();

const PROMPT = "Est ce que tu connais Renault";

const temperatures = [0, 0.5, 1];

const providers = [
  {
    name: "Mistral",
    url: "https://api.mistral.ai/v1/chat/completions",
    key: process.env.MISTRAL_API_KEY,
    model: "mistral-small-latest",
    type: "chat"
  },
  {
    name: "Groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    type: "chat"
  },
  {
    name: "HuggingFace",
    url: "https://router.huggingface.co/v1/chat/completions",
    key: process.env.HF_API_KEY,
    model: "meta-llama/Llama-3.1-8B-Instruct",
    type: "hf"
  }
];

/**
 * Envoi d'un prompt à un provider avec une température donnée
 */
async function runPrompt(provider, temperature) {
  const effectiveTemp =
    provider.name === "HuggingFace" && temperature === 0 ? 0.01 : temperature;

  const body =
    provider.type === "chat"
      ? {
          model: provider.model,
          temperature: effectiveTemp,
          messages: [{ role: "user", content: PROMPT }],
          max_tokens: 80
        }
      : {
          model: provider.model,
          temperature: effectiveTemp,
          messages: [{ role: "user", content: PROMPT }],
          max_tokens: 80
        };

  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    let output = "";

    if (provider.type === "hf") {
      // HF renvoie prompt + génération → on enlève le prompt
      const raw = data.choices[0].message.content;
      output = raw.replace(PROMPT, "").trim();
    } else {
      output = data.choices[0].message.content.trim();
    }

    return {
      provider: provider.name,
      temperature: temperature,
      output
    };
  } catch (err) {
    return {
      provider: provider.name,
      temperature: temperature,
      output: `Erreur: ${err.message}`
    };
  }
}

/**
 * Génération de toutes les combinaisons Provider × Température
 */
const jobs = providers.flatMap(provider =>
  temperatures.map(temp => runPrompt(provider, temp))
);

console.log("\n🧪 PROMPT LAB — comparaison des températures\n");

const results = await Promise.all(jobs);

results.forEach(r => {
  console.log(
    `🧠 ${r.provider} | temp=${r.temperature}\n→ ${r.output}\n`
  );
});

console.log(
  "🔍 Observez : à température 0, les réponses sont plus sèches et répétables.\n" +
  "À 1, elles varient entre les runs. C'est la température en action.\n"
);