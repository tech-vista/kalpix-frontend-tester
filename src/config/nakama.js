/**
 * Nakama Server Configuration
 * Centralized configuration for Nakama client
 */

// Get configuration from environment variables or use defaults
const rawPort = process.env.REACT_APP_NAKAMA_PORT || "7350";
const useSSL = process.env.REACT_APP_NAKAMA_USE_SSL === "true" || false;

// For HTTPS on standard port (443), Nakama client expects empty string
// For HTTP on standard port (80), Nakama client expects empty string
// Otherwise, use the specified port
let port = rawPort;
if (useSSL && (rawPort === "443" || rawPort === "")) {
	port = ""; // Standard HTTPS port
} else if (!useSSL && (rawPort === "80" || rawPort === "")) {
	port = ""; // Standard HTTP port
}

const config = {
	host:
		process.env.REACT_APP_NAKAMA_HOST ||
		"kalpix-backend-production.up.railway.app",
	port: port,
	useSSL: useSSL,
	serverKey: process.env.REACT_APP_NAKAMA_SERVER_KEY || "defaultkey",
	httpKey: process.env.REACT_APP_NAKAMA_HTTP_KEY || "defaulthttpkey",
};

// Log configuration (only in development)
if (process.env.NODE_ENV === "development") {
	const displayPort = config.port || (config.useSSL ? "443" : "80");
	console.log("🔧 Nakama Configuration:", {
		host: config.host,
		port: config.port || `(default ${displayPort})`,
		useSSL: config.useSSL,
		serverKey: config.serverKey,
		url: `${config.useSSL ? "https" : "http"}://${config.host}${
			config.port ? ":" + config.port : ""
		}`,
	});
}

export default config;

/**
 * Get Nakama server URL for display purposes
 */
export function getNakamaUrl() {
	return `${config.useSSL ? "https" : "http"}://${config.host}${
		config.port ? ":" + config.port : ""
	}`;
}

/**
 * Check if using production server
 */
export function isProduction() {
	return config.host !== "localhost" && config.host !== "127.0.0.1";
}
