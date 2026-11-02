import ChatModel from "@/db/models/chatModel";
import errorHandler from "@/app/helpers/errorHandler";
import { sanitizeRichText } from "@/helpers/sanitize";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const userId = req.headers.get("x-user-id");
    const response = await ChatModel.getChatRoomId(roomId, userId);
    return Response.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}

// POST body: string JSON, contoh: "halo semua"  (atau { "content": "..." })
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const userId = req.headers.get("x-user-id") as string; // dijamin oleh proxy.ts
    const body = await req.json();

    const raw = typeof body === "string" ? body : body?.content;
    const content = sanitizeRichText(raw);
    if (!content.replace(/<[^>]*>/g, "").trim()) {
      throw { message: "Message cannot be empty", status: 400 };
    }
    if (content.length > 2000) {
      throw { message: "Message is too long (max 2000 chars)", status: 400 };
    }

    const response = await ChatModel.postChat(roomId, userId, content.trim());
    return Response.json({ status: 201, message: response }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
