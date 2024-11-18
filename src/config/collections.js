export const DEFAULT_SAMPLE_SIZE = 10; // You can change this value to whatever you need

export const collectionConfigs = {
    brands: {
        name: 'brands',
        fields: [{ field: 'brand_name', type: "string" }, { field: 'is_active', type: "boolean" }],
        prompt: `Generate sample data for a brand database. Include fields: brand_name (name of the brand) and is_active (boolean status) for ${DEFAULT_SAMPLE_SIZE} brands.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    categories: {
        name: 'categories',
        fields: [{ field: 'name', type: "string" }, { field: 'is_active', type: "boolean" }],
        prompt: `Generate sample data for a category database. Include fields: parent (choose category close to it), name (category name), and is_active (boolean status) for ${DEFAULT_SAMPLE_SIZE} categories.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    products: {
        name: 'products',
        fields: [
            { field: 'name', type: "string" },
            { field: 'description', type: "string" },
            { field: 'base_price', type: "numeric" },
            { field: 'category', type: "foreignKey", relatedCollection: 'categories' },
            { field: 'brand', type: "foreignKey", relatedCollection: 'brands' },
            { field: 'images', type: "null" },
            { field: 'is_active', type: "boolean" },
        ],
        foreignKeys: [
            { field: 'category', relatedCollection: 'categories' },
            { field: 'brand', relatedCollection: 'brands' }
        ],
        prompt: `Generate sample data for products. Include fields: name, description, base_price (numeric), category (category ID), brand (brand ID), images (empty), and is_active (boolean) for ${DEFAULT_SAMPLE_SIZE} products.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    currencies: {
        name: 'currencies',
        fields: ['currency_code', 'currency_name', 'is_active'],
        details: [
            { field: 'currency_code', type: "string" },
            { field: 'currency_name', type: "string" },
            { field: 'is_active', type: "boolean" }
        ],
        foreignKeys: [],
        prompt: `Generate sample data for currencies. Include fields: currency_code (string), currency_name (string), and is_active (boolean) for ${DEFAULT_SAMPLE_SIZE} currencies.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    languages: {
        name: 'languages',
        fields: ['code', 'name'],
        details: [
            { field: 'code', type: "string" },
            { field: 'name', type: "string" }
        ],
        foreignKeys: [],
        prompt: `Generate sample data for languages. Include fields: code (string) and name (string) for ${DEFAULT_SAMPLE_SIZE} languages.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    prices: {
        name: 'prices',
        fields: ['price', 'quantity', 'timestamp', 'is_available'],
        details: [
            { field: 'price', type: "numeric" },
            { field: 'quantity', type: "numeric" },
            { field: 'timestamp', type: "string" },  // Assuming timestamp is stored as a string
            { field: 'is_available', type: "boolean" }
        ],
        foreignKeys: [],
        prompt: `Generate sample data for prices. Include fields: price (numeric), quantity (numeric), timestamp (datetime string), is_available (boolean) for ${DEFAULT_SAMPLE_SIZE} prices.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    }
};