import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";

const LYZR_API_KEY = process.env.LYZR_API_KEY;
const LYZR_AGENT_ID = process.env.LYZR_AGENT_ID;
const LYZR_ENDPOINT = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`lyzr:${clientIp}`, {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    // Check API configuration
    if (!LYZR_API_KEY || !LYZR_AGENT_ID) {
      console.error("Lyzr API configuration missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { user_id, session_id, message } = body;

    if (!user_id || !session_id || message === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, session_id, message" },
        { status: 400 }
      );
    }

    // Call Lyzr Agent API
    const lyzrResponse = await fetch(LYZR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY,
      },
      body: JSON.stringify({
        user_id,
        agent_id: LYZR_AGENT_ID,
        session_id,
        message,
      }),
    });

    if (!lyzrResponse.ok) {
      const errorText = await lyzrResponse.text();
      console.error("Lyzr API error:", errorText);
      return NextResponse.json(
        { error: "Agent inference failed" },
        { status: lyzrResponse.status }
      );
    }

    const lyzrData = await lyzrResponse.json();

    // Normalize the response
    // Lyzr may return different structures, so we normalize here
    let agentText = "";
    let structuredJson = null;

    // Try to extract text response
    if (typeof lyzrData === "string") {
      agentText = lyzrData;
    } else if (lyzrData.response) {
      agentText = lyzrData.response;
    } else if (lyzrData.message) {
      agentText = lyzrData.message;
    } else if (lyzrData.text) {
      agentText = lyzrData.text;
    }

    // Try to extract structured data
    if (lyzrData.structured_output) {
      structuredJson = lyzrData.structured_output;
    } else if (lyzrData.evaluation) {
      structuredJson = lyzrData.evaluation;
    } else if (lyzrData.metadata) {
      structuredJson = lyzrData.metadata;
    }

    // If we still don't have text, try to parse the entire response
    if (!agentText && typeof lyzrData === "object") {
      // Check if there's a nested response
      const possibleKeys = ["data", "result", "output"];
      for (const key of possibleKeys) {
        if (lyzrData[key]) {
          if (typeof lyzrData[key] === "string") {
            agentText = lyzrData[key];
            break;
          } else if (lyzrData[key].text || lyzrData[key].message) {
            agentText = lyzrData[key].text || lyzrData[key].message;
            break;
          }
        }
      }
    }

    // Fallback: if still no text, stringify the response
    if (!agentText) {
      agentText = JSON.stringify(lyzrData);
    }

    return NextResponse.json(
      {
        agent_text: agentText,
        structured_json: structuredJson,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Lyzr inference error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
