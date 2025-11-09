/**
 * Authentication Client Utilities
 * Helper functions for authentication RPC calls
 */

/**
 * Call an unauthenticated RPC using HTTP key
 * Uses direct HTTP call with http_key query parameter
 * @param {object} client - Nakama client
 * @param {string} rpcId - RPC function ID
 * @param {object} payload - Request payload
 * @returns {Promise<object>} RPC response
 */
async function callUnauthenticatedRpc(client, rpcId, payload) {
	console.log("🔍 Calling unauthenticated RPC:", rpcId);
	console.log("🔍 Payload:", payload);

	// Determine protocol based on client SSL setting
	const useSSL = client.ssl || client.useSSL || client._useSSL || false;
	const protocol = useSSL ? "https" : "http";

	// Build URL - only include port if it's not empty
	const portPart = client.port ? `:${client.port}` : "";

	// Get HTTP key from client config (added in nakama.js)
	const httpKey = client.httpKey || "defaulthttpkey";

	// Add http_key as query parameter and unwrap flag
	const url = `${protocol}://${
		client.host
	}${portPart}/v2/rpc/${rpcId}?http_key=${encodeURIComponent(httpKey)}&unwrap=`;

	console.log("🔍 URL:", url);
	console.log("🔍 HTTP Key:", httpKey);

	// Make HTTP request
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error("❌ HTTP Error:", response.status, errorText);

		// Try to parse error as JSON
		try {
			const errorData = JSON.parse(errorText);
			throw new Error(
				errorData.message || errorData.error || `HTTP ${response.status}`
			);
		} catch (e) {
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}
	}

	const data = await response.json();
	console.log("✅ RPC Response:", data);

	// With unwrap flag, response is returned directly (not wrapped in payload)
	return {
		id: rpcId,
		payload: data,
	};
}

/**
 * Parse RPC response
 * @param {object} response - RPC response
 * @returns {object} Parsed data
 */
function parseRpcResponse(response) {
	let data = response.payload || {};

	// If payload is a string, parse it
	if (typeof data === "string") {
		try {
			data = JSON.parse(data);
		} catch (e) {
			console.error("Failed to parse RPC response:", e);
			console.error("Raw response:", response);
			throw new Error("Invalid response from server");
		}
	}

	// Check for error in response
	if (!data.success && data.error) {
		const errorMessage = data.error.message || data.error.error || data.error;
		console.error("RPC Error:", errorMessage);
		throw new Error(errorMessage);
	}

	return data;
}

// ========================================
// GUEST LOGIN
// ========================================

/**
 * Login as guest with device ID
 * @param {object} client - Nakama client
 * @param {string} deviceId - Device ID
 * @returns {object} Session and user data
 */
export async function loginAsGuest(client, deviceId) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!deviceId) {
			throw new Error("Device ID is required");
		}

		// Use our custom RPC that generates themed usernames
		const response = await callUnauthenticatedRpc(client, "auth/device_login", {
			device_id: deviceId,
			username: "", // Let backend generate themed username
		});

		const data = parseRpcResponse(response);
		console.log("✅ Parsed data:", data);

		// The backend returns session data directly
		const sessionData = data.data || data;

		// Create a session object from the response
		// Backend SessionInfo has: userId, username, sessionToken, expiresAt, refreshToken, refreshExpiresAt
		const session = {
			token:
				sessionData.sessionToken ||
				sessionData.token ||
				sessionData.session_token,
			refresh_token:
				sessionData.refreshToken || sessionData.refresh_token || "",
			user_id: sessionData.userId || sessionData.user_id,
			username: sessionData.username,
			created_at: Date.now(),
			expires_at:
				sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000, // 1 hour default
			refresh_expires_at:
				sessionData.refreshExpiresAt ||
				sessionData.refresh_expires_at ||
				Date.now() + 604800000, // 7 days default
		};

		return {
			session,
			data: sessionData,
		};
	} catch (error) {
		console.error("❌ Guest login failed:", error);
		console.error("❌ Error message:", error.message);
		console.error("❌ Error stack:", error.stack);
		if (error.response) {
			console.error("❌ Error response:", error.response);
		}
		throw new Error(error.message || "Failed to login as guest");
	}
}

