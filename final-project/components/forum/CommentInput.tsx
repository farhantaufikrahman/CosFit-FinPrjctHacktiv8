"use client";

import Image from "next/image";
import { ImagePlus, Smile, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { socket } from "@/socket"; 
import ReplyEditor from "../ReplyEditor";

interface CommentInputProps {
  forumId: string;
  chatLength: number;
  image?: string;
}

export default function CommentInput({ forumId, chatLength, image }: CommentInputProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatLength, setCurrentChatLength] = useState(chatLength);
  
  // Tambahkan state ini untuk memaksa re-render ReplyEditor
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setCurrentChatLength(chatLength);
  }, [chatLength]);

  useEffect(() => {
    const handleReceiveMsg = (newMsg: any) => {
      const actualMsg = newMsg?.chatData || newMsg?.message || newMsg;

      if (Array.isArray(actualMsg)) {
        setCurrentChatLength(actualMsg.length);
      } else {
        setCurrentChatLength((prev) => prev + 1);
      }
    };
    
    socket.on("receive_msg", handleReceiveMsg);
    
    return () => {
      socket.off("receive_msg", handleReceiveMsg);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perbaikan tambahan: Tiptap sering menghasilkan tag <p></p> kosong, 
    // pastikan kita mengecek isinya dengan menghapus tag HTML kosong.
    const isMessageEmpty = !message || message === "<p></p>" || !message.replace(/<[^>]*>?/gm, '').trim();
    if (isMessageEmpty || loading) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${forumId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message) 
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      socket.emit("send_msg", { 
        roomId: forumId, 
        chatData: data.message 
      });

      // Reset state dan paksa editor untuk mount ulang
      setMessage("");
      setEditorKey(prev => prev + 1);

    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      alert(err instanceof Error ? err.message : "Gagal mengirim komentar");
    } finally {
      setLoading(false);
    }
  };

  // Validasi tombol disable agar lebih akurat jika Tiptap mengirim <p></p>
  const isSubmitDisabled = loading || !message || message === "<p></p>" || !message.replace(/<[^>]*>?/gm, '').trim();

  return (
    <section className="card p-6 bg-white border border-border rounded-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg">
          Comments ({currentChatLength})
        </h3>
        <button className="text-sm text-muted-foreground hover:text-primary">
          Sort by Newest
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="relative h-12 w-12 shrink-0">
          {image ? (
            <Image src={image} alt="My Avatar" fill className="rounded-full object-cover" />
          ) : (
            <></>
          )}
        </div>

        <div className="flex-1">
          <div className="flex-1">
            <ReplyEditor
              key={editorKey} // Gunakan key di sini
              value={message}
              onChange={setMessage}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-[#FCFBFA] hover:text-(--foreground)">
                <ImagePlus size={18} />
              </button>

              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-[#FCFBFA] hover:text-(--foreground)">
                <Smile size={18} />
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitDisabled}
              className="primary-btn flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send size={15} />
              {loading ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}