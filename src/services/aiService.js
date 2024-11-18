import OpenAI from 'openai';

export class AIService {
  constructor(baseURL = 'http://localhost:11434/v1/', apiKey = 'ollama') {
    this.client = new OpenAI({
      baseURL,
      apiKey
    });
    this.conversationHistory = [];
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return this.conversationHistory;
  }

  async generateData(config) {
    try {
      const messages = [
        {
          role: "system",
          content: "You are a helpful assistant that generates JSON data, without comments or explantion"
        },
        ...this.conversationHistory,
        {
          role: "user",
          content: config.prompt
        }
      ];

      const completion = await this.client.chat.completions.create({
        model: "q2.5coder:latest",
        messages: messages,
        temperature: 0.7,
      });

      const assistantResponse = completion.choices[0].message.content.trim();
      this.addToHistory("assistant", assistantResponse);

      return this.extractAndValidateJSON(assistantResponse, config);
    } catch (error) {
      throw new Error(`AI data generation failed: ${error.message}`);
    }
  }

  extractAndValidateJSON(jsonString, config) {
    try {
      const startIdx = jsonString.indexOf('[');
      const endIdx = jsonString.lastIndexOf(']') + 1;
      const jsonPart = jsonString.slice(startIdx, endIdx);
      const data = JSON.parse(jsonPart);

      if (!Array.isArray(data)) {
        throw new Error('Generated data is not an array');
      }

      return data.map(item => {
        const validatedItem = {};
        config.fields.forEach(fieldConfig => {
          const fieldName = typeof fieldConfig === 'string' ?
            fieldConfig :
            fieldConfig.field;

          console.log(item);
          
          if (!(fieldName in item)) {
            throw new Error(`Missing required field: ${fieldName}`);
          }
          validatedItem[fieldName] = item[fieldName];
        });
        return validatedItem;
      });
    } catch (error) {
      throw new Error(`JSON validation failed: ${error.message}`);
    }
  }
}