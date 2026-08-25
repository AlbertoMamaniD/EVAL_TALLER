import type { ReactNode } from "react";

type PageLayoutProps = {
  bodyClassName?: string;
  children: ReactNode;
  description: string;
  eyebrow: string;
  feedback?: ReactNode;
  title: string;
};

function PageLayout({
  bodyClassName,
  children,
  description,
  eyebrow,
  feedback,
  title
}: PageLayoutProps) {
  const contentClassName = bodyClassName
    ? `page-layout-body ${bodyClassName}`
    : "page-layout-body";

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-copy">{description}</p>
      </section>

      {feedback}

      <div className={contentClassName}>{children}</div>
    </main>
  );
}

export { PageLayout };
