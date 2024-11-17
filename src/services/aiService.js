import OpenAI from 'openai';

export class AIService {
    constructor(baseURL = 'http://localhost:11434/v1/', apiKey = 'ollama') {
      this.client = new OpenAI({
        baseURL,
        apiKey
      });
    }

    async generateData(config) {
      try {
        const completion = await this.client.chat.completions.create({
          model: "q2.5coder:latest",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates JSON data."
            },
            {
              role: "user",
              content: config.prompt
            }
          ],
          temperature: 0.7,
        });

        const jsonString = completion.choices[0].message.content.trim();
        return this.extractAndValidateJSON(jsonString, config);
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

        // Validate that each item has the required fields
        return data.map(item => {
          const validatedItem = {};
          config.fields.forEach(field => {
            if (!(field in item)) {
              throw new Error(`Missing required field: ${field}`);
            }
            validatedItem[field] = item[field];
          });
          return validatedItem;
        });
      } catch (error) {
        throw new Error(`JSON validation failed: ${error.message}`);
      }
    }
  }
