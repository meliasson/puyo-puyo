const Game = require("./Game");

const games = [];

function joinGame(player) {
  const existingGameToRejoin = games.find(game => {
    return game.isParticipant(player);
  });
  if (existingGameToRejoin) {
    existingGameToRejoin.join(player);
    return existingGameToRejoin;
  }

  const existingGameToJoin = games.find(game => {
    return !game.isFull();
  });
  if (existingGameToJoin) {
    existingGameToJoin.join(player);
    return existingGameToJoin;
  }

  const newGame = new Game();
  newGame.join(player);
  games.push(newGame);
  return newGame;
}

function leaveGame(player) {
  const gameToLeave = games.find(game => {
    return game.isParticipant(player);
  });

  if (gameToLeave) {
    gameToLeave.leave(player);
  }
}

function updateGame(player, action) {
  const gameToUpdate = games.find(game => {
    return game.isParticipant(player);
  });

  if (gameToUpdate) {
    gameToUpdate.update(player, action);
  }
}

module.exports = {
  joinGame,
  leaveGame,
  updateGame
};
