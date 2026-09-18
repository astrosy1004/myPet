import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractJsonObject } from "@/lib/parse-json-response";

// 모델 이름이 자주 바뀌거나 계정별 접근 권한이 다를 수 있어, 여러 후보를
// 순서대로 시도해 그중 처음으로 성공하는 모델을 사용한다.
const VISION_MODEL_CANDIDATES = ["gpt-5.1", "gpt-5", "gpt-4.1", "gpt-4o"];

async function callVisionModel(
  apiKey: string,
  messages: unknown[],
): Promise<{ res: Response; model: string } | null> {
  let lastRes: Response | null = null;

  for (const model of VISION_MODEL_CANDIDATES) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (res.ok) return { res, model };

    lastRes = res;
    if (res.status !== 404) break;
  }

  return lastRes ? { res: lastRes, model: "unknown" } : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const petId = String(body.pet_id ?? "");
  const species = String(body.species ?? "cat");
  const frames: string[] = Array.isArray(body.frames) ? body.frames : [];

  if (!petId || frames.length === 0) {
    return NextResponse.json(
      { error: "필수 데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  const speciesLabel = species === "dog" ? "강아지" : "고양이";

  const messages = [
    {
      role: "system",
      content:
        '너는 반려동물 행동 영상을 보고 행동을 설명하는 도우미다. 여러 장의 연속된 프레임 이미지를 시간 순서대로 받는다. 다른 설명이나 코드블록 없이 반드시 다음 JSON 객체 하나만 출력하라: {"description": "한두 문장 한국어 행동 설명", "is_anomaly": true 또는 false, "reason": "이상 징후로 판단했거나 판단하지 않은 이유 한 문장"}. 이 추정은 참고용이며 수의학적 진단이 아니다.',
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `이 ${speciesLabel}의 연속된 행동 프레임을 보고 무슨 행동을 하고 있는지, 이상 징후가 있는지 판단해줘.`,
        },
        ...frames.map((frame) => ({
          type: "image_url",
          image_url: { url: frame },
        })),
      ],
    },
  ];

  const result = await callVisionModel(apiKey, messages);

  if (!result) {
    return NextResponse.json(
      { error: "행동 분석에 실패했습니다. (사용 가능한 모델을 찾지 못했습니다)" },
      { status: 502 },
    );
  }

  if (!result.res.ok) {
    const detail = await result.res.text();
    console.error("OpenAI API error", result.res.status, detail);
    return NextResponse.json(
      { error: "행동 분석에 실패했습니다.", status: result.res.status, detail },
      { status: 502 },
    );
  }

  const completion = await result.res.json();
  const rawContent: string | undefined = completion.choices?.[0]?.message?.content;

  const parsed = extractJsonObject(rawContent);
  if (!parsed) {
    return NextResponse.json(
      { error: "분석 결과를 해석하지 못했습니다.", detail: rawContent },
      { status: 502 },
    );
  }

  if (!parsed.description || typeof parsed.is_anomaly !== "boolean") {
    return NextResponse.json(
      { error: "분석 결과 형식이 올바르지 않습니다.", detail: rawContent },
      { status: 502 },
    );
  }

  const { error: insertError } = await supabase.from("behavior_analyses").insert({
    pet_id: petId,
    video_url: "client-frames",
    description: parsed.description,
    is_anomaly: parsed.is_anomaly,
  });

  if (insertError) {
    console.error("behavior_analyses insert error", insertError);
  }

  return NextResponse.json({
    description: parsed.description,
    isAnomaly: parsed.is_anomaly,
    reason: parsed.reason ?? null,
  });
}
