// server/index.js
const mongoose = require("mongoose");
const app = require("./app");

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

// 🔥 creează server HTTP din express
const server = http.createServer(app);

// 🔥 inițializează socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔗 JOIN SESSION (QR pairing)
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);

    // notificăm desktop că telefonul s-a conectat
    socket.to(sessionId).emit("mobile-connected");

    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  // 🚗 DESKTOP → TELEFON (cerere aprobare)
  socket.on("approval-needed", (data) => {
    const { sessionId } = data;

    // 🔥 FIX IMPORTANT: folosim io.to (NU socket.to)
    io.to(sessionId).emit("approval-needed", data);

    console.log("📤 Sent approval request to phone:", sessionId);
  });

  // 📱 TELEFON → DESKTOP (login)
  socket.on("mobile-login", (sessionId, data) => {
    console.log("📱 Mobile login:", data.user);

    io.to(sessionId).emit("desktop-login", data);
  });

  // 📱 TELEFON → DESKTOP (approve/reject)
  socket.on("approval-response", ({ sessionId, approved, payload }) => {
    io.to(sessionId).emit("approval-result", {
      approved,
      payload,
    });

    console.log("📥 Approval response:", approved);
  });

  // 📍 MOBILE → DESKTOP (GPS)
  socket.on("send-location", ({ sessionId, coords }) => {
    io.to(sessionId).emit("receive-location", coords);

    console.log("📍 Location sent:", coords);
  });

  // 🚀 DESKTOP → MOBILE (start GPS DUPĂ APROBARE)
  socket.on("start-gps", ({ sessionId }) => {
    io.to(sessionId).emit("start-gps");

    console.log("🚀 Start GPS for session:", sessionId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔥 conectare Mongo
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// 🔥 start server
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is now running on port ${PORT}`),
);
