"use client";
import Link, { LinkProps } from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const TransitionLink: React.FC<TransitionLinkProps> = ({
  children,
  href,
  className,
  ...props
}) => {
  const router = useRouter();

  const handleTransition = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.preventDefault();
    const mainContainer = document.querySelector(".main-container");

    mainContainer?.classList.add("page-transition");

    await sleep(500);
    router.push(href);
    await sleep(500);

    mainContainer?.classList.remove("page-transition");
  };

  return (
    <Link
      {...props}
      href={href}
      onClick={handleTransition}
      className={className}
    >
      {children}
    </Link>
  );
};
