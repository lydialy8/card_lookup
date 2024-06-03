var config = {};

// ------------ Authentication properties. ------------------------.
config.psql_conn_str =
  process.env.DATABASE_URL ||
  "postgres://cards_usr:P@ssw0rd@cards_lookup_db:5432/postgres";
config.port = 3001;

module.exports = config;
