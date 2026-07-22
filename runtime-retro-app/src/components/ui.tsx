import React from "react";
import { Link } from "../router.tsx";

export function Kicker({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <span className="kicker">{children}</span>;
}

export function PageTitle({
  title,
  status,
}: {
  title: string;
  status?: string;
}): React.JSX.Element {
  return (
    <div className="page-title">
      <h1>{title}</h1>
      {status && <span>{status}</span>}
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  description,
  status,
}: {
  kicker: string;
  title: string;
  description?: string;
  status?: string;
}): React.JSX.Element {
  return (
    <>
      <Kicker>{kicker}</Kicker>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {status && <span>{status}</span>}
      </div>
    </>
  );
}

export function GamePill({
  to,
  title,
  system,
  featured = false,
}: {
  to: string;
  title: string;
  system: string;
  featured?: boolean;
}): React.JSX.Element {
  return (
    <Link to={to} className={`example-pill${featured ? " featured" : ""}`}>
      {title}
      <small>{system}</small>
    </Link>
  );
}
