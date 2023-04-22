import { useState } from "react";
import {
  Card,
  CardRank,
  CardDeck,
  CardSuit,
  GameState,
  Hand,
  GameResult,
  Result,
} from "./types";

//UI Elements
const CardBackImage = () => (
  <img
    alt="back of card"
    src={process.env.PUBLIC_URL + `/SVG-cards/png/1x/back.png`}
  />
);

const CardImage = ({ suit, rank }: Card) => {
  const card = rank === CardRank.Ace ? 1 : rank;
  return (
    <img
      alt={rank + " card"}
      src={
        process.env.PUBLIC_URL +
        `/SVG-cards/png/1x/${suit.slice(0, -1)}_${card}.png`
      }
    />
  );
};

//Setup
const newCardDeck = (): CardDeck =>
  Object.values(CardSuit)
    .map((suit) =>
      Object.values(CardRank).map((rank) => ({
        suit,
        rank,
      }))
    )
    .reduce((a, v) => [...a, ...v]);

const shuffle = (deck: CardDeck): CardDeck => {
  return deck.sort(() => Math.random() - 0.5);
};

const takeCard = (deck: CardDeck): { card: Card; remaining: CardDeck } => {
  const card = deck[deck.length - 1];
  const remaining = deck.slice(0, deck.length - 1);
  return { card, remaining };
};

const setupGame = (): GameState => {
  const cardDeck = shuffle(newCardDeck());
  return {
    playerHand: cardDeck.slice(cardDeck.length - 2, cardDeck.length),
    dealerHand: cardDeck.slice(cardDeck.length - 4, cardDeck.length - 2),
    cardDeck: cardDeck.slice(0, cardDeck.length - 4), // remaining cards after player and dealer have been give theirs
    turn: "player_turn",
  };
};

const extractCardScore = (rank: string, acc: number): number => {
  switch (rank) {
    case CardRank.King:
    case CardRank.Queen:
    case CardRank.Jack:
      return 10;
    case CardRank.Ace:
      return 21 - acc <= 11 ? 1 : 11; // TODO: Make this variable so that aces can dynamically change between 1 and 11
    default:
      return 0;
  }
};

//Scoring
const calculateHandScore = (hand: Hand): number => {
  const score = hand.reduce((acc, curCard) => {
    let cardValue = parseInt(curCard.rank);
    // if cardValue = NaN
    if (!cardValue) {
      cardValue = extractCardScore(curCard.rank, acc);
    }
    return acc + cardValue;
  }, 0);
  return score;
};

const isBlackjack = (hand: Hand) => {
  return (
    hand.length === 2 &&
    calculateHandScore(hand) === 21 &&
    hand.find((card) => card.rank === CardRank.Ace)
  );
};

const determineGameResult = (state: GameState): GameResult => {
  const { dealerHand, playerHand } = state;

  const playerScore = calculateHandScore(playerHand);
  const dealerScore = calculateHandScore(dealerHand);

  // going bust
  if (playerScore > 21) {
    return Result.DEALER_WIN;
  }
  if (dealerScore > 21) {
    return Result.PLAYER_WIN;
  }

  // simple victory
  if (dealerScore > playerScore) {
    return Result.DEALER_WIN;
  }
  if (playerScore > dealerScore) {
    return Result.PLAYER_WIN;
  }

  const isEqualScore = playerScore === dealerScore;
  if (isEqualScore) {
    const isPlayerBlackjack = isBlackjack(playerHand);
    const isDealerBlackjack = isBlackjack(dealerHand);
    if (isPlayerBlackjack && isDealerBlackjack) return Result.DRAW;
    if (isDealerBlackjack) return Result.DEALER_WIN;
    if (isPlayerBlackjack) return Result.PLAYER_WIN;
    return Result.DRAW;
  }

  return Result.NO_RESULT;
};

//Player Actions
const playerStands = (state: GameState): GameState => {
  let tempState = { ...state }; // shallow copy so as not to mutate
  const isDealerLowScore = calculateHandScore(state.dealerHand) <= 16;
  if (isDealerLowScore) {
    const { card, remaining } = takeCard(state.cardDeck);
    tempState = {
      ...tempState,
      cardDeck: remaining,
      dealerHand: [...tempState.dealerHand, card],
    };
  }
  return {
    ...tempState,
    turn: "dealer_turn",
  };
};

const playerHits = (state: GameState): GameState => {
  const { card, remaining } = takeCard(state.cardDeck);
  return {
    ...state,
    cardDeck: remaining,
    playerHand: [...state.playerHand, card],
  };
};

//UI Component
const Game = (): JSX.Element => {
  const [state, setState] = useState(setupGame());

  return (
    <>
      <div>
        <p>There are {state.cardDeck.length} cards left in deck</p>
        <button
          disabled={state.turn === "dealer_turn"}
          onClick={(): void => setState(playerHits)}
        >
          Hit
        </button>
        <button
          disabled={state.turn === "dealer_turn"}
          onClick={(): void => setState(playerStands)}
        >
          Stand
        </button>
        <button onClick={(): void => setState(setupGame())}>Reset</button>
      </div>
      <p>Player Cards</p>
      <div>
        {state.playerHand.map(CardImage)}
        <p>Player Score {calculateHandScore(state.playerHand)}</p>
      </div>
      <p>Dealer Cards</p>
      {state.turn === "player_turn" && state.dealerHand.length > 0 ? (
        <div>
          <CardBackImage />
          <CardImage {...state.dealerHand[1]} />
        </div>
      ) : (
        <div>
          {state.dealerHand.map(CardImage)}
          <p>Dealer Score {calculateHandScore(state.dealerHand)}</p>
        </div>
      )}
      {state.turn === "dealer_turn" &&
      determineGameResult(state) !== Result.NO_RESULT ? (
        <p>{determineGameResult(state)}</p>
      ) : (
        <p>{state.turn}</p>
      )}
    </>
  );
};

export {
  Game,
  playerHits,
  playerStands,
  determineGameResult,
  calculateHandScore,
  setupGame,
};
