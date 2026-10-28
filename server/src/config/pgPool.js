// Postgres (Neon) pool with the same surface the app uses from mysql2/promise:
// query(sql, params) -> [rows] / [{ insertId, affectedRows }], getConnection(), end().
// Translates `?` placeholders, `SET ?` objects and `IN (?)` arrays to $n parameters.
const { Pool, types } = require('pg');

// Match mysql2's dateStrings / number behaviour
types.setTypeParser(1082, (v) => v); // DATE -> 'YYYY-MM-DD'
types.setTypeParser(1114, (v) => v.slice(0, 19)); // TIMESTAMP -> 'YYYY-MM-DD HH:MM:SS'
types.setTypeParser(20, (v) => Number(v)); // BIGINT (COUNT(*)) -> number

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !Buffer.isBuffer(v);

const translate = (sql, params = []) => {
  const values = [];
  const add = (v) => { values.push(v); return `$${values.length}`; };

  // INSERT INTO t SET ?  ->  INSERT INTO t (a, b) VALUES ($1, $2)
  const insertSet = sql.match(/^\s*INSERT INTO (\w+) SET \?\s*$/i);
  if (insertSet) {
    const data = params[0] || {};
    const cols = Object.keys(data);
    const text = cols.length
      ? `INSERT INTO ${insertSet[1]} (${cols.join(', ')}) VALUES (${cols.map((c) => add(data[c])).join(', ')})`
      : `INSERT INTO ${insertSet[1]} DEFAULT VALUES`;
    return { text: `${text} RETURNING *`, values, isInsert: true };
  }

  let i = 0;
  let inString = false;
  let text = '';
  for (const ch of sql) {
    if (ch === "'") inString = !inString;
    if (ch !== '?' || inString) { text += ch; continue; }
    const p = params[i++];
    if (isPlainObject(p)) text += Object.entries(p).map(([k, v]) => `${k} = ${add(v)}`).join(', ');
    else if (Array.isArray(p)) text += p.length ? p.map(add).join(', ') : 'NULL';
    else text += add(p === undefined ? null : p);
  }
  const isInsert = /^\s*INSERT\s/i.test(text);
  if (isInsert && !/RETURNING/i.test(text)) text += ' RETURNING *';
  return { text, values, isInsert };
};

// Unique violations look like mysql2's ER_DUP_ENTRY to the rest of the app
const mapError = (err) => {
  if (err.code === '23505') {
    err.code = 'ER_DUP_ENTRY';
    err.sqlMessage = `${err.detail || ''} ${err.constraint || ''}`;
  }
  return err;
};

const run = async (client, sql, params) => {
  const { text, values, isInsert } = translate(sql, params);
  try {
    const res = await client.query(text, values);
    if (res.command === 'SELECT') return [res.rows, res.fields];
    return [{ insertId: isInsert ? res.rows[0]?.id : undefined, affectedRows: res.rowCount }];
  } catch (err) {
    throw mapError(err);
  }
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

module.exports = {
  dialect: 'postgres',
  query: (sql, params) => run(pool, sql, params),
  getConnection: async () => {
    const client = await pool.connect();
    return {
      query: (sql, params) => run(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release(),
    };
  },
  end: () => pool.end(),
};
