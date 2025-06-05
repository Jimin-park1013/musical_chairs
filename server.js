import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // 你前端網址
  },
});

const rooms = {}; // { roomId: { id, host, players: [] } }

io.on("connection", (socket) => {
  console.log("使用者連線:", socket.id);

  // 取得房間清單（可用於房間列表頁面）
  socket.on("getRoomList", () => {
    socket.emit("roomList", Object.values(rooms));
  });

  // 加入房間
  socket.on("joinRoom", ({ nickname, roomId }, callback) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        host: socket.id,
        players: [],
      };
    }
  
    const room = rooms[roomId];
  
    if (room.players.find((p) => p.id === socket.id)) {
      if (typeof callback === "function") callback(false);
      return;
    }
  
    room.players.push({
      id: socket.id,
      nickname,
      ready: false,
    });
  
    socket.join(roomId);
  
    if (typeof callback === "function") callback(true);
  
    io.to(roomId).emit("roomData", {
      ...room,
      selfId: socket.id,
    });
  
    io.emit("roomList", Object.values(rooms));
  });
  
  // 玩家切換準備狀態
  socket.on("toggleReady", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.map((p) => {
      if (p.id === socket.id) {
        return { ...p, ready: !p.ready };
      }
      return p;
    });

    io.to(roomId).emit("roomData", {
      ...room,
      selfId: socket.id,
    });
  });

  // 遊戲開始事件（可擴充遊戲邏輯）
  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    const allReady = room.players.every((p) => p.ready);
    if (!allReady) {
      socket.emit("errorMsg", "所有玩家必須準備才能開始遊戲");
      return;
    }

    // 這裡你可以加入遊戲開始邏輯

    io.to(roomId).emit("gameStarted");
  });

  // 離線自動移除玩家
  socket.on("disconnect", () => {
    console.log("使用者離線:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const beforeCount = room.players.length;

      room.players = room.players.filter((p) => p.id !== socket.id);

      // 房主離開時重新指派房主
      if (room.host === socket.id && room.players.length > 0) {
        room.host = room.players[0].id;
      }

      // 如果沒人了就刪房間
      if (room.players.length === 0) {
        delete rooms[roomId];
      } else if (beforeCount !== room.players.length) {
        io.to(roomId).emit("roomData", {
          ...room,
          selfId: socket.id, // 離線玩家 id 可能無用，但前端可用現有 socket.id
        });
      }
    }

    io.emit("roomList", Object.values(rooms));
  });
});

httpServer.listen(4000, () => {
  console.log("伺服器已啟動在 http://localhost:4000");
});
