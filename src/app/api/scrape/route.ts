// src/app/api/scrape/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "페이지를 불러올 수 없습니다." }, { status: 500 });
    }

    const html = await response.text();

    // 2. HTML에서 텍스트 및 이미지 정보 추출
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const images: string[] = [];
    while ((match = imgRegex.exec(html)) !== null && images.length < 20) {
      if (match[1].startsWith("http")) images.push(match[1]);
    }

    const cleanText = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
      .replace(/<[^>]+>/gm, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 10000);

    // 3. AI를 사용하여 프롬프트 정보 및 매칭되는 이미지 추출
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `다음은 특정 웹사이트의 텍스트 내용과 발견된 이미지 목록입니다. 
    내용 중에서 AI 프롬프트를 찾고, 만약 해당 프롬프트와 연관된 이미지가 이미지 목록에 있다면 그 URL을 'thumbnail' 필드에 넣어주세요.
    
    JSON 형식: [{"title": "제목", "content": "프롬프트", "category": "분류", "summary": "요약", "thumbnail": "이미지URL 또는 null"}]
    
    이미지 목록:
    ${images.join("\n")}
    
    웹사이트 내용:
    ${cleanText}`;

    const result = await model.generateContent(prompt);
    const textResult = result.response.text();
    
    // JSON 추출 (AI가 마크다운으로 감쌀 수 있음)
    const jsonMatch = textResult.match(/\[[\s\S]*\]/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ data: extractedData });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
