import { type Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    await knex('products').del();

    await knex('products').insert([
        { id: 1, name: "The Hitchhiker's Guide to the Galaxy", sku: 'HHGTTG', description: 'A book by Douglas Adams', price: 42.00, stock: 100 },
        { id: 2, name: 'Babel Fish', sku: 'BABELFISH', description: 'A small, yellow, leech-like creature that can translate languages', price: 15.00, stock: 200 },
        { id: 3, name: 'Towel', sku: 'TOWEL', description: 'A highly useful item for interstellar travel', price: 5.00, stock: 500 },
        { id: 4, name: 'Pan Galactic Gargle Blaster', sku: 'PGGB', description: 'The best drink in existence', price: 12.00, stock: 50 },
        { id: 5, name: 'Heart of Gold', sku: 'HEARTGOLD', description: 'A spaceship with an Infinite Improbability Drive', price: 1000000.00, stock: 1 },
        { id: 6, name: 'Marvin the Paranoid Android', sku: 'MARVIN', description: 'A depressed robot', price: 5000.00, stock: 10 },
        { id: 7, name: 'Vogon Poetry', sku: 'VOGONPOETRY', description: 'The third worst poetry in the universe', price: 0.50, stock: 1000 },
        { id: 8, name: "Slartibartfast's Fjords", sku: 'FJORDS', description: 'Beautifully designed coastlines', price: 2000.00, stock: 5 },
        { id: 9, name: 'Deep Thought', sku: 'DEEPTHOUGHT', description: 'A supercomputer that calculated the Answer to the Ultimate Question of Life, the Universe, and Everything', price: 750000.00, stock: 2 },
        { id: 10, name: 'Krikkit Wars Robot', sku: 'KRKKITROBOT', description: 'A robot from the planet Krikkit', price: 3000.00, stock: 20 }
    ]);
};
