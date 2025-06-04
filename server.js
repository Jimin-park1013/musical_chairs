import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const rooms = {}; // { roomId: { id, host, players: [] } }

io.on("connection", (socket) => {
  console.log("使用者連線:", socket.id);

  // 房間清單
  socket.on("getRoomList", () => {
    socket.emit("roomList", Object.values(rooms));
  });

  // 加入房間
  socket.on("joinRoom", ({ nickname, roomId }, callback) => {
    if (!rooms[roomId]) {
      // 新開房
      rooms[roomId] = {
        id: roomId,
        host: nickname,
        players: [],
      };
    }

    const room = rooms[roomId];
    // 防重複加入
    if (room.players.find((p) => p.id === socket.id)) {
      callback(false);
      return;
    }

    room.players.push({
      id: socket.id,
      nickname,
      ready: false,
    });

    socket.join(roomId);
    io.to(roomId).emit("roomUpdate", room);
    io.emit("roomList", Object.values(rooms));
    callback(true);
  });

  // 加 20 假玩家
  socket.on("addFakePlayers", (roomId) => {
    const room = rooms[roomId];
    if (room) {
      for (let i = 0; i < 20; i++) {
        room.players.push({
          id: `fake_${Date.now()}_${i}`,
          nickname: `虛擬玩家${i + 1}`,
          ready: true,
        });
      }
      io.to(roomId).emit("roomUpdate", room);
      io.emit("roomList", Object.values(rooms));
    }
  });

  // 離線移除玩家
  socket.on("disconnect", () => {
    console.log("使用者離線:", socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.id !== socket.id);

      // 沒人就刪房
      if (room.players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("roomUpdate", room);
      }
    }
    io.emit("roomList", Object.values(rooms));
  });
});

httpServer.listen(4000, () => {
  console.log("伺服器已啟動在 http://localhost:4000");
});
