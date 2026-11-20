#!/usr/bin/env -S node
import { pathToFileURL } from 'url';
import type { Contract as End } from '../../snapshots/ea5b649ad95aa221948a56f7950eb923ffbfd2c0b2c3e85989de0d4f5e6827ec/contract.js';
import endContract from '../../snapshots/ea5b649ad95aa221948a56f7950eb923ffbfd2c0b2c3e85989de0d4f5e6827ec/contract.json'
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Account',
        columns: [
          col('balance', 'int8', {
            notNull: true,
            default: lit('0'),
            codecRef: { codecId: 'pg/int8@1' },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('BRL'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('version', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'LedgerEntry',
        columns: [
          col('accountId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('amount', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('direction', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('transferId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'LedgerEntry_direction_check_e2bfd96c',
            sql`"direction" IN ('DEBIT', 'CREDIT')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Transfer',
        columns: [
          col('amount', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idempotencyKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Transfer_status_check_0ccec7c0',
            sql`"status" IN ('COMPLETED', 'FAILED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Transfer',
        constraint: 'Transfer_idempotencyKey_key',
        columns: ['idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Account',
        index: 'Account_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LedgerEntry',
        index: 'LedgerEntry_accountId_createdAt_idx_843b5d93',
        columns: ['accountId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LedgerEntry',
        index: 'LedgerEntry_accountId_idx_cbfb3085',
        columns: ['accountId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'LedgerEntry',
        index: 'LedgerEntry_transferId_idx_2ecab561',
        columns: ['transferId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Account',
        foreignKey: {
          name: 'Account_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LedgerEntry',
        foreignKey: {
          name: 'LedgerEntry_accountId_fkey',
          columns: ['accountId'],
          references: { schema: 'public', table: 'Account', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'LedgerEntry',
        foreignKey: {
          name: 'LedgerEntry_transferId_fkey',
          columns: ['transferId'],
          references: { schema: 'public', table: 'Transfer', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(pathToFileURL(__filename).href, M);
