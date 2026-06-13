import { EmptyState } from "../ui/EmptyState";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="content-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Module</p>
          <h2>{title}</h2>
        </div>
      </div>
      <EmptyState
        title={`${title} foundation ready`}
        description="This route is wired into the application shell and ready for the next implementation day."
      />
    </section>
  );
}

