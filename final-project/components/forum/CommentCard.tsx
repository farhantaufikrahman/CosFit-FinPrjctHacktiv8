"use client";

import { useEffect, useState } from "react";
import { socket } from "@/socket";
import { Heart, Reply, Flag, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface chatType {
  _id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: string;
  vendor?: {
    namaToko: string;
    role?: string;
    userImg?: string;
  }[];
  user: {
    username: string;
    role?: string;
    userImg?: string;
    UserImg?: string;
  }[];
}

interface CommentCardProps {
  roomId: string;
  initialMessages: chatType[];
  currentUser: string;
  image?: string;
}

// Fungsi pembantu untuk memformat waktu relatif
const formatTimeAgo = (dateString: string | undefined) => {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) {
    return "Just now";
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export default function CommentCard({ roomId, initialMessages, currentUser, image }: CommentCardProps) {
  const [messages, setMessages] = useState<chatType[]>(initialMessages);
  const roleColor = "#8B5CF6";

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    socket.connect();
    socket.emit("join_room", roomId);

    const handleReceiveMsg = (newMsg: any) => {
      const actualMsg = newMsg?.chatData || newMsg?.message || newMsg;

      if (Array.isArray(actualMsg)) {
        setMessages(actualMsg);
      } else {
        setMessages((prevMessages) => [...prevMessages, actualMsg]);
      }
    };

    socket.on("receive_msg", handleReceiveMsg);
    return () => {
      socket.off("receive_msg", handleReceiveMsg);
    };
  }, [roomId]);

  return (
    <div className="flex w-full flex-col gap-6 p-4">
      {messages?.map((chat) => {
        const username = chat?.user?.[0]?.username || chat?.vendor?.[0]?.namaToko || "Unknown";
        const isMe = username === currentUser;
        const role = isMe ? "You" : chat?.user?.[0]?.role || chat?.vendor?.[0]?.role;
        // User disimpan dengan `UserImg`, vendor dengan `userImg`; next/image crash kalau src kosong
        const avatar =
          chat?.user?.[0]?.UserImg ||
          chat?.user?.[0]?.userImg ||
          chat?.vendor?.[0]?.userImg ||
          "/images/profile/user-avatar.png";

        return (
          <div key={chat._id} className="card rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              
              <div className="relative h-12 w-12 shrink-0">
                <Image src={avatar} alt="My Avatar" fill className="rounded-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-(--foreground)">
                        {username}
                      </h4>

                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: `${roleColor}15`,
                          color: roleColor,
                        }}
                      >
                        {role}
                      </span>

                      {/* Menggunakan helper formatTimeAgo di sini */}
                      <span className="text-xs text-muted text-muted-foreground">
                        {formatTimeAgo(chat.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-[#FCFBFA] hover:text-(--foreground)">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div
                  className="
                    prose prose-sm max-w-none
                    [&>p:last-child]:mb-0
                    [&>ul]:list-disc
                    [&>ol]:list-decimal
                    [&>ul]:ml-5
                    [&>ol]:ml-5
                  "
                  dangerouslySetInnerHTML={{ __html: chat.content }}
                />

                <div className="mt-5 flex gap-6 text-sm text-muted-foreground">
                  <button className="flex items-center gap-2 transition-colors hover:text-primary">
                    <Heart size={16} />
                    0
                  </button>

                  <button className="flex items-center gap-2 transition-colors hover:text-primary">
                    <Reply size={16} />
                    Reply
                  </button>

                  {!isMe && (
                    <button className="flex items-center gap-2 transition-colors hover:text-red-500">
                      <Flag size={16} />
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}