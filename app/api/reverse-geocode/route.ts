// app/api/reverse-geocode/route.js
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  // Using OpenStreetMap Nominatim (free, no API key)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'User-Agent': 'YourAppName/1.0' } } // required by Nominatim
  )

  const data = await res.json()
  console.log(data)
  return Response.json({
    display: data.display_name,
    city: data.address.city || data.address.town,
    state: data.address.state,
    country: data.address.country,
    postcode: data.address.postcode,
  })
}