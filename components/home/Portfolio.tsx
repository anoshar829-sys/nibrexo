export function Portfolio() {
  return (
    <section className="portfolio-section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="container">
        <div className="portfolio-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              02 / Selected Visual Work
            </p>
            <h2 id="portfolio-title">
              Featured <span className="editorial-accent">Portfolio</span>
            </h2>
          </div>
          <p>Approved case studies and selected visual work are shown here only after publication approval.</p>
        </div>

        <article className="featured-work">
          <div className="featured-work__surface">
            <div className="featured-work__visual" aria-hidden="true">
              <div className="work-visual__header">
                <span>PROJECT FRAME</span>
                <span>01</span>
              </div>
              <div className="work-visual__rail">
                <i />
                <i />
                <i />
              </div>
              <div className="work-visual__canvas">
                <div className="work-visual__mark" />
                <div className="work-visual__copy">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="work-visual__button" />
              </div>
              <div className="work-visual__side-card">
                <span />
                <i />
                <i />
                <b />
              </div>
              <div className="work-visual__note">VISUAL SYSTEM</div>
            </div>
            <div className="featured-work__body">
              <div className="work-label">
                <span>FEATURED CASE STUDY</span>
                <span>01 / 03</span>
              </div>
              <h3>Approved work pending</h3>
              <p>This space is reserved for an approved project visual, category, and contextual summary.</p>
              <span className="work-status">APPROVED CONTENT PENDING</span>
            </div>
          </div>
        </article>

        <div className="portfolio-support-grid">
          <article className="portfolio-support-card">
            <div className="portfolio-support-card__surface">
              <div className="support-visual support-visual--one" aria-hidden="true">
                <span>SELECTED / 02</span>
                <div className="support-visual__cover">
                  <i />
                  <i />
                  <i />
                </div>
                <b />
              </div>
              <div className="support-card__body">
                <p className="work-label">
                  <span>CASE STUDY PLACEHOLDER</span>
                  <span>02</span>
                </p>
                <h3>Project title pending</h3>
                <span>Approved work preview</span>
              </div>
            </div>
          </article>
          <article className="portfolio-support-card">
            <div className="portfolio-support-card__surface">
              <div className="support-visual support-visual--two" aria-hidden="true">
                <span>SELECTED / 03</span>
                <div className="support-visual__columns">
                  <i />
                  <i />
                  <i />
                </div>
                <b />
              </div>
              <div className="support-card__body">
                <p className="work-label">
                  <span>CASE STUDY PLACEHOLDER</span>
                  <span>03</span>
                </p>
                <h3>Project title pending</h3>
                <span>Approved work preview</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
