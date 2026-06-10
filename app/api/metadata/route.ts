import { NextRequest, NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  console.log("url in api", url);

  if (!url) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url);
    const html = await res.text();
    const root = parse(html);

    const metadata = {
      title: root
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),

      description: root
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),

      image: root
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
    };

    return NextResponse.json({
      success: true,
      message: "Successfully got the metadata",
      metadata,
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metadata",
      },
      { status: 500 }
    );
  }
}