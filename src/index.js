import { AIService } from './services/aiService.js';
import { DBService } from './services/dbService.js';
import { collectionConfigs } from './config/collections.js';

export class DataGenerator {
    constructor(dbConfig = {}, aiConfig = {}) {
        this.dbService = new DBService(dbConfig.url);
        this.aiService = new AIService(aiConfig.baseURL, aiConfig.apiKey);
    }

    async initialize(email, password) {
        await this.dbService.authenticate(email, password);
    }

    async generateAndStore(collectionName, configOverride, brandIds, categoryIds) {
        const config = configOverride || collectionConfigs[collectionName];
        if (!config) {
            throw new Error(`Collection ${collectionName} not found in configuration.`);
        }

        // Check for foreign keys and ensure referenced data exists
        if (config.foreignKeys && config.foreignKeys.length > 0) {
            for (const fk of config.foreignKeys) {
                const referencedCollection = fk.relatedCollection;
                const referencedData = await this.dbService.getFullList(referencedCollection);
                console.log(`Referenced data for collection ${referencedCollection}:`, referencedData); // Debug log
                if (!referencedData || referencedData.length === 0) {
                    throw new Error(`Referenced collection ${referencedCollection} has no data.`);
                }
            }
        }

        const data = await this.aiService.generateData(config);

        // Map foreign keys
        const mappedData = data.map(record => {
            if (record.category) {
                record.category = categoryIds[Math.floor(Math.random() * categoryIds.length)];
            }
            if (record.brand) {
                record.brand = brandIds[Math.floor(Math.random() * brandIds.length)];
            }
            return record;
        });

        const result = await this.dbService.createRecords(collectionName, mappedData);
        return result;
    }
}

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

        // Fetch and store IDs for referenced collections
        const brandIds = await fetchCollectionIds(generator.dbService, 'brands');
        const categoryIds = await fetchCollectionIds(generator.dbService, 'categories');

        // Separate collections by foreign keys
        const collectionsWithoutForeignKeys = [];
        const collectionsWithForeignKeys = [];

        Object.entries(collectionConfigs).forEach(([collectionName, config]) => {
            if (config.foreignKeys && config.foreignKeys.length > 0) {
                collectionsWithForeignKeys.push({ name: collectionName, config, brandIds, categoryIds });
            } else {
                collectionsWithoutForeignKeys.push(collectionName);
            }
        });

        // Generate and store data for collections without foreign keys first
        for (const collectionName of collectionsWithoutForeignKeys) {
            const result = await generator.generateAndStore(collectionName);
            console.log(`${collectionConfigs[collectionName].name} generation result:`, JSON.stringify(result, null, 2));
        }

        // Generate and store data for collections with foreign keys
        for (const { name, config, brandIds, categoryIds } of collectionsWithForeignKeys) {
            const result = await generator.generateAndStore(name, config, brandIds, categoryIds);
            console.log(`${collectionConfigs[name].name} generation result:`, JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('Error in data generation:', error);
    }
}

async function fetchCollectionIds(dbService, collectionName) {
    const records = await dbService.getFullList(collectionName);
    console.log(`Fetched records for collection ${collectionName}:`, records); // Debug log
    return records.map(record => record.id);
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

