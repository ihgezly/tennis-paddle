import * as migration_20260904_055427 from './20260904_055427';
import * as migration_20260913_032445_add_category_parent from './20260913_032445_add_category_parent';

export const migrations = [
  {
    up: migration_20260904_055427.up,
    down: migration_20260904_055427.down,
    name: '20260904_055427',
  },
  {
    up: migration_20260913_032445_add_category_parent.up,
    down: migration_20260913_032445_add_category_parent.down,
    name: '20260913_032445_add_category_parent',
  },
];