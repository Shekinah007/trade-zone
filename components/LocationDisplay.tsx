// 'use client'
// import { useGeolocation } from '@/lib/hooks/useGeolocation'

// export default function LocationDisplay() {
//   const { location, error, loading } = useGeolocation()

//   if (loading) return <p>Requesting location...</p>
//   if (error) return <p>Error: {error}</p>

//   return (
//     <div>
//       <p>Latitude: {location?.lat}</p>
//       <p>Longitude: {location?.lng}</p>
//       <p>Accuracy: ±{location?.accuracy}m</p>
//     </div>
//   )
// }

'use client'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { useEffect, useState } from 'react'

export default function FullLocation() {
  const { location, error, loading } = useGeolocation()
  const [address, setAddress] = useState<{city: string, state: string, country: string, display: string} | null>(null)

  useEffect(() => {
    if (!location) return
    fetch(`/api/reverse-geocode?lat=${location.lat}&lng=${location.lng}`)
      .then(r => r.json())
      .then(setAddress)
  }, [location])

  if (loading) return <p>Getting location...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <p>Coordinates: {location?.lat}, {location?.lng}</p>
      <p>Accuracy: ±{location?.accuracy}m</p>
      <p>Location: {address?.display}</p>
      {address && (
        <>
          <p>City: {address?.city}</p>
          <p>State: {address?.state}</p>
          <p>Country: {address?.country}</p>
          <p>Full: {address?.display}</p>
        </>
      )}
    </div>
  )
}