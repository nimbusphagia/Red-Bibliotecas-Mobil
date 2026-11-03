import journal from "./meta/_journal.json";
import m0000 from "./0000_perfect_the_leader.sql";
import m0001 from "./0001_seed_reference_data.sql";

export default {
  journal,
  migrations: {
    m0000,
    m0001,
  },
};