// ========================================
// EMAIL REGISTRATION
// ========================================

/**
 * Check if username is available
 * @param {object} client - Nakama client
 * @param {string} username - Username to check
 * @returns {object} Availability result
 */
export async function checkUsernameAvailable(client, username) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!username) {
			throw new Error("Username is required");
		}

		const response = await callUnauthenticatedRpc(
			client,
			"auth/check_username_available",
			{
				username,
			}
		);
		const data = parseRpcResponse(response);
		return data.data || data;
	} catch (error) {
		console.error("Check username failed:", error);
		throw new Error(error.message || "Failed to check username availability");
	}
}

/**
 * Register with email
 * @param {object} client - Nakama client
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} Registration result
 */
export async function registerEmail(client, username, email, password) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!username || !email || !password) {
			throw new Error("Username, email, and password are required");
		}

		const response = await callUnauthenticatedRpc(
			client,
			"auth/register_email",
			{
				username,
				email,
				password,
			}
		);
		const data = parseRpcResponse(response);
		return data.data || data;
	} catch (error) {
		console.error("Register email failed:", error);
		throw new Error(error.message || "Failed to register");
	}
}

/**
 * Verify registration OTP
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @param {string} otp - OTP code
 * @returns {object} Session and user data
 */
export async function verifyRegistrationOTP(client, email, otp) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email || !otp) {
			throw new Error("Email and OTP are required");
		}

		const response = await callUnauthenticatedRpc(
			client,
			"auth/verify_registration_otp",
			{
				email,
				otp,
			}
		);
		const data = parseRpcResponse(response);

		// The backend returns session data directly
		const sessionData = data.data || data;

		// Create a session object from the response
		// Backend SessionInfo has: userId, username, sessionToken, expiresAt, refreshToken, refreshExpiresAt
		const session = {
			token:
				sessionData.sessionToken ||
				sessionData.token ||
				sessionData.session_token,
			refresh_token:
				sessionData.refreshToken || sessionData.refresh_token || "",
			user_id: sessionData.userId || sessionData.user_id,
			username: sessionData.username,
			created_at: Date.now(),
			expires_at:
				sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000, // 1 hour default
			refresh_expires_at:
				sessionData.refreshExpiresAt ||
				sessionData.refresh_expires_at ||
				Date.now() + 604800000, // 7 days default
		};

		return {
			session,
			data: sessionData,
		};
	} catch (error) {
		console.error("Verify registration OTP failed:", error);
		throw new Error(error.message || "Failed to verify OTP");
	}
}

/**
 * Skip verification and create unverified account (deferred verification)
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @returns {object} Session and user data
 */
export async function skipVerification(client, email) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email) {
			throw new Error("Email is required");
		}

		const response = await callUnauthenticatedRpc(
			client,
			"auth/skip_verification",
			{
				email,
			}
		);
		const data = parseRpcResponse(response);

		// The backend returns session data directly
		const sessionData = data.data || data;

		// Create a session object from the response
		const session = {
			token:
				sessionData.sessionToken ||
				sessionData.token ||
				sessionData.session_token,
			refresh_token:
				sessionData.refreshToken || sessionData.refresh_token || "",
			user_id: sessionData.userId || sessionData.user_id,
			username: sessionData.username,
			created_at: Date.now(),
			expires_at:
				sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000,
			refresh_expires_at:
				sessionData.refreshExpiresAt ||
				sessionData.refresh_expires_at ||
				Date.now() + 604800000, // 7 days default
		};

		return {
			session,
			data: sessionData,
		};
	} catch (error) {
		console.error("Skip verification failed:", error);
		throw new Error(error.message || "Failed to skip verification");
	}
}

