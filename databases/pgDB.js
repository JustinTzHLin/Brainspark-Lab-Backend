import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import pg from "pg";
const { Pool } = pg;

const PG_URI = process.env.PG_URI;

// create a new pool here using the connection string above
const pool = new Pool({
  connectionString: PG_URI
});

// Export object that contains query property, a function that returns the invocation of pool.query() after logging the query
export default {
  query: (text, params, callback) => {
    console.log("executed query", text);
    return pool.query(text, params, callback);
  }
};
