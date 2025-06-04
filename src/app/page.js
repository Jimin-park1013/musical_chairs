"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const handleEnter = () => {
    if (!nickname) {
      alert("請輸入暱稱");
      return;
    }
    // 將暱稱存到 localStorage 或 context，這邊先用 localStorage 簡單做
    localStorage.setItem("nickname", nickname);
    router.push("/room/001");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-6 p-4">
      <h1 className="text-3xl font-bold">大風吹🎈</h1>
      <input
        type="text"
        placeholder="輸入你的暱稱"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded w-64 text-center"
      />
      <button
        onClick={handleEnter}
        className="p-2 bg-blue-500 text-white rounded w-64"
      >
        進入房間
      </button>
    </div>
  );
}


