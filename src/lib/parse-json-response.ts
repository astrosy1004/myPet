// 일부 모델은 response_format(json_object)을 지원하지 않거나 코드펜스로
// 감싸서 응답하는 경우가 있어, 텍스트에서 JSON 객체를 직접 추출한다.
export function extractJsonObject(
  raw: string | undefined | null,
): Record<string, unknown> | null {
  if (!raw) return null;

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}
