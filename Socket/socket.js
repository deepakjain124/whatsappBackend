const socketIO = require("socket.io");

let io;
let socketId;

function initializeSocket(server) {
  // io = socketIO(server);
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connection:");
    socket.on("joined", (data) => {
        socket.emit(data)
      console.log("in socket ifhbf----------->>>.");
    });
  });
}
function getIO() {
  return { io: io, socketId: socketId };
}

module.exports = { initializeSocket, getIO };
