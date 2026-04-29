import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function runGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

async function runBigPickle(prompt: string): Promise<string> {
  const res = await fetch("https://opencode.ai/zen/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENCODE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "big-pickle",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Big Pickle API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function runAI(model: string, prompt: string): Promise<string> {
  if (model === "big-pickle") return runBigPickle(prompt);
  return runGemini(prompt);
}

export async function POST(req: NextRequest) {
  const { action, content, command, model = "gemini" } = await req.json();

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    if (action === "autofill") {
      const text = await runAI(
        model,
        `다음 AI 프롬프트를 분석해서 JSON으로만 응답해줘. 마크다운 코드블록 없이 순수 JSON만.

프롬프트:
${content}

응답 형식:
{
  "title": "간결한 제목 (20자 이내)",
  "summary": "한 줄 설명 (50자 이내)",
  "category": "Image|Coding|Marketing|Writing|Design|Business|Other 중 하나"
}`
      );
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    }

    if (action === "transform") {
      if (!command) {
        return NextResponse.json({ error: "command is required" }, { status: 400 });
      }
      const result = await runAI(
        model,
        `다음 AI 프롬프트를 요청에 맞게 변형해줘. 변형된 프롬프트 텍스트만 출력해. 설명이나 부연 없이 프롬프트 내용만.

원본 프롬프트:
${content}

변형 요청: ${command}`
      );
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (err) {
    console.error("AI API error:", err);
    return NextResponse.json({ error: "AI 요청에 실패했습니다." }, { status: 500 });
  }
}
