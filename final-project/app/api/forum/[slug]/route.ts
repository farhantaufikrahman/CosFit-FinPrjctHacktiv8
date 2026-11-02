import errorHandler from "@/app/helpers/errorHandler";
import ForumModel from "@/db/models/forumModel";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const forum = await ForumModel.getForumId(decodeURIComponent(slug));

    // Sebelumnya Response.json(undefined) -> crash; halaman detail butuh 404
    if (!forum) throw { message: "Forum not found", status: 404 };

    return Response.json(forum);
  } catch (error) {
    return errorHandler(error);
  }
}

// PATCH = toggle like (login dicek di proxy.ts)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const userId = req.headers.get("x-user-id") as string;
    const response = await ForumModel.patchForum(userId, decodeURIComponent(slug));
    return Response.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}
