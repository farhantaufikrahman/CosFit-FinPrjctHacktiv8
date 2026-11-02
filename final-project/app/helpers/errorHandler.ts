import { ZodError } from "zod";

export default function errorHandler(err: unknown) {
  const error = err as { message?: string; status?: number; name?: string };
  let message = error?.message;
  let status = error?.status;

  if (err instanceof ZodError) {
    message = err.issues.map((e) => e.message).join(", ");
    status = 400;
  } else if (error?.name === "BSONError") {
    // new ObjectId("bukan-objectid") -> sebelumnya jadi 500
    message = "Invalid id";
    status = 400;
  } else if (error?.name === "SyntaxError" && !status) {
    // req.json() dengan body kosong / bukan JSON
    message = "Invalid JSON body";
    status = 400;
  }

  if (!status || status >= 500) console.error(err);

  return Response.json(
    { message: message || "Internal Server Error" },
    { status: status || 500 },
  );
}
