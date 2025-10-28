import React from "react";
import { getCardName, getCard } from "../utils/cardDatabase";

/**
 * Player Hand Component
 * Displays player's cards with playable card highlighting
 */
function PlayerHand({
	gameState,
	session,
	myUserId,
	selectedCard,
	onCardSelect,
}) {
	if (
		!gameState.isGameStarted ||
		!gameState.myHand ||
		gameState.myHand.length === 0
	) {
		return (
			<div className="section">
				<h2>🃏 Your Hand</h2>
				<div style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
					{gameState.isGameStarted ? "No cards in hand" : "Game not started"}
				</div>
			</div>
		);
	}

	// ✅ FIX: Check if it's the current player's turn using myUserId
	const isMyTurn =
		Array.isArray(gameState.players) &&
		gameState.currentPlayer !== undefined &&
		gameState.players[gameState.currentPlayer]?.userId ===
			(myUserId || session?.user_id);

	return (
		<div className="section">
			<h2>🃏 Your Hand ({gameState.myHand.length} cards)</h2>

			{/* Playable Cards Info - Only show to current player */}
			{isMyTurn && (
				<div
					style={{
						padding: "10px",
						backgroundColor: "#e9ecef",
						borderRadius: "6px",
						marginBottom: "15px",
						fontSize: "14px",
					}}
				>
					<strong>Playable Cards:</strong> {gameState.playableCards.length} /{" "}
					{gameState.myHand.length}
					{gameState.playableCards.length > 0 && (
						<span style={{ color: "#28a745", marginLeft: "10px" }}>
							✅ You can play!
						</span>
					)}
					{gameState.playableCards.length === 0 && (
						<span style={{ color: "#dc3545", marginLeft: "10px" }}>
							❌ No playable cards - draw a card
						</span>
					)}
					{/* ✅ DEBUG: Show playable cards for debugging */}
					<div style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
						<strong>DEBUG:</strong> Playable IDs: [
						{gameState.playableCards.join(", ")}]
						<br />
						<strong>Card Names:</strong>{" "}
						{gameState.playableCards.map((id) => getCardName(id)).join(", ")}
					</div>
				</div>
			)}

			{/* Card List */}
			<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
				{gameState.myHand.map((card, idx) => {
					// Handle both card objects and card IDs
					const cardId = typeof card === "object" ? card.id : card;

					// Check if card is playable (for visual hint only)
					// ✅ FIX: Only highlight playable cards when it's the player's turn
					const isPlayable =
						isMyTurn &&
						(gameState.playableCards.includes(cardId) ||
							gameState.playableCards.some(
								(pc) => typeof pc === "object" && pc.id === cardId
							));

					// ✅ DEBUG: Log card comparison for debugging
					if (idx === 0) {
						// Only log for first card to avoid spam
						console.log("🃏 Card playability check:", {
							cardId,
							cardType: typeof cardId,
							playableCards: gameState.playableCards,
							playableCardsType: typeof gameState.playableCards[0],
							isPlayable,
							myHand: gameState.myHand.slice(0, 3), // First 3 cards
							playableCardsLength: gameState.playableCards.length,
							includesCheck: gameState.playableCards.includes(cardId),
							strictIncludesCheck: gameState.playableCards.includes(
								Number(cardId)
							),
							cardName: getCardName(cardId),
							cardData: getCard(cardId),
						});
					}

					const isSelected = selectedCard === cardId;
					const cardDisplay = getCardName(cardId);

					// 🔧 FIX: Allow selecting any card when it's player's turn
					// Backend will validate if the card is actually playable
					const canSelect = isMyTurn;

					return (
						<div
							key={`${cardId}-${idx}`}
							onClick={() => canSelect && onCardSelect(cardId)}
							style={{
								padding: "12px 15px",
								backgroundColor: isSelected
									? "#007bff"
									: isPlayable
									? "#d4edda"
									: "#e9ecef",
								color: isSelected
									? "white"
									: isPlayable
									? "#155724"
									: "#6c757d",
								borderRadius: "6px",
								border: `2px solid ${
									isSelected ? "#0056b3" : isPlayable ? "#28a745" : "#ced4da"
								}`,
								cursor: canSelect ? "pointer" : "not-allowed",
								transition: "all 0.2s ease",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								fontWeight: isPlayable ? "bold" : "normal",
								textTransform: "uppercase",
								fontSize: "14px",
							}}
							onMouseEnter={(e) => {
								if (canSelect && !isSelected) {
									e.currentTarget.style.transform = "translateX(5px)";
									e.currentTarget.style.boxShadow =
										"0 2px 8px rgba(0,0,0,0.15)";
								}
							}}
							onMouseLeave={(e) => {
								if (canSelect && !isSelected) {
									e.currentTarget.style.transform = "translateX(0)";
									e.currentTarget.style.boxShadow = "none";
								}
							}}
						>
							<span>{cardDisplay}</span>
							<span>
								{isSelected && "👈 SELECTED"}
								{!isSelected && isPlayable && "✅"}
								{!isPlayable && ""}
							</span>
						</div>
					);
				})}
			</div>

			{/* Selected Card Info */}
			{selectedCard !== null && (
				<div
					style={{
						marginTop: "15px",
						padding: "10px",
						backgroundColor: "#d1ecf1",
						borderRadius: "6px",
						fontSize: "14px",
						textAlign: "center",
					}}
				>
					<strong>Selected:</strong> {getCardName(selectedCard)}
				</div>
			)}

			{/* UNO Warning */}
			{gameState.myHand.length === 1 && (
				<div
					style={{
						marginTop: "15px",
						padding: "12px",
						backgroundColor: "#fff3cd",
						borderRadius: "6px",
						border: "2px solid #ffc107",
						textAlign: "center",
						fontSize: "16px",
						fontWeight: "bold",
						color: "#856404",
					}}
				>
					🎯 UNO! You have 1 card left!
				</div>
			)}
		</div>
	);
}

export default PlayerHand;
