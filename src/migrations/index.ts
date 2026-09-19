import * as migration_20260904_055427 from './20260904_055427';
import * as migration_20260913_032445_add_category_parent from './20260913_032445_add_category_parent';
import * as migration_20260917_105330_add_user_name from './20260917_105330_add_user_name';
import * as migration_20260917_110916 from './20260917_110916';

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
  {
    up: migration_20260917_105330_add_user_name.up,
    down: migration_20260917_105330_add_user_name.down,
    name: '20260917_105330_add_user_name',
  },
  {
    up: migration_20260917_110916.up,
    down: migration_20260917_110916.down,
    name: '20260917_110916'
  },
];
