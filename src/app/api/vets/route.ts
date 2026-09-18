import { NextResponse } from "next/server";

type KakaoDocument = {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  distance: string;
  place_url: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "위치 정보가 필요합니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "카카오맵 API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", "동물병원");
  url.searchParams.set("x", lng);
  url.searchParams.set("y", lat);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("sort", "distance");
  url.searchParams.set("size", "15");

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Kakao Local API error", res.status, detail);
    return NextResponse.json(
      {
        error: "동물병원 검색에 실패했습니다.",
        status: res.status,
        detail,
      },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { documents: KakaoDocument[] };

  const vets = data.documents.map((doc) => ({
    id: doc.id,
    name: doc.place_name,
    address: doc.road_address_name || doc.address_name,
    phone: doc.phone || null,
    distance: doc.distance ? Number(doc.distance) : null,
    placeUrl: doc.place_url,
  }));

  return NextResponse.json({ vets });
}
