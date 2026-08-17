import { getPool } from "@nexus/db";

export async function queryUsers(userId: string, query: string) {

    const db = getPool()
    const result = await db.query(
        `
            SELECT id, name, email
            FROM users
            WHERE
            is_disabled = false
            AND id <> $1
            AND (
                LOWER(name) LIKE LOWER($2)
                OR LOWER(email) LIKE LOWER($2)
            )
            ORDER BY name
            LIMIT 10
        `,
        [userId, `%${query}%`],
    );

    return result;
}
