// db.js

import pg from "pg";
import 'dotenv/config';

const { Pool } = pg;


pg.types.setTypeParser(1114, (stringValue) => stringValue.substring(0, 10));

const revision = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export { revision };
