"use client";

import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Content fades in as loader fades out (at ~800ms)
    const timer = setTimeout(() => setContentVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        opacity: contentVisible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
    >
      {children}
    </div>
  );
}
///////////////////////////////////////////////////////////////////
// "use client";

// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function PageTransition({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const [visible, setVisible] = useState(false);
//   const [displayChildren, setDisplayChildren] = useState(children);

//   // Initial load — fade in after loader
//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(true), 900);
//     return () => clearTimeout(timer);
//   }, []);

//   // Route change — fade out, swap content, fade back in
//   useEffect(() => {
//     setVisible(false);
//     const swapTimer = setTimeout(() => {
//       setDisplayChildren(children);
//       setVisible(true);
//     }, 400); // matches the fade duration below
//     return () => clearTimeout(swapTimer);
//   }, [pathname]);

//   return (
//     <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
//       {displayChildren}
//     </div>
//   );
// }
// "use client";

// import { usePathname } from "next/navigation";
// import { useEffect, useRef, useState } from "react";

// export default function PageTransition({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const [visible, setVisible] = useState(false);
//   const [displayChildren, setDisplayChildren] = useState(children);
//   const isFirstRender = useRef(true);

//   // Initial load — fade in after loader
//   useEffect(() => {
//     const timer = setTimeout(() => setVisible(true), 900);
//     return () => clearTimeout(timer);
//   }, []);

//   // Route change — skip first render, then fade out → swap → fade in
//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }

//     setVisible(false);
//     const swapTimer = setTimeout(() => {
//       setDisplayChildren(children);
//       setVisible(true);
//     }, 400);

//     return () => clearTimeout(swapTimer);
//   }, [pathname]);

//   return (
//     <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}>
//       {displayChildren}
//     </div>
//   );
// }
