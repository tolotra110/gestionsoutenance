// Fabrique de modèles CRUD pour les tables simples du MCD.
// Les noms de colonnes viennent uniquement des constantes ci-dessous (jamais de la requête),
// donc pas d'injection SQL possible ; les valeurs passent toujours par des paramètres $n.
const pool = require("../Config/database");

const createCrudModel = ({ table, idColumn, fields, orderBy, scopeColumn, selectExpr = {}, defaults = {} }) => {
    const colonnes = [idColumn, ...fields]
        .map((c) => (selectExpr[c] ? `${selectExpr[c]} AS ${c}` : c))
        .join(", ");

    const valeurs = (data, scope) =>
        fields.map((f) => (f === scopeColumn ? scope : data[f] ?? defaults[f] ?? null));

    const list = async (scope) => {
        const where = scopeColumn ? `WHERE ${scopeColumn} = $1` : "";
        const result = await pool.query(
            `SELECT ${colonnes} FROM ${table} ${where} ORDER BY ${orderBy}`,
            scopeColumn ? [scope] : []
        );
        return result.rows;
    };

    const create = async (data, scope) => {
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
        const result = await pool.query(
            `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING ${colonnes}`,
            valeurs(data, scope)
        );
        return result.rows[0];
    };

    const update = async (id, data, scope) => {
        const modifiables = fields.filter((f) => f !== scopeColumn);
        const set = modifiables.map((f, i) => `${f} = $${i + 1}`).join(", ");
        const params = modifiables.map((f) => data[f] ?? defaults[f] ?? null);
        params.push(id);
        let sql = `UPDATE ${table} SET ${set} WHERE ${idColumn} = $${params.length}`;
        if (scopeColumn) {
            params.push(scope);
            sql += ` AND ${scopeColumn} = $${params.length}`;
        }
        const result = await pool.query(`${sql} RETURNING ${colonnes}`, params);
        return result.rows[0];
    };

    const remove = async (id, scope) => {
        const params = [id];
        let sql = `DELETE FROM ${table} WHERE ${idColumn} = $1`;
        if (scopeColumn) {
            params.push(scope);
            sql += ` AND ${scopeColumn} = $2`;
        }
        const result = await pool.query(`${sql} RETURNING ${idColumn}`, params);
        return result.rows[0];
    };

    return { list, create, update, remove };
};

module.exports = createCrudModel;
