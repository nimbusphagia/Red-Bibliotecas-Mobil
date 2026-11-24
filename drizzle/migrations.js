// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_create_tables.sql';
import m0001 from './0001_seed_reference_data.sql';
import m0002 from './0002_stock_line_loan_link.sql';
import m0003 from './0003_shelf_name_key.sql';
import m0004 from './0004_label_to_copy.sql';
import m0005 from './0005_stock_recovery.sql';
import m0006 from './0006_loan_line_discarded.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006
    }
  }
  