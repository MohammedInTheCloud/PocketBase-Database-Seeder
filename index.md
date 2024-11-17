# Data Generator Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
  - [Configuration](#configuration)
  - [AI Service](#ai-service)
  - [Database Service](#database-service)
  - [Data Generator](#data-generator)
- [Usage Guide](#usage-guide)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

The Data Generator is a flexible and modular system designed to generate sample data using AI and store it in a PocketBase database. It supports multiple collection types and can be easily extended for different data structures.

## Architecture

The system follows a modular architecture with four main components:
1. Collection Configurations
2. AI Service
3. Database Service
4. Main Data Generator

```plaintext
src/
├── config/
│   └── collections.js
├── services/
│   ├── aiService.js
│   └── dbService.js
└── index.js
```

## Components

### Configuration

Location: `src/config/collections.js`

```javascript
export const collectionConfigs = {
  languages: {
    name: 'languages',
    fields: ['code', 'name'],
    prompt: '...',
    sampleSize: 5
  }
}
```

Configuration properties:
- `name`: Collection name in PocketBase
- `fields`: Required fields for the collection
- `prompt`: AI prompt for data generation
- `sampleSize`: Number of records to generate
- `foreignKeys`: List of foreign key configurations (optional)

### AI Service

Location: `src/services/aiService.js`

The AIService class handles all interactions with the AI model (Ollama in this case).

Key methods:
```javascript
class AIService {
  constructor(baseURL, apiKey)
  async generateData(config)
  extractAndValidateJSON(jsonString, config)
}
```

#### Constructor Parameters
- `baseURL`: AI service endpoint URL
- `apiKey`: Authentication key for the AI service

#### `generateData` Method
Generates data using the AI model based on the provided configuration.

Parameters:
- `config`: Collection configuration object

Returns:
- Array of generated data objects

#### `extractAndValidateJSON` Method
Validates and processes the AI response.

Parameters:
- `jsonString`: Raw JSON string from AI
- `config`: Collection configuration for validation

Returns:
- Validated array of data objects

### Database Service

Location: `src/services/dbService.js`

The DBService class manages all database operations.

Key methods:
```javascript
class DBService {
  constructor(url)
  async authenticate(email, password)
  async getFullList(collectionName)
  async createRecords(collectionName, records)
}
```

#### Constructor Parameters
- `url`: PocketBase server URL

#### `authenticate` Method
Handles database authentication.

Parameters:
- `email`: Admin email
- `password`: Admin password

#### `getFullList` Method
Fetches all records from a specified collection.

Parameters:
- `collectionName`: Target collection name

Returns:
- Array of records

#### `createRecords` Method
Creates multiple records in the specified collection.

Parameters:
- `collectionName`: Target collection name
- `records`: Array of records to create

Returns:
```javascript
{
  results: Array, // Successfully created records
  errors: Array   // Failed records with error messages
}
```

### Data Generator

Location: `src/index.js`

The main class that orchestrates the entire process.

```javascript
import { DataGenerator } from './dataGenerator.js';
import { collectionConfigs } from './config/collections.js';

async function main() {
    try {
        const generator = new DataGenerator(
            { url: 'http://127.0.0.1:8090' },
            {
                baseURL: 'http://localhost:11434/v1/',
                apiKey: 'ollama'
            }
        );

        await generator.initialize('admin@example.com', 'password');

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
```

#### Constructor Parameters
- `dbConfig`: Database configuration object
- `aiConfig`: AI service configuration object

#### `initialize` Method
Sets up the database connection.

Parameters:
- `email`: Admin email
- `password`: Admin password

#### `generateAndStore` Method
Generates and stores data for a specific collection.

Parameters:
- `collectionKey`: Key from `collectionConfigs`
- `config`: Collection configuration object (optional)
- `brandIds`: Array of brand IDs (optional)
- `categoryIds`: Array of category IDs (optional)

Returns:
```javascript
{
  success: boolean,
  resultsCount: number,
  errorCount: number,
  errors: Array | null
}
```

### Fetching and Mapping IDs

The `main` function fetches the IDs of the records in the `brands` and `categories` collections before generating the product data. The `fetchCollectionIds` function fetches the records from the specified collection and returns an array of their IDs.

The `generateAndStore` method now accepts `brandIds` and `categoryIds` as parameters. When generating the product data, it maps the `category` and `brand` fields to random IDs from the `categoryIds` and `brandIds` arrays, respectively.

### Usage Guide

### Basic Usage

```javascript
// Initialize the generator
const generator = new DataGenerator(
  { url: 'http://127.0.0.1:8090' },
  {
    baseURL: 'http://localhost:11434/v1/',
    apiKey: 'ollama'
  }
);

// Authenticate
await generator.initialize('admin@example.com', 'password');

// Generate and store data
const result = await generator.generateAndStore('languages');
```

### Adding a New Collection

1. Add configuration to `collectionConfigs`:
```javascript
export const collectionConfigs = {
  // ... existing configs ...
  products: {
    name: 'products',
    fields: ['name', 'price', 'category', 'brand'],
    prompt: 'Generate sample product data...',
    sampleSize: 5,
    foreignKeys: [
      { field: 'category', relatedCollection: 'categories' },
      { field: 'brand', relatedCollection: 'brands' }
    ]
  }
}
```

2. Use the new collection:
```javascript
await generator.generateAndStore('products');
```

## Error Handling

The system implements comprehensive error handling at multiple levels:

1. **AI Service Level**
   - Invalid AI responses
   - JSON parsing errors
   - Missing required fields

2. **Database Level**
   - Authentication failures
   - Record creation errors
   - Connection issues

3. **Generator Level**
   - Invalid collection configurations
   - Overall process failures

Each error includes detailed information about the failure point and relevant data.

## Examples

### Generate Language Data

```javascript
const generator = new DataGenerator();
await generator.initialize('admin@example.com', 'password');

const result = await generator.generateAndStore('languages');
console.log(result);
// Output:
// {
//   success: true,
//   resultsCount: 5,
//   errorCount: 0,
//   errors: null
// }
```

### Generate Product Data with Foreign Keys

```javascript
const generator = new DataGenerator();
await generator.initialize('admin@example.com', 'password');

const result = await generator.generateAndStore('products');
console.log(result);

// Output:
// {
//   success: true,
//   resultsCount: 5,
//   errorCount: 0,
//   errors: null
// }
```

### Generate Currency Data with Error
### Generate Currency Data with Error Handling

```javascript
try {
  const generator = new DataGenerator();
  await generator.initialize('admin@example.com', 'password');

  const result = await generator.generateAndStore('currencies');

  if (result.errors) {
    console.log('Some records failed:', result.errors);
  } else {
    console.log(`Successfully created ${result.resultsCount} records`);
  }
} catch (error) {
  console.error('Failed to generate currencies:', error.message);
}
```

### Custom Collection Configuration

```javascript
// Add to collectionConfigs
categories: {
  name: 'categories',
  fields: ['name', 'slug', 'parent_id', 'is_active'],
  prompt: 'Generate sample category data with name, URL-friendly slug, optional parent_id, and is_active status for 5 categories.',
  sampleSize: 5
}

// Use the new configuration
const result = await generator.generateAndStore('categories');
```

### Handling Foreign Keys

When defining collections that have foreign keys, the `collectionConfigs` object can include a `foreignKeys` property. This property is an array of objects, each specifying a field that references another collection and the related collection's name.

```javascript
// Add to collectionConfigs
products: {
  name: 'products',
  fields: ['name', 'price', 'category', 'brand'],
  prompt: 'Generate sample product data with name, price, category, and brand for 5 products.',
  sampleSize: 5,
  foreignKeys: [
    { field: 'category', relatedCollection: 'categories' },
    { field: 'brand', relatedCollection: 'brands' }
  ]
}
```

#### Fetching and Mapping IDs

Before generating data for collections with foreign keys, the system fetches all records from the referenced collections and retrieves their IDs. These IDs are then used to map the foreign key fields in the generated records.

```javascript
async function fetchCollectionIds(dbService, collectionName) {
    const records = await dbService.getFullList(collectionName);
    return records.map(record => record.id);
}
```

#### Main Workflow

The main workflow in `src/index.js` is as follows:

1. **Initialize the Generator**: Establishes a connection to the PocketBase and AI services.
2. **Fetch IDs for Referenced Collections**: Retrieves IDs for collections referenced by foreign keys.
3. **Separate Collections by Foreign Keys**: Divides collections into those with and without foreign keys.
4. **Generate and Store Data**:
   - First, data for collections without foreign keys is generated and stored.
   - Then, data for collections with foreign keys is generated, mapping the foreign key fields to randomly selected IDs from the fetched lists.

### Additional Configuration for Foreign Key Handling

In the `generateAndStore` method, the system checks if the `collectionConfig` includes `foreignKeys`. If it does, the method generates records and maps the foreign key fields to the provided IDs.

```javascript
class DataGenerator {
    // ... other methods ...

    async generateAndStore(collectionKey, config = null, brandIds = [], categoryIds = []) {
        const collectionConfig = config || collectionConfigs[collectionKey];

        if (!collectionConfig) {
            return { success: false, resultsCount: 0, errorCount: 0, errors: ['Invalid collection configuration'] };
        }

        const aiResponse = await this.aiService.generateData(collectionConfig);
        let recordsToCreate = aiResponse.data;

        if (collectionConfig.foreignKeys) {
            for (const foreignKey of collectionConfig.foreignKeys) {
                const relatedIds = foreignKey.field === 'category' ? categoryIds : brandIds;
                recordsToCreate = recordsToCreate.map(record => ({
                    ...record,
                    [foreignKey.field]: relatedIds[Math.floor(Math.random() * relatedIds.length)]
                }));
            }
        }

        const dbResponse = await this.dbService.createRecords(collectionConfig.name, recordsToCreate);
        return {
            success: dbResponse.errors.length === 0,
            resultsCount: dbResponse.results.length,
            errorCount: dbResponse.errors.length,
            errors: dbResponse.errors.length > 0 ? dbResponse.errors : null
        };
    }
}
```

## Conclusion

The Data Generator is a versatile tool for populating PocketBase databases with sample data generated by AI. It supports configurations for multiple collections, including those with foreign key relationships, ensuring that the generated data is consistent and properly linked.

For more detailed use cases and configurations, refer to the [Usage Guide](#usage-guide) and [Examples](#examples) sections.

---

With the updated `index.md` file, you can commit your changes to your Git repository. Here are the steps to do that:

1. **Stage the changes**:
   ```sh
   git add src/index.md
   ```

2. **Commit the changes**:
   ```sh
   git commit -m "Update documentation to include foreign key handling and example usage"
   ```

3. **Push the changes to the remote repository** (if necessary):
   ```sh
   git push origin main  # or the appropriate branch name
   ```
