export enum CardSuit {
  Clubs = "clubs",
  Diamonds = "diamonds",
  Hearts = "hearts",
  Spades = "spades",
}

export enum CardRank {
  Ace = "ace",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "jack",
  Queen = "queen",
  King = "king",
}

export enum Result {
  NO_RESULT = "no_result",
  PLAYER_WIN = "player_win",
  DEALER_WIN = "dealer_win",
  DRAW = "draw",
}

export type GameResult = `${Result}`;

export type Turn = "player_turn" | "dealer_turn";

export type Card = {
  suit: CardSuit;
  rank: CardRank;
};

export type CardDeck = Array<Card>;
export type Hand = Array<Card>;
export type GameState = {
  cardDeck: CardDeck;
  playerHand: Hand;
  dealerHand: Hand;
  turn: Turn;
};
