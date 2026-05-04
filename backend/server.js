// ==============================================================================
// server.js — Insaniyat Ghar Backend Entry Point
// SQLite + Express — zero configuration, runs immediately
// ==============================================================================
const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./scripts/initDB');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) =>
    res.json({ status: 'ok', service: 'Insaniyat Ghar API', db: 'SQLite (ACID)', timestamp: new Date().toISOString() })
);

// API Routes
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

// Initialize SQLite DB then start server
try {
    initializeDatabase();
    console.log('✅ Database initialized');
} catch (err) {
    console.error('❌ Database init failed:', err.message);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`\n🏠 Insaniyat Ghar API Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   API Base:   http://localhost:${PORT}/api`);
    console.log(`   DB Engine:  SQLite (ACID — Atomicity, Consistency, Isolation, Durability)\n`);
});
