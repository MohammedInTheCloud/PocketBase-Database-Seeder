import { AIService } from './services/aiService.js';
import { DBService } from './services/dbService.js';
import { collectionConfigs } from './config/collections.js';


export class DataGenerator {
    constructor() {
        this.aiService = new AIService();
        this.dbService = new DBService();
        this.generatedData = new Map();
    }

    sortCollectionsByDependency() {
        const sorted = [];
        const visited = new Set();

        const hasForeignKeys = (config) => {
            return config.fields.some(field =>
                typeof field === 'object' && field.type === 'foreignKey'
            );
        };

        // Add collections without foreign keys first
        Object.values(collectionConfigs).forEach(config => {
            if (!hasForeignKeys(config)) {
                sorted.push(config);
                visited.add(config.name);
            }
        });

        // Add collections with foreign keys
        while (sorted.length < Object.keys(collectionConfigs).length) {
            Object.values(collectionConfigs).forEach(config => {
                if (visited.has(config.name)) return;

                const foreignKeyFields = config.fields.filter(field =>
                    typeof field === 'object' && field.type === 'foreignKey'
                );

                const allDependenciesMet = foreignKeyFields.every(field =>
                    visited.has(field.relatedCollection)
                );

                if (allDependenciesMet) {
                    sorted.push(config);
                    visited.add(config.name);
                }
            });
        }

        return sorted;
    }

    enhancePromptWithContext(config) {
        let enhancedPrompt = config.prompt;

        const foreignKeyFields = config.fields.filter(field =>
            typeof field === 'object' && field.type === 'foreignKey'
        );

        if (foreignKeyFields.length > 0) {
            foreignKeyFields.forEach(field => {
                const relatedData = this.generatedData.get(field.relatedCollection);
                if (relatedData) {
                    enhancedPrompt += `\n\nAvailable ${field.relatedCollection}:\n`;
                    enhancedPrompt += JSON.stringify(relatedData.map(item => ({
                        id: item.id,
                        name: item.name || item.brand_name
                    })), null, 2);
                }
            });
        }

        return enhancedPrompt;
    }

    validateFields(data, fields) {
        return data.map(item => {
            const validatedItem = {};
            fields.forEach(fieldConfig => {
                const fieldName = typeof fieldConfig === 'string' ?
                    fieldConfig :
                    fieldConfig.field;

                const fieldType = typeof fieldConfig === 'string' ?
                    'string' :
                    fieldConfig.type;

                let value = item[fieldName];

                switch (fieldType) {
                    case 'numeric':
                        value = Number(value);
                        if (isNaN(value)) throw new Error(`Invalid numeric value for field ${fieldName}`);
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            value = String(value).toLowerCase() === 'true';
                        }
                        break;
                    case 'foreignKey':
                        const relatedData = this.generatedData.get(fieldConfig.relatedCollection);
                        if (!relatedData || !relatedData.find(r => r.id === value)) {
                            const randomRelated = relatedData[Math.floor(Math.random() * relatedData.length)];
                            value = randomRelated.id;
                        }
                        break;
                    case 'null':
                        value = null;
                        break;
                }

                validatedItem[fieldName] = value;
            });
            return validatedItem;
        });
    }

    async generateAndStoreData() {
        try {
            await this.dbService.authenticate('m@m.com', '1234512345');

            const sortedCollections = this.sortCollectionsByDependency();
            console.log('Generation order:', sortedCollections.map(c => c.name));

            for (const config of sortedCollections) {
                console.log(`\nProcessing collection: ${config.name}`);

                const enhancedConfig = {
                    ...config,
                    prompt: this.enhancePromptWithContext(config)
                };

                const generatedData = await this.aiService.generateData(enhancedConfig);
                const validatedData = this.validateFields(generatedData, config.fields);

                const { results, errors } = await this.dbService.createRecords(config.name, validatedData);
                this.generatedData.set(config.name, results);

                console.log(`✓ Generated ${results.length} records for ${config.name}`);
                if (errors.length > 0) {
                    console.error(`× Errors:`, errors);
                }
            }

            return {
                success: true,
                data: Object.fromEntries(this.generatedData)
            };

        } catch (error) {
            console.error('Data generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Example usage
async function main() {
    const generator = new DataGenerator();
    const result = await generator.generateAndStoreData();
    console.log('Generation complete:', result);
}

// Run if this is the main module
    main().catch(console.error);
