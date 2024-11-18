import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1/',
    apiKey: "Jn0Quk4rXXy4zB35wtdAieyIqEtESB9n",
});

// Array to store the conversation history
const conversationHistory = [];

async function main() {
    // Initial user message
    const userMessage1 = "Who are you?";
    conversationHistory.push({ role: "user", content: userMessage1 });

    // Get AI response
    let completion = await getAIResponse();
    console.log(completion.content);
    console.log(completion.usage.prompt_tokens, completion.usage.completion_tokens);

    // Example of a second user message
    const userMessage2 = "Can you tell me more about yourself?";
    conversationHistory.push({ role: "user", content: userMessage2 });

    // Get AI response to the second message
    completion = await getAIResponse();
    console.log(userMessage2);
    console.log(completion.content);
    console.log(completion.usage.prompt_tokens, completion.usage.completion_tokens);
}

async function getAIResponse() {
    const completion = await openai.chat.completions.create({
        messages: conversationHistory,
        model: "q2.5coder:latest",
    });

    // Store AI response in the history
    conversationHistory.push({
        role: "assistant",
        content: completion.choices[0].message.content,
    });

    return {
        content: completion.choices[0].message.content,
        usage: completion.usage,
    };
}

main();