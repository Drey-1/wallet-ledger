#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/16deee1c4b2b95c47c8b1b236e563463e1c41ebfd1f7e8581c5933cbdbeedcc8/contract';
import endContract from '../../snapshots/16deee1c4b2b95c47c8b1b236e563463e1c41ebfd1f7e8581c5933cbdbeedcc8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ea5b649ad95aa221948a56f7950eb923ffbfd2c0b2c3e85989de0d4f5e6827ec/contract';
import startContract from '../../snapshots/ea5b649ad95aa221948a56f7950eb923ffbfd2c0b2c3e85989de0d4f5e6827ec/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'Transfer',
        constraint: 'Transfer_idempotencyKey_key',
      }),
      this.dropColumn({ schema: 'public', table: 'Account', column: 'currency' }),
      this.dropColumn({ schema: 'public', table: 'Account', column: 'version' }),
      this.addColumn({
        schema: 'public',
        table: 'Account',
        column: col('isSystem', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'Transfer',
        column: 'payloadHash',
        type: 'text',
        temporaryDefault: sql`''`,
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'Transfer',
        column: 'userId',
        type: 'text',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Account',
        constraint: 'balance_non_negative_f0211d06',
        expression: sql`"isSystem" = true OR balance >=0`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'LedgerEntry',
        constraint: 'ledger_entry_amount_positive_2612d8b9',
        expression: sql`amount > 0`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Transfer',
        constraint: 'transfer_amount_positive_2612d8b9',
        expression: sql`amount > 0`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'Transfer',
        constraint: 'Transfer_userId_idempotencyKey_key',
        columns: ['userId', 'idempotencyKey'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transfer',
        index: 'Transfer_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transfer',
        foreignKey: {
          name: 'Transfer_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
