// Database layer — SQLite with better-sqlite3 (synchronous)
// ==============================================================================
// db.js — SQLite Database Layer with Full ACID Transaction Support
// Uses better-sqlite3 (synchronous, zero-config, no server needed)
//
// ACID PROPERTIES:
//   Atomicity   — db.transaction() — all statements commit or all rollback
//   Consistency — FOREIGN KEYS ON, CHECK constraints, UNIQUE, NOT NULL
//   Isolation   — SQLite serializes writes; WAL mode for concurrent reads
//   Durability  — synchronous=FULL ensures data survives crashes
// ==============================================================================
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'insaniyat_ghar.sqlite');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        // ACID: Enable foreign keys (SQLite requires explicit opt-in)
        db.pragma('foreign_keys = ON');
        // ACID Durability: synchronous=FULL flushes to disk on every commit
        db.pragma('synchronous = FULL');
        // ACID Isolation: WAL mode allows concurrent reads with isolated writes
        db.pragma('journal_mode = WAL');
    }
    return db;
}

/**
 * Execute a single SQL statement (no results).
 */
function run(sql, params = []) {
    return getDb().prepare(sql).run(params);
}

/**
 * Execute a SELECT and return all rows.
 */
function all(sql, params = []) {
    return getDb().prepare(sql).all(params);
}

/**
 * Execute a SELECT and return the first row.
 */
function get(sql, params = []) {
    return getDb().prepare(sql).get(params);
}

/**
 * Execute multiple statements inside a single ACID transaction.
 *
 * ACID GUARANTEE: The callback runs atomically — if any statement
 * throws, SQLite automatically rolls back ALL changes in the callback.
 *
 * Usage:
 *   const result = transaction(() => {
 *       run('INSERT INTO donations ...', [...]);   // Step 1
 *       run('UPDATE campaigns ...', [...]);         // Step 2
 *       run('INSERT INTO audit_logs ...', [...]);   // Step 3
 *       // If Step 2 throws → Step 1 is also rolled back (Atomicity)
 *   });
 */
function transaction(callback) {
    const txn = getDb().transaction(callback);
    return txn();
}

/**
 * Execute raw SQL (for multi-statement schema scripts).
 */
function exec(sql) {
    return getDb().exec(sql);
}

module.exports = { run, all, get, transaction, exec, getDb };
