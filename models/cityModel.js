const db = require('../config/db');
const City = {
    async getAllCities() {
        try {
            const results = await db.query('SELECT * FROM cities');
            return results;
        } catch (err) {
            throw err;
        }
    },
    async getCityById(id) {
        try {
            const results = await db.query('SELECT * FROM cities WHERE id = ?', [id]);
            return results[0];
        } catch (err) {
            throw err;
        }
    },
    async createCity(cityData) {
        try {
            const { name, description, img } = cityData;
            await db.query('INSERT INTO cities (name, description, img) VALUES (?, ?, ?)', [name, description, img]);
        } catch (err) {
            throw err;
        }
    },
    async updateCity(id, cityData) {
        try {
            const { name, description, img } = cityData;
            await db.query('UPDATE cities SET name = ?, description = ?, img = ? WHERE id = ?', [name, description, img, id]);
        } catch (err) {
            throw err;
        }
    },
    async deleteCity(id) {
        try {
            await db.query('DELETE FROM cities WHERE id = ?', [id]);
        } catch (err) {
            throw err;
        }
    }
};

module.exports = City;