/**
 * Resend OTP for registration
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @returns {object} Result
 */
export async function resendOTP(client, email) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email) {
			throw new Error("Email is required");
		}

		const response = await callUnauthenticatedRpc(client, "auth/resend_otp", {
			email,
		});
		const data = parseRpcResponse(response);
		return data.data || data;
	} catch (error) {
		console.error("Resend OTP failed:", error);
		throw new Error(error.message || "Failed to resend OTP");
	}
}

// ========================================
// EMAIL LOGIN
// ========================================

/**
 * Login with email (send OTP)
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} Result
 */
export async function loginWithEmail(client, email, password) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email || !password) {
			throw new Error("Email and password are required");
		}

		// Direct login with email and password (no OTP required)
		const response = await callUnauthenticatedRpc(client, "auth/login_email", {
			email,
			password,
		});
		const data = parseRpcResponse(response);

		// The backend returns session data directly
		const sessionData = data.data || data;

		// Create a session object from the response
		// Backend SessionInfo has: userId, username, sessionToken, expiresAt, refreshToken, refreshExpiresAt
		const session = {
			token:
				sessionData.sessionToken ||
				sessionData.token ||
				sessionData.session_token,
			refresh_token:
				sessionData.refreshToken || sessionData.refresh_token || "",
			user_id: sessionData.userId || sessionData.user_id,
			username: sessionData.username,
			created_at: Date.now(),
			expires_at:
				sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000, // 1 hour default
			refresh_expires_at:
				sessionData.refreshExpiresAt ||
				sessionData.refresh_expires_at ||
				Date.now() + 604800000, // 7 days default
		};

		return {
			session,
			data: sessionData,
		};
	} catch (error) {
		console.error("Login with email failed:", error);
		throw new Error(error.message || "Failed to login with email");
	}
}

/**
 * Send OTP for email verification (legacy - for OTP-based flows if needed)
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} Response data
 */
export async function sendLoginOTP(client, email, password) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email || !password) {
			throw new Error("Email and password are required");
		}

		const response = await callUnauthenticatedRpc(client, "auth/send_otp", {
			email,
			password,
		});
		const data = parseRpcResponse(response);
		return data.data || data;
	} catch (error) {
		console.error("Send OTP failed:", error);
		throw new Error(error.message || "Failed to send OTP");
	}
}

/**
 * Verify login OTP (legacy - for OTP-based flows if needed)
 * @param {object} client - Nakama client
 * @param {string} email - Email
 * @param {string} otp - OTP code
 * @returns {object} Session and user data
 */
export async function verifyLoginOTP(client, email, otp) {
	try {
		if (!client) {
			throw new Error("Nakama client is not initialized");
		}
		if (!email || !otp) {
			throw new Error("Email and OTP are required");
		}

		const response = await callUnauthenticatedRpc(client, "auth/verify_otp", {
			email,
			otp,
		});
		const data = parseRpcResponse(response);

		// The backend returns session data directly
		const sessionData = data.data || data;

		// Create a session object from the response
		// Backend SessionInfo has: userId, username, sessionToken, expiresAt, refreshToken, refreshExpiresAt
		const session = {
			token:
				sessionData.sessionToken ||
				sessionData.token ||
				sessionData.session_token,
			refresh_token:
				sessionData.refreshToken || sessionData.refresh_token || "",
			user_id: sessionData.userId || sessionData.user_id,
			username: sessionData.username,
			created_at: Date.now(),
			expires_at:
				sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000, // 1 hour default
			refresh_expires_at:
				sessionData.refreshExpiresAt ||
				sessionData.refresh_expires_at ||
				Date.now() + 604800000, // 7 days default
		};

		return {
			session,
			data: sessionData,
		};
	} catch (error) {
		console.error("Verify login OTP failed:", error);
		throw new Error(error.message || "Failed to verify OTP");
	}
}

// ========================================
// GOOGLE LOGIN
// ========================================

