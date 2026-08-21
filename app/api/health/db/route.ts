import { APPLICATION_NAME, getSupabasePublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

export async function GET() {
  const { url, anonKey, configured } = getSupabasePublicEnv();

  if (!configured) {
    return json(
      {
        ok: false,
        application: APPLICATION_NAME,
        database: "unconfigured",
      },
      503,
    );
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return json(
      {
        ok: false,
        application: APPLICATION_NAME,
        database: "unconfigured",
      },
      503,
    );
  }

  try {
    const restUrl = `${url.replace(/\/$/, "")}/rest/v1/`;
    const response = await fetch(restUrl, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return json(
        {
          ok: false,
          application: APPLICATION_NAME,
          database: "unreachable",
          client: "initialized",
          status: response.status,
        },
        503,
      );
    }

    return json(
      {
        ok: true,
        application: APPLICATION_NAME,
        database: "connected",
        client: "initialized",
      },
      200,
    );
  } catch {
    return json(
      {
        ok: false,
        application: APPLICATION_NAME,
        database: "unreachable",
        client: "initialized",
      },
      503,
    );
  }
}
