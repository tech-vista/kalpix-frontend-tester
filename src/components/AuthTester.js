import React, { useState } from "react";
import "./AuthTester.css";
import GoogleLoginButton from "./GoogleLoginButton";
import {
	registerEmail,
	verifyRegistrationOTP,
	checkUsernameAvailable,
	loginWithEmail,
	verifyLoginOTP,
	loginWithGoogle,
	loginAsGuest,
	linkEmail,
	verifyEmailLink,
	getUserProfile,
	updateUserProfile,
	refreshSession,
} from "../utils/authClient";

/**
 * Authentication Tester Component
 * Comprehensive UI for testing all authentication endpoints
 */
function AuthTester({ client, session, setSession, onAuthSuccess }) {
	// Tab state
	const [activeTab, setActiveTab] = useState("guest");

	// Guest login state
	const [guestForm, setGuestForm] = useState({
		deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
	});

	// Email registration state
	const [registerForm, setRegisterForm] = useState({
		username: "",
		email: "",
		password: "",
		otp: "",
	});
	const [registrationStep, setRegistrationStep] = useState("form"); // 'form' | 'otp'
	const [usernameAvailable, setUsernameAvailable] = useState(null);

	// Email login state
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
		otp: "",
	});
	const [loginStep, setLoginStep] = useState("form"); // 'form' | 'otp'

	// Google login state
	const [googleForm, setGoogleForm] = useState({
		idToken: "",
	});

	// Account linking state
	const [linkForm, setLinkForm] = useState({
		email: "",
		password: "",
		otp: "",
	});
	const [linkStep, setLinkStep] = useState("form"); // 'form' | 'otp'

	// Profile state
	const [profile, setProfile] = useState(null);
	const [profileForm, setProfileForm] = useState({
		displayName: "",
		bio: "",
		country: "",
	});

	// Status messages
	const [status, setStatus] = useState({ type: "", message: "" });
	const [loading, setLoading] = useState(false);

	// Helper to show status
	const showStatus = (type, message) => {
		setStatus({ type, message });
		setTimeout(() => setStatus({ type: "", message: "" }), 5000);
	};

	// ========================================
	// GUEST LOGIN
	// ========================================
	const handleGuestLogin = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await loginAsGuest(client, guestForm.deviceId);
			setSession(result.session);
			showStatus("success", `Logged in as ${result.data.username}`);
			if (onAuthSuccess) onAuthSuccess(result.session);
		} catch (error) {
			console.error("Guest login error:", error);
			showStatus("error", error.message || "Failed to login as guest");
		} finally {
			setLoading(false);
		}
	};

	// ========================================
	// EMAIL REGISTRATION
	// ========================================
	const handleCheckUsername = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		if (!registerForm.username) return;
		try {
			const result = await checkUsernameAvailable(
				client,
				registerForm.username
			);
			setUsernameAvailable(result.available);
			showStatus(result.available ? "success" : "error", result.message);
		} catch (error) {
			console.error("Check username error:", error);
			showStatus("error", error.message || "Failed to check username");
		}
	};

	const handleRegisterEmail = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await registerEmail(
				client,
				registerForm.username,
				registerForm.email,
				registerForm.password
			);
			setRegistrationStep("otp");
			showStatus("success", result.message);
		} catch (error) {
			console.error("Register email error:", error);
			showStatus("error", error.message || "Failed to register");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyRegistration = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await verifyRegistrationOTP(
				client,
				registerForm.email,
				registerForm.otp
			);
			setSession(result.session);
			setRegistrationStep("form");
			showStatus("success", `Account created! Welcome ${result.data.username}`);
			if (onAuthSuccess) onAuthSuccess(result.session);
		} catch (error) {
			console.error("Verify registration error:", error);
			showStatus("error", error.message || "Failed to verify OTP");
		} finally {
			setLoading(false);
		}
	};

	// ========================================
	// EMAIL LOGIN
	// ========================================
	const handleLoginEmail = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await loginWithEmail(
				client,
				loginForm.email,
				loginForm.password
			);
			setLoginStep("otp");
			showStatus("success", result.message);
		} catch (error) {
			console.error("Login email error:", error);
			showStatus("error", error.message || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyLogin = async () => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await verifyLoginOTP(
				client,
				loginForm.email,
				loginForm.otp
			);
			setSession(result.session);
			setLoginStep("form");
			showStatus("success", `Welcome back ${result.data.username}!`);
			if (onAuthSuccess) onAuthSuccess(result.session);
		} catch (error) {
			console.error("Verify login error:", error);
			showStatus("error", error.message || "Failed to verify OTP");
		} finally {
			setLoading(false);
		}
	};

	// ========================================
	// GOOGLE LOGIN
	// ========================================
	const handleGoogleLogin = async (idToken) => {
		if (!client) {
			showStatus("error", "Client not initialized. Please refresh the page.");
			return;
		}
		setLoading(true);
		try {
			const result = await loginWithGoogle(client, idToken);
			setSession(result.session);
			showStatus("success", `Logged in as ${result.session.username}`);
			if (onAuthSuccess) onAuthSuccess(result.session);
		} catch (error) {
			console.error("Google login error:", error);
			showStatus("error", error.message || "Failed to login with Google");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleError = (error) => {
		showStatus("error", `Google login failed: ${error.message}`);
	};

	// ========================================
	// ACCOUNT LINKING
	// ========================================
	const handleLinkEmail = async () => {
		setLoading(true);
		try {
			const result = await linkEmail(
				client,
				session,
				linkForm.email,
				linkForm.password
			);
			setLinkStep("otp");
			showStatus("success", result.message);
		} catch (error) {
			showStatus("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyLink = async () => {
		setLoading(true);
		try {
			const result = await verifyEmailLink(client, session, linkForm.otp);
			setLinkStep("form");
			showStatus("success", result.message);
			// Refresh profile to show updated security status
			await handleGetProfile();
		} catch (error) {
			showStatus("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	// ========================================
	// PROFILE MANAGEMENT
	// ========================================
	const handleGetProfile = async () => {
		setLoading(true);
		try {
			const result = await getUserProfile(client, session);
			setProfile(result);
			setProfileForm({
				displayName: result.displayName || "",
				bio: result.bio || "",
				country: result.country || "",
			});
			showStatus("success", "Profile loaded");
		} catch (error) {
			showStatus("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateProfile = async () => {
		setLoading(true);
		try {
			const result = await updateUserProfile(
				client,
				session,
				profileForm.displayName,
				profileForm.bio,
				profileForm.country
			);
			showStatus("success", result.message);
			await handleGetProfile();
		} catch (error) {
			showStatus("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleRefreshSession = async () => {
		setLoading(true);
		try {
			const result = await refreshSession(client, session);
			setSession(result.session);
			showStatus("success", "Session refreshed");
		} catch (error) {
			showStatus("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	// If already authenticated, show profile management
	if (session) {
		return (
			<div className="auth-tester">
				<h2>🔐 Authenticated User Dashboard</h2>

				{/* Status Message */}
				{status.message && (
					<div className={`status-message ${status.type}`}>
						{status.message}
					</div>
				)}

				{/* Session Info */}
				<div className="card">
					<h3>📱 Current Session</h3>
					<div className="info-grid">
						<div>
							<strong>User ID:</strong> {session.user_id}
						</div>
						<div>
							<strong>Username:</strong> {session.username}
						</div>
					</div>
					<button
						onClick={handleRefreshSession}
						disabled={loading}
						className="btn-primary"
					>
						🔄 Refresh Session
					</button>
				</div>

				{/* Profile Section */}
				<div className="card">
					<h3>👤 User Profile</h3>
					{!profile ? (
						<button
							onClick={handleGetProfile}
							disabled={loading}
							className="btn-primary"
						>
							📥 Load Profile
						</button>
					) : (
						<div>
							<div className="profile-display">
								<div className="info-grid">
									<div>
										<strong>Username:</strong> {profile.username}
									</div>
									<div>
										<strong>Email:</strong> {profile.email || "N/A"}
									</div>
									<div>
										<strong>Account Type:</strong> {profile.accountType}
									</div>
									<div>
										<strong>Is Secure:</strong>{" "}
										{profile.isSecure ? "✅ Yes" : "❌ No"}
									</div>
									<div>
										<strong>Is Verified:</strong>{" "}
										{profile.isVerified ? "✅ Yes" : "❌ No"}
									</div>
									<div>
										<strong>Is Online:</strong>{" "}
										{profile.isOnline ? "🟢 Online" : "⚫ Offline"}
									</div>
									<div>
										<strong>Followers:</strong> {profile.followersCount}
									</div>
									<div>
										<strong>Following:</strong> {profile.followingCount}
									</div>
									<div>
										<strong>Friends:</strong> {profile.friendsCount}
									</div>
									<div>
										<strong>Bio:</strong> {profile.bio || "N/A"}
									</div>
									<div>
										<strong>Country:</strong> {profile.country || "N/A"}
									</div>
								</div>
							</div>

							<h4>Update Profile</h4>
							<div className="form-group">
								<label>Display Name:</label>
								<input
									type="text"
									value={profileForm.displayName}
									onChange={(e) =>
										setProfileForm({
											...profileForm,
											displayName: e.target.value,
										})
									}
									placeholder="Your display name"
								/>
							</div>
							<div className="form-group">
								<label>Bio:</label>
								<textarea
									value={profileForm.bio}
									onChange={(e) =>
										setProfileForm({ ...profileForm, bio: e.target.value })
									}
									placeholder="Tell us about yourself"
									rows="3"
								/>
							</div>
							<div className="form-group">
								<label>Country:</label>
								<input
									type="text"
									value={profileForm.country}
									onChange={(e) =>
										setProfileForm({ ...profileForm, country: e.target.value })
									}
									placeholder="US"
									maxLength="2"
								/>
							</div>
							<button
								onClick={handleUpdateProfile}
								disabled={loading}
								className="btn-primary"
							>
								💾 Update Profile
							</button>
						</div>
					)}
				</div>

				{/* Account Linking (only for guest accounts) */}
				{profile && !profile.isSecure && (
					<div className="card warning">
						<h3>⚠️ Unsecured Account</h3>
						<p>
							Your account is not secure. Link an email to prevent data loss!
						</p>

						{linkStep === "form" ? (
							<div>
								<div className="form-group">
									<label>Email:</label>
									<input
										type="email"
										value={linkForm.email}
										onChange={(e) =>
											setLinkForm({ ...linkForm, email: e.target.value })
										}
										placeholder="your@email.com"
									/>
								</div>
								<div className="form-group">
									<label>Password:</label>
									<input
										type="password"
										value={linkForm.password}
										onChange={(e) =>
											setLinkForm({ ...linkForm, password: e.target.value })
										}
										placeholder="Secure password"
									/>
								</div>
								<button
									onClick={handleLinkEmail}
									disabled={loading}
									className="btn-success"
								>
									🔗 Link Email
								</button>
							</div>
						) : (
							<div>
								<p>✅ OTP sent to {linkForm.email}</p>
								<div className="form-group">
									<label>Enter OTP:</label>
									<input
										type="text"
										value={linkForm.otp}
										onChange={(e) =>
											setLinkForm({ ...linkForm, otp: e.target.value })
										}
										placeholder="123456"
										maxLength="6"
									/>
								</div>
								<button
									onClick={handleVerifyLink}
									disabled={loading}
									className="btn-success"
								>
									✅ Verify OTP
								</button>
								<button
									onClick={() => setLinkStep("form")}
									className="btn-secondary"
								>
									← Back
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

	// Not authenticated - show login/register options
	return (
		<div className="auth-tester">
			<h2>🔐 Authentication Tester</h2>

			{/* Status Message */}
			{status.message && (
				<div className={`status-message ${status.type}`}>{status.message}</div>
			)}

			{/* Tabs */}
			<div className="tabs">
				<button
					className={activeTab === "guest" ? "active" : ""}
					onClick={() => setActiveTab("guest")}
				>
					👤 Guest Login
				</button>
				<button
					className={activeTab === "register" ? "active" : ""}
					onClick={() => setActiveTab("register")}
				>
					📝 Register
				</button>
				<button
					className={activeTab === "login" ? "active" : ""}
					onClick={() => setActiveTab("login")}
				>
					🔑 Email Login
				</button>
				<button
					className={activeTab === "google" ? "active" : ""}
					onClick={() => setActiveTab("google")}
				>
					🔵 Google
				</button>
			</div>

			{/* Tab Content */}
			<div className="tab-content">
				{/* Guest Login Tab */}
				{activeTab === "guest" && (
					<div className="card">
						<h3>👤 Login as Guest</h3>
						<p>
							Quick login with device ID. Your data will be lost if you logout
							without linking an email.
						</p>
						<div className="form-group">
							<label>Device ID:</label>
							<input
								type="text"
								value={guestForm.deviceId}
								onChange={(e) =>
									setGuestForm({ ...guestForm, deviceId: e.target.value })
								}
								placeholder="device_abc123"
							/>
						</div>
						<button
							onClick={handleGuestLogin}
							disabled={loading}
							className="btn-primary"
						>
							🚀 Login as Guest
						</button>
					</div>
				)}

				{/* Email Registration Tab */}
				{activeTab === "register" && (
					<div className="card">
						<h3>📝 Register with Email</h3>
						{registrationStep === "form" ? (
							<div>
								<div className="form-group">
									<label>Username:</label>
									<input
										type="text"
										value={registerForm.username}
										onChange={(e) =>
											setRegisterForm({
												...registerForm,
												username: e.target.value,
											})
										}
										onBlur={handleCheckUsername}
										placeholder="cool-username"
									/>
									{usernameAvailable !== null && (
										<small
											className={
												usernameAvailable ? "text-success" : "text-error"
											}
										>
											{usernameAvailable ? "✅ Available" : "❌ Taken"}
										</small>
									)}
								</div>
								<div className="form-group">
									<label>Email:</label>
									<input
										type="email"
										value={registerForm.email}
										onChange={(e) =>
											setRegisterForm({
												...registerForm,
												email: e.target.value,
											})
										}
										placeholder="your@email.com"
									/>
								</div>
								<div className="form-group">
									<label>Password:</label>
									<input
										type="password"
										value={registerForm.password}
										onChange={(e) =>
											setRegisterForm({
												...registerForm,
												password: e.target.value,
											})
										}
										placeholder="Min 8 chars, 1 letter, 1 number"
									/>
								</div>
								<button
									onClick={handleRegisterEmail}
									disabled={loading}
									className="btn-success"
								>
									📧 Send OTP
								</button>
							</div>
						) : (
							<div>
								<p>✅ OTP sent to {registerForm.email}</p>
								<div className="form-group">
									<label>Enter OTP:</label>
									<input
										type="text"
										value={registerForm.otp}
										onChange={(e) =>
											setRegisterForm({ ...registerForm, otp: e.target.value })
										}
										placeholder="123456"
										maxLength="6"
									/>
								</div>
								<button
									onClick={handleVerifyRegistration}
									disabled={loading}
									className="btn-success"
								>
									✅ Verify & Register
								</button>
								<button
									onClick={() => setRegistrationStep("form")}
									className="btn-secondary"
								>
									← Back
								</button>
							</div>
						)}
					</div>
				)}

				{/* Email Login Tab */}
				{activeTab === "login" && (
					<div className="card">
						<h3>🔑 Login with Email</h3>
						{loginStep === "form" ? (
							<div>
								<div className="form-group">
									<label>Email:</label>
									<input
										type="email"
										value={loginForm.email}
										onChange={(e) =>
											setLoginForm({ ...loginForm, email: e.target.value })
										}
										placeholder="your@email.com"
									/>
								</div>
								<div className="form-group">
									<label>Password:</label>
									<input
										type="password"
										value={loginForm.password}
										onChange={(e) =>
											setLoginForm({ ...loginForm, password: e.target.value })
										}
										placeholder="Your password"
									/>
								</div>
								<button
									onClick={handleLoginEmail}
									disabled={loading}
									className="btn-primary"
								>
									📧 Send OTP
								</button>
							</div>
						) : (
							<div>
								<p>✅ OTP sent to {loginForm.email}</p>
								<div className="form-group">
									<label>Enter OTP:</label>
									<input
										type="text"
										value={loginForm.otp}
										onChange={(e) =>
											setLoginForm({ ...loginForm, otp: e.target.value })
										}
										placeholder="123456"
										maxLength="6"
									/>
								</div>
								<button
									onClick={handleVerifyLogin}
									disabled={loading}
									className="btn-primary"
								>
									✅ Verify & Login
								</button>
								<button
									onClick={() => setLoginStep("form")}
									className="btn-secondary"
								>
									← Back
								</button>
							</div>
						)}
					</div>
				)}

				{/* Google Login Tab */}
				{activeTab === "google" && (
					<div className="card">
						<h3>🔵 Login with Google</h3>
						<p>Click the button below to sign in with your Google account</p>
						<GoogleLoginButton
							clientId="422626557878-tes3pkdrj04pb6n63nioktleb4n6bff8.apps.googleusercontent.com"
							onSuccess={handleGoogleLogin}
							onError={handleGoogleError}
						/>
						<div
							style={{
								marginTop: "20px",
								padding: "15px",
								background: "#f8f9fa",
								borderRadius: "6px",
							}}
						>
							<strong>ℹ️ How it works:</strong>
							<ol
								style={{
									marginTop: "10px",
									paddingLeft: "20px",
									fontSize: "14px",
								}}
							>
								<li>Click the "Sign in with Google" button above</li>
								<li>A Google popup will appear</li>
								<li>Select your Google account</li>
								<li>You'll be logged in automatically!</li>
							</ol>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default AuthTester;
