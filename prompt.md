You are tasked with converting a JSON schema into a JavaScript object structure similar to the provided example. Your goal is to accurately map each field from the JSON schema to its corresponding type in the new JavaScript object format, and include any necessary relationships or constraints.

### Guidelines:
1. **Identify Fields**: Extract all fields present in the JSON schema.
2. **Determine Data Types**:
   - For string data types, use `"string"`.
   - For numeric values (integers, floats), use `"numeric"`.
   - For boolean values, use `"boolean"`.
   - For foreign keys to other collections, use `"foreignKey"` and specify the `relatedCollection` field.
   - Use `"null"` for fields that are optional or empty arrays.
3. **Foreign Keys**: Identify any fields that reference another collection and list them under `foreignKeys`.
4. **Prompt Text**: Generate a descriptive prompt text to instruct how sample data should be generated, including all necessary fields and types.

### Example Input:
```json
{
  "id": "RECORD_ID",
  "collectionId": "3f92hj34gumoou6",
  "collectionName": "products",
  "created": "2022-01-01 01:00:00.123Z",
  "updated": "2022-01-01 23:59:59.456Z",
  "name": "test",
  "description": "test",
  "base_price": 123,
  "category": "test",
  "brand": "test",
  "images": [
    "filename.jpg"
  ],
  "is_active": true
}
```

### Example Output:
```javascript
products: {
    name: 'products',
    fields: ['name', 'description', 'base_price', 'category', 'brand', 'images', 'is_active'],
    details: [
        { field: 'name', type: "string" },
        { field: 'description', type: "string" },
        { field: 'base_price', type: "numeric" },
        { field: 'category', type: "foreignKey", relatedCollection: 'categories' },
        { field: 'brand', type: "foreignKey", relatedCollection: 'brands' },
        { field: 'images', type: "null" },
        { field: 'is_active', type: "boolean" }
    ],
    foreignKeys: [
        { field: 'category', relatedCollection: 'categories' },
        { field: 'brand', relatedCollection: 'brands' }
    ],
    prompt: `Generate sample data for products. Include fields: name (string), description (string), base_price (numeric), category (category ID), brand (brand ID), images (empty array), and is_active (boolean) for ${DEFAULT_SAMPLE_SIZE} products.`,
    sampleSize: DEFAULT_SAMPLE_SIZE
}
```

### Steps:
1. **Identify Fields**:
   - From the JSON schema, extract all fields such as `name`, `description`, etc.

2. **Determine Data Types**:
   - For each field, determine its data type based on its content (e.g., string, numeric, boolean).
   - Mark any foreign keys with `"foreignKey"` and specify their related collection.

3. **List Foreign Keys**:
   - Collect all fields that are foreign keys into the `foreignKeys` array.

4. **Generate Prompt Text**:
   - Construct a clear prompt text instructing how to generate sample data, mentioning each field and its type.

5. **Create JavaScript Object Structure**:
   - Use the extracted information to create the final JavaScript object structure as shown in the example.

### Example Reasoning Steps (Before Conclusions):
- Identify that `name`, `description` are strings.
- Determine `base_price` is numeric, `is_active` is boolean.
- Recognize `category` and `brand` reference other collections.
- Use `"null"` for `images`.

### Conclusion:
```javascript
products: {
    name: 'products',
    fields: ['name', 'description', 'base_price', 'category', 'brand', 'images', 'is_active'],
    details: [
        { field: 'name', type: "string" },
        { field: 'description', type: "string" },
        { field: 'base_price', type: "numeric" },
        { field: 'category', type: "foreignKey", relatedCollection: 'categories' },
        { field: 'brand', type: "foreignKey", relatedCollection: 'brands' },
        { field: 'images', type: "null" },
        { field: 'is_active', type: "boolean" }
    ],
    foreignKeys: [
        { field: 'category', relatedCollection: 'categories' },
        { field: 'brand', relatedCollection: 'brands' }
    ],
    prompt: `Generate sample data for products. Include fields: name (string), description (string), base_price (numeric), category (category ID), brand (brand ID), images (empty array), and is_active (boolean) for ${DEFAULT_SAMPLE_SIZE} products.`,
    sampleSize: DEFAULT_SAMPLE_SIZE
}
```