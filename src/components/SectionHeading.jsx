function SectionHeading({ eyebrow, title, description, as: Tag = "h1" }) {
  return (
    <header className="section-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div>
        <Tag>{title}</Tag>
        {description && <p className="section-description">{description}</p>}
      </div>
    </header>
  );
}

export default SectionHeading;
