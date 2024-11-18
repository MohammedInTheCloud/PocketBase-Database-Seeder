import PocketBase from 'pocketbase';

export class DBService {
    constructor(url = 'http://127.0.0.1:8090') {
        this.client = new PocketBase(url);
    }

    async authenticate(email, password) {
        try {
            const authData = await this.client.admins.authWithPassword(email, password);
            return authData;
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async createRecords(collectionName, records) {
        const results = [];
        const errors = [];

        for (const record of records) {
            try {
                const result = await this.client.collection(collectionName).create(record);
                results.push(result);
            } catch (error) {
                errors.push({ record, error: error.message });
            }
        }

        return { results, errors };
    }

    async getFullList(collectionName, options = {}) {
        try {
            const records = await this.client.collection(collectionName).getFullList(options);
            return records;
        } catch (error) {
            throw new Error(`Failed to fetch records from collection ${collectionName}: ${error.message}`);
        }
    }
}