import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";

export type EditorialTestimonial = {
  quote: string;
  author: string;
  role: string;
  company?: string;
  image?: string;
};

type Props = {
  items: EditorialTestimonial[];
  emptyTitle?: string;
  emptyText?: string;
};

export function EditorialTestimonials({
  items,
  emptyTitle = "Пока что нет отзывов",
  emptyText = "Вы можете стать первыми — напишите нам после внедрения DoubleMark на линии.",
}: Props) {
  const [active, setActive] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (items.length === 0) {
    return (
      <div className="editorial-testimonials editorial-testimonials-empty">
        <div className="editorial-empty-icon" aria-hidden="true">
          <MessageSquareQuote size={28} />
        </div>
        <p className="editorial-index" aria-hidden="true">
          01
        </p>
        <blockquote className="editorial-quote">
          {emptyTitle}
        </blockquote>
        <p className="editorial-empty-text">{emptyText}</p>
      </div>
    );
  }

  const handleChange = (index: number) => {
    if (index === active || isTransitioning) return;
    setIsTransitioning(true);
    window.setTimeout(() => {
      setActive(index);
      window.setTimeout(() => setIsTransitioning(false), 50);
    }, 280);
  };

  const handlePrev = () => {
    handleChange(active === 0 ? items.length - 1 : active - 1);
  };

  const handleNext = () => {
    handleChange(active === items.length - 1 ? 0 : active + 1);
  };

  const current = items[active];

  return (
    <div className="editorial-testimonials">
      <div className="editorial-testimonials-body">
        <span className="editorial-index" style={{ fontFeatureSettings: '"tnum"' }}>
          {String(active + 1).padStart(2, "0")}
        </span>

        <div className="editorial-testimonials-main">
          <blockquote
            className={`editorial-quote${isTransitioning ? " is-leaving" : ""}`}
          >
            {current.quote}
          </blockquote>

          <div className={`editorial-author${isTransitioning ? " is-leaving" : ""}`}>
            {current.image ? (
              <img
                src={current.image}
                alt=""
                className="editorial-avatar"
                width={48}
                height={48}
              />
            ) : (
              <div className="editorial-avatar editorial-avatar-fallback" aria-hidden="true">
                {current.author.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="editorial-author-name">{current.author}</p>
              <p className="editorial-author-meta">
                {current.role}
                {current.company ? (
                  <>
                    <span className="editorial-sep">/</span>
                    <span>{current.company}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="editorial-nav">
        <div className="editorial-nav-left">
          <div className="editorial-dots" role="tablist" aria-label="Отзывы">
            {items.map((item, index) => (
              <button
                key={`${item.author}-${index}`}
                type="button"
                role="tab"
                aria-selected={index === active}
                className={index === active ? "is-active" : undefined}
                onClick={() => handleChange(index)}
                aria-label={`Отзыв ${index + 1}`}
              />
            ))}
          </div>
          <span className="editorial-counter">
            {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>
        <div className="editorial-arrows">
          <button type="button" onClick={handlePrev} aria-label="Предыдущий отзыв">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={handleNext} aria-label="Следующий отзыв">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
