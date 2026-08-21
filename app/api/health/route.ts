import { APPLICATION_NAME } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      ok: true,
      application: APPLICATION_NAME,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
