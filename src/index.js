import { collectionConfigs } from './config/collections.js';
import { AIService } from './services/aiService.js';
import { DBService } from './services/dbService.js';

export class DataGenerator {
    constructor(dbConfig = {}, aiConfig = {}) {
        this.dbService = new DBService(dbConfig.url);
        this.aiService = new AIService(aiConfig.baseURL, aiConfig.apiKey);
    }

    async initialize(email, password) {
        await this.dbService.authenticate(email, password);
    }

    async generateAndStore(collectionKey) {
        const config = collectionConfigs[collectionKey];
        if (!config) {
            throw new Error(`No configuration found for collection: ${collectionKey}`);
        }

        try {
            // Generate data using AI
            console.log(`Generating data for collection: ${collectionKey}`);
            const generatedData = await this.aiService.generateData(config);
            console.log(`Generated Data: ${JSON.stringify(generatedData)}`);

            // Store in database
            const { results, errors } = await this.dbService.createRecords(
                config.name,
                generatedData
            );

            if (errors.length > 0) {
                console.error(`Errors encountered while storing data:`, errors);
            }

            return {
                success: results.length > 0,
                resultsCount: results.length,
                errorCount: errors.length,
                errors: errors.length > 0 ? errors : null
            };
        } catch (error) {
            console.error(`Failed to generate and store data for collection ${collectionKey}:`, error);
            throw new Error(`Failed to generate and store data: ${error.message}`);
        }
    }
}
// Usage example:
async function main() {
    try {
        const generator = new DataGenerator(
            { url: 'http://127.0.0.1:8090' },
            {
                baseURL: 'http://localhost:11434/v1/',
                apiKey: 'ollama'
            }
        );

        await generator.initialize('m@m.com', '1234512345');

        // Iterate over all collections and generate/store them
        for (const [collectionName, config] of Object.entries(collectionConfigs)) {
            const result = await generator.generateAndStore(collectionName);
            console.log(`${config.name} generation result:`, JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('Error in data generation:', error);
    }
}

main();

// Usage example:
// async function main() {
//     try {
//         const generator = new DataGenerator(
//             { url: 'http://127.0.0.1:8090' },
//             {
//                 baseURL: 'http://localhost:11434/v1/',
//                 apiKey: 'ollama'
//             }
//         );

//         await generator.initialize('m@m.com', '1234512345');

//         // Generate and store languages
//         const languagesResult = await generator.generateAndStore('languages');
//         console.log('Languages generation result:', JSON.stringify(languagesResult, null, 2));

//         // Generate and store currencies
//         const currenciesResult = await generator.generateAndStore('currencies');
//         console.log('Currencies generation result:', JSON.stringify(currenciesResult, null, 2));
//     } catch (error) {
//         console.error('Error in data generation:', error);
//     }
// }

// main();

