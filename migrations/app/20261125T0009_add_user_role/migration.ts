#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/16deee1c4b2b95c47c8b1b236e563463e1c41ebfd1f7e8581c5933cbdbeedcc8/contract';
import startContract from '../../snapshots/16deee1c4b2b95c47c8b1b236e563463e1c41ebfd1f7e8581c5933cbdbeedcc8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/85dc89d20fb8aadbc3d9a5d0add0db79eb5e29c30d9205792eb965090e770473/contract';
import endContract from '../../snapshots/85dc89d20fb8aadbc3d9a5d0add0db79eb5e29c30d9205792eb965090e770473/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('role', 'text', {
          notNull: true,
          default: lit('USER'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'User',
        constraint: 'User_role_check_12f57f64',
        expression: sql`"role" IN ('USER', 'SYSTEM')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
