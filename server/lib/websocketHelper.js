module.exports = {
  sendMessage: (ws,data) => {
    ws.send(JSON.stringify(data))
  },
  messageTypes: {
    SET_RESERVE: "SET_RESERVE",
    RESET_RESERVE: "RESET_RESERVE"
  }
}