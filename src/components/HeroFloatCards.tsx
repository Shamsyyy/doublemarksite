import { CheckCircle2, Globe2, Printer, ScanLine } from "lucide-react";

export function HeroFloatCards() {
  return (
    <div className="cos-float-layer" aria-hidden="true">
      <div className="cos-float cos-float-pill cos-float-tl cos-float-drift cos-float-drift-a">
        <span className="cos-float-icon cos-float-icon-check">
          <CheckCircle2 size={16} strokeWidth={2.25} />
        </span>
        <span className="cos-float-pill-text">GS1 совместимость</span>
        <span className="cos-float-avatars">
          <span>01</span>
          <span>21</span>
          <span>91</span>
          <span className="cos-float-avatars-more">+92</span>
        </span>
      </div>

      <div className="cos-float cos-float-pill cos-float-tr cos-float-drift cos-float-drift-b">
        <span className="cos-float-icon">
          <Globe2 size={15} strokeWidth={2} />
        </span>
        <span className="cos-float-pill-text">Сканеры и принтеры</span>
        <span className="cos-float-tags">
          <span>COM</span>
          <span>HID</span>
          <span>ZPL</span>
          <span className="cos-float-tags-more">+4</span>
        </span>
      </div>

      <div className="cos-float cos-float-card cos-float-bl cos-float-drift cos-float-drift-c">
        <div className="cos-float-card-head">
          <div className="cos-float-icon cos-float-icon-scan" aria-hidden="true">
            <ScanLine size={14} strokeWidth={2.25} />
          </div>
          <div>
            <strong>Сканирование</strong>
            <span>1 284 кодов</span>
          </div>
        </div>
        <div className="cos-float-progress">
          <div className="cos-float-progress-bar">
            <span style={{ width: "92%" }} />
          </div>
          <em>92%</em>
        </div>
        <div className="cos-float-card-meta">
          <span>DataMatrix</span>
          <strong>&lt; 1.2 с</strong>
        </div>
      </div>

      <div className="cos-float cos-float-card cos-float-card-wide cos-float-br cos-float-drift cos-float-drift-d">
        <div className="cos-float-card-head">
          <div className="cos-float-icon cos-float-icon-print" aria-hidden="true">
            <Printer size={14} strokeWidth={2.25} />
          </div>
          <div>
            <strong>Печать дубля</strong>
            <span>скан → принтер</span>
          </div>
        </div>
        <div className="cos-float-card-row">
          <span className="cos-float-chip">Склад</span>
          <span className="cos-float-chip">Линия</span>
          <span className="cos-float-chip cos-float-chip-muted">онлайн</span>
          <span className="cos-float-chip cos-float-chip-accent">&lt; 2 с</span>
        </div>
      </div>
    </div>
  );
}
