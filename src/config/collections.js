export const DEFAULT_SAMPLE_SIZE = 10; // You can change this value to whatever you need

export const collectionConfigs = {
    brands: {
        name: 'brands',
        fields: ['brand_name', 'is_active'],
        prompt: `Generate sample data for a brand database. Include fields: brand_name (name of the brand) and is_active (boolean status) for ${DEFAULT_SAMPLE_SIZE} brands.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    categories: {
        name: 'categories',
        fields: ['parent', 'name', 'is_active'],
        prompt: `Generate sample data for a category database. Include fields: parent (choose category close to it), name (category name), and is_active (boolean status) for ${DEFAULT_SAMPLE_SIZE} categories.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    },
    products: {
        name: 'products',
        fields: ['name', 'description', 'base_price', 'category', 'brand', 'images', 'is_active'],
        foreignKeys: [
            { field: 'category', relatedCollection: 'categories' },
            { field: 'brand', relatedCollection: 'brands' }
        ],
        prompt: `Generate sample data for products. Include fields: name, description, base_price (numeric), category (category ID), brand (brand ID), images (empty), and is_active (boolean) for ${DEFAULT_SAMPLE_SIZE} products.`,
        sampleSize: DEFAULT_SAMPLE_SIZE
    }
};