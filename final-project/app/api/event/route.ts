import eventModel from "@/db/models/ourEventModel";
import errorHandler from "@/app/helpers/errorHandler";

export async function GET() {
  try {
    const result = await eventModel.getAllEvents();
    return Response.json(result);
  } catch (error) {
    return errorHandler(error);
  }
}

// Hanya Admin (dicek di proxy.ts). Untuk form admin gunakan POST /api/admin/events.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.eventName) throw { message: "eventName is required", status: 400 };

    const result = await eventModel.createEvent({
      ...body,
      creatorId: req.headers.get("x-user-id") ?? undefined,
    });
    return Response.json({ message: result }, { status: 201 });
  } catch (error) {
    // sebelumnya tanpa `return` + req.json() di luar try
    return errorHandler(error);
  }
}