/**
 * Login with Google OAuth
 * @param {object} client - Nakama client
 * @param {string} idToken - Google ID token
 * @returns {object} Session and user data
 */
export async function loginWithGoogle(client, idToken) {
	// Use our custom RPC that generates themed usernames
	// Note: This endpoint now uses Firebase Authentication for Google login
	// The idToken should be a Firebase ID token (from Google Sign-In via Firebase)
	const response = await callUnauthenticatedRpc(client, "auth/google_login", {
		id_token: idToken,
	});
	const data = parseRpcResponse(response);

	// The backend returns session data directly
	const sessionData = data.data || data;

	// Create a session object from the response
	// Backend SessionInfo has: userId, username, sessionToken, expiresAt, refreshToken, refreshExpiresAt
	const session = {
		token:
			sessionData.sessionToken ||
			sessionData.token ||
			sessionData.session_token,
		refresh_token: sessionData.refreshToken || sessionData.refresh_token || "",
		user_id: sessionData.userId || sessionData.user_id,
		username: sessionData.username,
		created_at: Date.now(),
		expires_at:
			sessionData.expiresAt || sessionData.expires_at || Date.now() + 3600000, // 1 hour default
		refresh_expires_at:
			sessionData.refreshExpiresAt ||
			sessionData.refresh_expires_at ||
			Date.now() + 604800000, // 7 days default
	};

	return {
		session,
		data: sessionData,
	};
}

// ========================================
// ACCOUNT LINKING
// ========================================

/**
 * Link email to guest account
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} Result
 */
export async function linkEmail(client, session, email, password) {
	const response = await client.rpc(session, "auth/link_email", {
		email,
		password,
	});
	const data = parseRpcResponse(response);
	return data.data || data;
}

/**
 * Verify email link OTP
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @param {string} otp - OTP code
 * @returns {object} Result
 */
export async function verifyEmailLink(client, session, otp) {
	const response = await client.rpc(session, "auth/verify_email_link", {
		otp,
	});
	const data = parseRpcResponse(response);
	return data.data || data;
}

// ========================================
// PROFILE MANAGEMENT
// ========================================

/**
 * Get user profile
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @returns {object} User profile
 */
export async function getUserProfile(client, session) {
	const response = await client.rpc(session, "auth/get_profile", {});
	const data = parseRpcResponse(response);
	return data.data || data;
}

/**
 * Update user profile
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @param {string} displayName - Display name
 * @param {string} bio - Bio
 * @param {string} country - Country code
 * @returns {object} Result
 */
export async function updateUserProfile(
	client,
	session,
	displayName,
	bio,
	country
) {
	const response = await client.rpc(session, "auth/update_profile", {
		display_name: displayName,
		bio,
		country,
	});
	const data = parseRpcResponse(response);
	return data.data || data;
}

/**
 * Refresh session
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @returns {object} New session
 */
export async function refreshSession(client, session) {
	const response = await client.rpc(session, "auth/refresh_session", {});
	const data = parseRpcResponse(response);

	// Return the current session (Nakama handles refresh automatically)
	return {
		session,
		data: data.data || data,
	};
}

// ========================================
// PRESENCE MANAGEMENT
// ========================================

/**
 * Get online status for user(s)
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @param {string|array} userIds - User ID or array of user IDs
 * @returns {object} Online status
 */
export async function getOnlineStatus(client, session, userIds) {
	const response = await client.rpc(session, "presence/get_online_status", {
		user_ids: Array.isArray(userIds) ? userIds : [userIds],
	});
	const data = parseRpcResponse(response);
	return data.data || data;
}

/**
 * Get online friends
 * @param {object} client - Nakama client
 * @param {object} session - Current session
 * @returns {object} Online friends list
 */
export async function getOnlineFriends(client, session) {
	const response = await client.rpc(session, "presence/get_online_friends", {});
	const data = parseRpcResponse(response);
	return data.data || data;
}
