const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["https://cider-gamma.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected.");
});

app.use(cors());
app.use(express.json());

let waitingUsers = [];
let activeConnections = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("find-partner", () => {
    // First, remove this socket from waiting queue if it's already there
    const existingIndex = waitingUsers.findIndex(
      (user) => user.id === socket.id
    );
    if (existingIndex !== -1) {
      waitingUsers.splice(existingIndex, 1);
      console.log(
        `Removed ${socket.id} from waiting queue (duplicate request)`
      );
    }

    let partner = null;
    while (waitingUsers.length > 0) {
      const potentialPartner = waitingUsers.shift();

      if (potentialPartner.id !== socket.id) {
        partner = potentialPartner;
        break;
      } else {
        console.log(`Skipped self-match for ${socket.id}`);
      }
    }

    if (partner) {
      activeConnections.set(socket.id, partner.id);
      activeConnections.set(partner.id, socket.id);

      // The NEW connection (socket) will be the offerer
      // The WAITING partner will be the answerer
      socket.emit("partner-found", { partnerId: partner.id, isOfferer: true });
      partner.emit("partner-found", { partnerId: socket.id, isOfferer: false });

      console.log(
        `Matched ${socket.id} (offerer) with ${partner.id} (answerer)`
      );
    } else {
      // No valid partner found, add to waiting queue
      waitingUsers.push(socket);
      socket.emit("waiting");
      console.log(`${socket.id} added to waiting queue`);
    }
  });

  socket.on("offer", (data) => {
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("offer", {
        offer: data.offer,
        from: socket.id,
      });
    }
  });

  socket.on("answer", (data) => {
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    }
  });

  socket.on("ice-candidate", (data) => {
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    }
  });

  socket.on("chat-message", (data) => {
    const partnerId = activeConnections.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("chat-message", {
        message: data.message,
        from: "Stranger",
      });
    }
  });

  socket.on("typing", () => {
    const partnerId = activeConnections.get(socket.id);
    console.log(`⌨️  ${socket.id} is typing, partner: ${partnerId}`);
    if (partnerId) {
      io.to(partnerId).emit("partner-typing");
      console.log(`✅ Sent partner-typing to ${partnerId}`);
    } else {
      console.log(`❌ No partner found for ${socket.id}`);
    }
  });

  socket.on("stop-typing", () => {
    const partnerId = activeConnections.get(socket.id);
    console.log(`🛑 ${socket.id} stopped typing, partner: ${partnerId}`);
    if (partnerId) {
      io.to(partnerId).emit("partner-stop-typing");
      console.log(`✅ Sent partner-stop-typing to ${partnerId}`);
    }
  });

  socket.on("disconnect-chat", () => {
    handleDisconnection(socket);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    handleDisconnection(socket);
  });

  function handleDisconnection(socket) {
    const partnerId = activeConnections.get(socket.id);

    if (partnerId) {
      io.to(partnerId).emit("partner-disconnected");
      activeConnections.delete(partnerId);
      activeConnections.delete(socket.id);
    }

    const waitingIndex = waitingUsers.findIndex(
      (user) => user.id === socket.id
    );
    if (waitingIndex !== -1) {
      waitingUsers.splice(waitingIndex, 1);
    }
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
