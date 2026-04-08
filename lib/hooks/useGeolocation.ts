// "use client";

// import { useEffect, useState } from "react";

// export function useGeolocation() {
//   const [location, setLocation] = useState<{
//     lat: number;
//     lng: number;
//     error?: string;
//   } | null>(null);

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setLocation({ lat: 0, lng: 0, error: "Not supported" });
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLocation({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         });
//       },
//       (err) => {
//         setLocation({
//           lat: 0,
//           lng: 0,
//           error: err.message,
//         });
//       }
//     );
//   }, []);

//   return location;
// }

// hooks/useGeolocation.js
import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    altitude: number | null;
    error?: string;
  } | null>(null);
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy, // in meters
          altitude: position.coords.altitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true, // uses GPS instead of WiFi/cell
        timeout: 10000,           // fail after 10s
        maximumAge: 0,            // don't use cached position
      }
    )
  }, [])

  return { location, error, loading }
}