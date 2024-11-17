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

```
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

#### generateData Method
Generates data using the AI model based on the provided configuration.

Parameters:
- `config`: Collection configuration object

Returns:
- Array of generated data objects

#### extractAndValidateJSON Method
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
  async createRecords(collectionName, records)
}
```

#### Constructor Parameters
- `url`: PocketBase server URL

#### authenticate Method
Handles database authentication.

Parameters:
- `email`: Admin email
- `password`: Admin password

#### createRecords Method
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
class DataGenerator {
  constructor(dbConfig = {}, aiConfig = {})
  async initialize(email, password)
  async generateAndStore(collectionKey)
}
```

#### Constructor Parameters
- `dbConfig`: Database configuration object
- `aiConfig`: AI service configuration object

#### initialize Method
Sets up the database connection.

Parameters:
- `email`: Admin email
- `password`: Admin password

#### generateAndStore Method
Generates and stores data for a specific collection.

Parameters:
- `collectionKey`: Key from collectionConfigs

Returns:
```javascript
{
  success: boolean,
  resultsCount: number,
  errorCount: number,
  errors: Array | null
}
```

## Usage Guide

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
    fields: ['name', 'price', 'category'],
    prompt: 'Generate sample product data...',
    sampleSize: 5
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

The documentation explains every aspect of the code and provides examples for common use cases. Let me know if you need clarification on any part or would like additional examples!