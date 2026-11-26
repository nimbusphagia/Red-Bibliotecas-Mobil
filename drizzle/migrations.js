import journal from './meta/_journal.json';
import m0000 from './0000_create_tables.sql';
import m0001 from './0001_seed_reference_data.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001
    }
  }
  