# AI-Powered Database Seeder

A tool that uses AI to generate realistic sample data for your database while maintaining referential integrity and data consistency across collections.

## 🌟 Features

- 🤖 AI-powered data generation using OpenAI/Ollama
- 🔄 Automatic handling of foreign key relationships
- 📚 Maintains context between collections
- ✅ Type validation and data consistency checks
- 🔧 Configurable collection schemas
- 📦 Built-in PocketBase integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- PocketBase server running locally or remotely
- OpenAI API key or Ollama running locally

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/MohammedInTheCloud/ai-database-seeder.git
cd ai-database-seeder
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_EMAIL=admin@admin.com
POCKETBASE_PASSWORD=your_password
OPENAI_API_KEY=your_key_if_using_openai
```

## 📁 Project Structure

```
src/
├── services/
│   ├── aiService.js      # AI integration service
│   ├── dbService.js      # Database operations
│   └── dataGenerator.js  # Main data generation logic
├── collections.js        # Collection configurations
└── index.js             # Entry point
```

## 🔧 Configuration

### Collection Configuration

Navigate to the PocketBase UI, click on API(Preview), and proceed to the View section. Scroll to the bottom of the page to find the 200 response. It should resemble the following format:

{
  "id": "RECORD_ID",
  "collectionId": "746u4bsq0w6ert5",
  "collectionName": "brands",
  "created": "2022-01-01 01:00:00.123Z",
  "updated": "2022-01-01 23:59:59.456Z",
  "brand_name": "test",
  "is_active": true
}
Using the structure above we will use LLM to transform it into the following format:

brands: {
    name: 'brands',
    fields: [
        { field: 'brand_name', type: "string" },
        { field: 'is_active', type: "boolean" }
    ],
    prompt: `Generate sample data for a brand database. Include fields: brand_name (name of the brand) and is_active (boolean status) for ${DEFAULT_SAMPLE_SIZE} brands.`,
    sampleSize: DEFAULT_SAMPLE_SIZE
},

You will find the prompt in prompt.md. Once you have the formatted configuration, integrate it into the collectionConfigs array within the collections.js file.
Define your collections in `collections.js`:

```javascript
export const collectionConfigs = {
    brands: {
        name: 'brands',
        fields: [
            { field: 'brand_name', type: "string" },
            { field: 'is_active', type: "boolean" }
        ],
        prompt: 'Generate sample data for a brand database...',
        sampleSize: 5
    },
    // ... more collections
};
```

### Field Types

- `string`: Text data
- `numeric`: Numbers
- `boolean`: True/false values
- `foreignKey`: References to other collections
- `null`: Empty/null values

### Foreign Key Configuration

```javascript
{
    field: 'category',
    type: "foreignKey",
    relatedCollection: 'categories'
}
```

## 🎯 Usage

### Basic Usage

```javascript
import { DataGenerator } from './services/dataGenerator.js';

async function main() {
    const generator = new DataGenerator();
    const result = await generator.generateAndStoreData();
    console.log('Generation complete:', result);
}

main().catch(console.error);
```

### Run the Seeder

```bash
node src/index.js
```

## 🔍 How It Works

1. **Collection Sorting**: Collections are automatically sorted based on dependencies (foreign keys) to ensure proper data generation order.

2. **Context Maintenance**: The system maintains conversation history with the AI, allowing it to generate consistent and contextually relevant data.

3. **Data Generation Flow**:
   ```mermaid
   graph TD
       A[Sort Collections] --> B[Generate Independent Collections]
       B --> C[Generate Dependent Collections]
       C --> D[Validate Data]
       D --> E[Store in Database]
   ```

4. **Data Validation**: Each field is validated according to its type before being stored in the database.

## 📝 API Reference

### DataGenerator Class

```javascript
class DataGenerator {
    constructor()
    async generateAndStoreData()
    sortCollectionsByDependency()
    validateFields(data, fields)
}
```

### AIService Class

```javascript
class AIService {
    constructor(baseURL, apiKey)
    async generateData(config)
    addToHistory(role, content)
    clearHistory()
}
```

### DBService Class

```javascript
class DBService {
    constructor(url)
    async authenticate(email, password)
    async createRecords(collectionName, records)
    async getFullList(collectionName, options)
}
```

## ⚙️ Advanced Configuration

### Custom AI Prompts

Customize AI prompts in your collection configuration:

```javascript
{
    prompt: `Generate sample data for ${collectionName}.
    Requirements:
    - Must be realistic data
    - Follow industry standards
    - Include variations in ${specificField}
    `
}
```

### Error Handling

The system provides detailed error reporting:

```javascript
{
    success: false,
    error: 'Detailed error message',
    results: [],
    errors: [
        {
            record: {},
            error: 'Validation failed'
        }
    ]
}
```

