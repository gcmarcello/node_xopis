import { type Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    await knex('users').del();

    await knex('users').insert([
        { id: 1, name: 'Arthur Dent', email: 'arthur.dent@hitchhikers.com' },
        { id: 2, name: 'Ford Prefect', email: 'ford.prefect@hitchhikers.com' },
        { id: 3, name: 'Zaphod Beeblebrox', email: 'zaphod.beeblebrox@hitchhikers.com' },
        { id: 4, name: 'Trillian Astra', email: 'trillian.astra@hitchhikers.com' },
    ]);
};
