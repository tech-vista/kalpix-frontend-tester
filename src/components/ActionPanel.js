import React, { useState } from "react";
import { getCard } from "../utils/cardDatabase";
import { CardType } from "../utils/cardDatabase";

/**
 * Action Panel Component
 * Provides buttons for player actions (play card, draw, etc.)
 */
function ActionPanel({
	gameState,
	session,
	myUserId,
	selectedCard,
	onPlayCard,
	onDrawCard,
	onChooseSwapTarget,
	onPlayShield,
	onAutoPlay,
}) {
	const [chosenColor, setChosenColor] = useState(null);
	const [showColorPicker, setShowColorPicker] = useState(false);

	if (!gameState.isGameStarted || gameState.gameEnded) {
		return (
			<div className="section">
				<h2>🎮 Actions</h2>
				<div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
					{gameState.gameEnded ? "Game ended" : "Game not started"}
				</div>
			</div>
		);
	}

	// ✅ FIX: Use myUserId instead of session?.user_id
	const isMyTurn =
		Array.isArray(gameState.players) &&
		gameState.currentPlayer !== undefined &&
		gameState.players[gameState.currentPlayer]?.userId ===
			(myUserId || session?.user_id);

	console.log("🎮 ActionPanel - Turn check:", {
		currentPlayer: gameState.currentPlayer,
		currentPlayerUserId: gameState.players?.[gameState.currentPlayer]?.userId,
		myUserId: myUserId,
		sessionUserId: session?.user_id,
		isMyTurn,
		playersCount: gameState.players?.length,
		selectedCard,
	});

	// 🔧 FIX: Don't rely on playableCards for button state - let backend validate
	// Player can select and attempt to play any card, backend will reject if invalid
	const canPlayCard = isMyTurn && selectedCard !== null;

	// Check if selected card is a wild card that needs color choice
	const selectedCardData = getCard(selectedCard);
	const needsColorChoice =
		canPlayCard &&
		selectedCardData &&
		(selectedCardData.type === CardType.WILD ||
			selectedCardData.type === CardType.WILD_DRAW_FOUR ||
			selectedCardData.type === CardType.SHIELD ||
			selectedCardData.type === CardType.SKIP_BLAST);

	console.log("🎨 Color choice check:", {
		selectedCard,
		selectedCardData,
		cardType: selectedCardData?.type,
		canPlayCard,
		needsColorChoice,
		showColorPicker,
		CardTypeWILD: CardType.WILD,
		CardTypeWILD_DRAW_FOUR: CardType.WILD_DRAW_FOUR,
		CardTypeSHIELD: CardType.SHIELD,
		CardTypeSKIP_BLAST: CardType.SKIP_BLAST,
	});

	const handlePlayCard = () => {
		console.log("🎮 handlePlayCard called:", {
			needsColorChoice,
			chosenColor,
			selectedCard,
			willShowPicker: needsColorChoice && chosenColor === null,
		});

		if (needsColorChoice && chosenColor === null) {
			console.log("🎨 Showing color picker!");
			setShowColorPicker(true);
			return;
		}

		console.log("🎮 Playing card without color picker");
		onPlayCard(selectedCard, needsColorChoice ? chosenColor : null);
		setChosenColor(null);
		setShowColorPicker(false);
	};

	const handleColorChoice = (color) => {
		setChosenColor(color);
		setShowColorPicker(false);
		// Auto-play after color selection
		onPlayCard(selectedCard, color);
	};

	return (
		<div className="section">
			<h2>🎮 Actions</h2>

			{/* Turn Status */}
			<div
				style={{
					padding: "10px",
					backgroundColor: isMyTurn ? "#d4edda" : "#f8d7da",
					borderRadius: "6px",
					marginBottom: "15px",
					textAlign: "center",
					fontWeight: "bold",
					fontSize: "14px",
				}}
			>
				{isMyTurn ? "✅ YOUR TURN" : "⏳ Waiting for other player..."}
			</div>

			{/* Color Picker Modal */}
			{showColorPicker && (
				<div
					style={{
						marginBottom: "15px",
						padding: "15px",
						backgroundColor: "#fff3cd",
						borderRadius: "8px",
						border: "2px solid #ffc107",
					}}
				>
					<div
						style={{
							marginBottom: "10px",
							fontWeight: "bold",
							textAlign: "center",
						}}
					>
						Choose a color:
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "10px",
						}}
					>
						<button
							onClick={() => handleColorChoice(0)}
							style={{
								padding: "12px",
								backgroundColor: "#e74c3c",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							🔴 Red
						</button>
						<button
							onClick={() => handleColorChoice(1)}
							style={{
								padding: "12px",
								backgroundColor: "#3498db",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							🔵 Blue
						</button>
						<button
							onClick={() => handleColorChoice(2)}
							style={{
								padding: "12px",
								backgroundColor: "#2ecc71",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							🟢 Green
						</button>
						<button
							onClick={() => handleColorChoice(3)}
							style={{
								padding: "12px",
								backgroundColor: "#f39c12",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
						>
							🟡 Yellow
						</button>
					</div>
					<button
						onClick={() => setShowColorPicker(false)}
						style={{
							marginTop: "10px",
							width: "100%",
							padding: "8px",
							backgroundColor: "#6c757d",
							color: "white",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
						}}
					>
						Cancel
					</button>
				</div>
			)}

			{/* Main Actions */}
			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				{/* Play Card */}
				<button
					className="btn-success"
					onClick={handlePlayCard}
					disabled={!canPlayCard}
					style={{ width: "100%", padding: "12px", fontSize: "16px" }}
				>
					🃏 Play Card
					{selectedCard && ` (Selected)`}
					{needsColorChoice && !showColorPicker && " - Choose Color"}
				</button>

				{/* Draw Card */}
				<button
					className="btn-primary"
					onClick={onDrawCard}
					disabled={!isMyTurn}
					style={{ width: "100%", padding: "12px", fontSize: "16px" }}
				>
					📥 Draw Card
				</button>

				{/* Auto Play (for testing timer expiry) */}
				<button
					className="btn-warning"
					onClick={onAutoPlay}
					disabled={!isMyTurn}
					style={{ width: "100%", padding: "12px", fontSize: "14px" }}
				>
					⚡ Auto Play (Test)
				</button>
			</div>

			{/* Special Actions */}
			{gameState.shieldWindowActive && (
				<div style={{ marginTop: "15px" }}>
					<button
						className="btn-secondary"
						onClick={onPlayShield}
						disabled={!isMyTurn}
						style={{ width: "100%", padding: "12px", fontSize: "16px" }}
					>
						🛡️ Play Shield
					</button>
				</div>
			)}

			{/* Swap Target Selection */}
			{gameState.swapRequestActive && isMyTurn && (
				<div
					style={{
						marginTop: "15px",
						padding: "15px",
						backgroundColor: "#fff3cd",
						borderRadius: "8px",
						border: "2px solid #ffc107",
					}}
				>
					<div
						style={{
							marginBottom: "10px",
							fontWeight: "bold",
							textAlign: "center",
						}}
					>
						🔄 Choose player to swap hands with:
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
						{/* 🔄 7-0 Rule: Use availableSwapTargets from backend if available, otherwise filter players */}
						{(gameState.availableSwapTargets &&
						gameState.availableSwapTargets.length > 0
							? gameState.availableSwapTargets
							: gameState.players.filter((p) => p.userId !== session?.user_id)
						).map((player) => (
							<button
								key={player.userId}
								onClick={() => onChooseSwapTarget(player.userId)}
								style={{
									padding: "10px",
									backgroundColor: "#007bff",
									color: "white",
									border: "none",
									borderRadius: "6px",
									cursor: "pointer",
									fontWeight: "bold",
								}}
							>
								{player.username} ({player.handSize} cards)
							</button>
						))}
					</div>
				</div>
			)}

			{/* Action Hints */}
			<div
				style={{
					marginTop: "15px",
					padding: "10px",
					backgroundColor: "#e9ecef",
					borderRadius: "6px",
					fontSize: "12px",
					color: "#495057",
				}}
			>
				<strong>💡 Hints:</strong>
				<ul
					style={{ marginTop: "5px", marginBottom: "0", paddingLeft: "20px" }}
				>
					<li>Select a card from your hand first</li>
					<li>Wild cards require color selection</li>
					<li>Draw if you have no playable cards</li>
					<li>Timer auto-plays when it expires</li>
				</ul>
			</div>
		</div>
	);
}

export default ActionPanel;
