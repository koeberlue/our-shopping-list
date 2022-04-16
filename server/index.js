/*
 * Our Shopping List Server
 */

require('dotenv').config();

const LISTEN_PORT  = process.env.LISTEN_PORT || 8080;

const {http} = require('./src/app');

// ============================================================================
// WEBSOCKET
// ============================================================================

require('./src/ws');

// ============================================================================
// ROUTES
// ============================================================================

require('./src/board/routes');
require('./src/list/routes');
require('./src/item/routes');

require('./src/healthcheck/routes');

// Error handling routes
require('./src/routes');

// ============================================================================
// START SERVER
// ============================================================================

const index = http.listen(LISTEN_PORT, () => {
  console.info(`OSL Server started on [${index.address().address}]:${index.address().port}`);
  console.info('Current environment:', process.env);
});
