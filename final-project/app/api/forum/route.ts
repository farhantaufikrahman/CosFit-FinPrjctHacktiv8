import ForumModel from "@/db/models/forumModel";
import errorHandler from "@/app/helpers/errorHandler";
import { sanitizeRichText } from "@/helpers/sanitize";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "newest";
    const page = searchParams.get("page") || "1";

    const response = await ForumModel.getAllForums(sort, page);
    return Response.json(response);
  } catch (error) {
    return errorHandler(error);
  }
}

// POST multipart: Image, nameForum, desc, tag ("a, b, c")
export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const formData = await req.formData();

    const img = formData.get("Image");
    const nameForum = String(formData.get("nameForum") ?? "").trim();
    const desc = sanitizeRichText(formData.get("desc"));
    const tagRaw = String(formData.get("tag") ?? "");
    const tag = tagRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!nameForum) {
      throw { message: "nameForum is required", status: 400 };
    }
    if (!(img instanceof File) || img.size === 0) {
      throw { message: "Image is required", status: 400 };
    }

    // Slug unik & URL-safe (sebelumnya hanya replaceAll(" ", "-") -> bisa bentrok
    // dan mengandung karakter seperti "?" atau "#")
    const slug = await ForumModel.generateUniqueSlug(nameForum);

    const result = await ForumModel.createForum({ slug, nameForum, desc, tag }, userId, img);
    return Response.json({ message: result, slug }, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
