import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = ["hunger", "discomfort", "attention", "calm"] as const;
type SoundCategory = (typeof CATEGORIES)[number];

const MIME_TO_FORMAT: Record<string, "wav" | "mp3"> = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
};

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

  const formData = await request.formData();
  const petId = String(formData.get("pet_id") ?? "");
  const species = String(formData.get("species") ?? "cat");
  const audio = formData.get("audio") as File | null;

  if (!petId || !audio) {
    return NextResponse.json(
      { error: "필수 데이터가 누락되었습니다." },
      { status: 400 },
    );
  }

  const format = MIME_TO_FORMAT[audio.type];
  if (!format) {
    return NextResponse.json(
      { error: "mp3 또는 wav 형식의 오디오만 지원합니다." },
      { status: 400 },
    );
  }

  const arrayBuffer = await audio.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");
  const speciesLabel = species === "dog" ? "강아지" : "고양이";

  const completionRes = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-audio-preview",
        modalities: ["text"],
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              '너는 반려동물 울음소리를 듣고 감정 상태를 추정하는 도우미다. 반드시 다음 JSON 형식으로만 답하라: {"category": "hunger" | "discomfort" | "attention" | "calm" 중 하나, "confidence": 0-100 사이 정수, "reason": 한 문장 한국어 설명}. 이 추정은 참고용이며 수의학적 진단이 아니다.',
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `이 ${speciesLabel}의 울음소리 톤과 리듬을 분석해서 감정 상태를 추정해줘.`,
              },
              {
                type: "input_audio",
                input_audio: { data: base64Audio, format },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!completionRes.ok) {
    const detail = await completionRes.text();
    console.error("OpenAI API error", completionRes.status, detail);
    return NextResponse.json(
      { error: "울음 해석에 실패했습니다.", status: completionRes.status, detail },
      { status: 502 },
    );
  }

  const completion = await completionRes.json();
  const rawContent: string | undefined = completion.choices?.[0]?.message?.content;

  let parsed: { category?: string; confidence?: number; reason?: string };
  try {
    parsed = JSON.parse(rawContent ?? "{}");
  } catch {
    return NextResponse.json(
      { error: "분석 결과를 해석하지 못했습니다.", detail: rawContent },
      { status: 502 },
    );
  }

  const category = CATEGORIES.includes(parsed.category as SoundCategory)
    ? (parsed.category as SoundCategory)
    : null;
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
      : null;

  if (!category || confidence === null) {
    return NextResponse.json(
      { error: "분석 결과 형식이 올바르지 않습니다.", detail: rawContent },
      { status: 502 },
    );
  }

  const path = `${user.id}/${petId}/${Date.now()}.${format}`;
  await supabase.storage.from("pet-sounds").upload(path, audio, { upsert: true });

  const { error: insertError } = await supabase.from("sound_analyses").insert({
    pet_id: petId,
    audio_url: path,
    predicted_category: category,
    confidence,
  });

  if (insertError) {
    console.error("sound_analyses insert error", insertError);
  }

  return NextResponse.json({ category, confidence, reason: parsed.reason ?? null });
}
