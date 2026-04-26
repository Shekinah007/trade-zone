// app/api/reverse-geocode/route.js
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  // Using OpenStreetMap Nominatim (free, no API key)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "User-Agent": "FindMaster/1.0 (savwal@savwal.com)" } }, // required by Nominatim
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(`Geocoding failed: ${res.status} - ${text}`);
    return Response.json(
      { error: "Geocoding service unavailable" },
      { status: 502 },
    );
  }

  try {
    const data = await res.json();
    return Response.json({
      display: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country,
      postcode: data.address?.postcode,
    });
  } catch (err) {
    console.error("Failed to parse geocoding response", err);
    return Response.json(
      { error: "Invalid response from geocoding service" },
      { status: 502 },
    );
  }
}
