export function CoreStory() {
  return (
    <section className="core-story" id="core-story" aria-labelledby="core-story-title">
      <div className="container">
        <div className="core-story__intro">
          <p className="eyebrow eyebrow--center">
            <span className="eyebrow-line" />
            01 / The Core Story
          </p>
          <h2 id="core-story-title">Understanding through visual communication.</h2>
          <p>Nibrexo communicates understanding through visual communication and purposeful visual systems.</p>
        </div>

        <div className="story-problem-grid">
          <article className="story-statement story-statement--problem">
            <div className="story-statement__meta">
              <span>01</span>
              <span>THE PROBLEM</span>
            </div>
            <h3>When information lacks hierarchy, the next step is harder to see.</h3>
            <p>
              Clarity matters because attention is limited. What appears first, what
              supports it, and what leads forward should work together.
            </p>
          </article>

          <div
            className="story-compare"
            aria-label="Visual comparison of scattered information becoming a clear visual system"
          >
            <div className="compare-label">
              <span>VISUAL PROGRESSION</span>
              <span>01—02</span>
            </div>
            <div className="compare-grid">
              <div className="compare-panel compare-panel--before" aria-hidden="true">
                <span className="panel-label">WITHOUT HIERARCHY</span>
                <i className="before-card before-card--one" />
                <i className="before-card before-card--two" />
                <i className="before-card before-card--three" />
                <i className="before-card before-card--four" />
                <span className="before-line before-line--one" />
                <span className="before-line before-line--two" />
                <span className="before-line before-line--three" />
              </div>
              <div className="compare-divider" aria-hidden="true">
                <span>→</span>
              </div>
              <div className="compare-panel compare-panel--after" aria-hidden="true">
                <span className="panel-label">WITH PURPOSE</span>
                <div className="after-heading" />
                <div className="after-copy">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="after-actions">
                  <span />
                  <span />
                </div>
                <div className="after-footer">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="story-steps">
          <article className="story-step">
            <div className="story-step__index">02</div>
            <div className="story-step__visual story-step__visual--matter" aria-hidden="true">
              <span />
              <i />
              <b />
            </div>
            <div className="story-step__content">
              <p className="step-label">WHY IT MATTERS</p>
              <h3>Clarity is not decoration.</h3>
              <p>It makes meaning easier to find and gives people a more confident way forward.</p>
            </div>
          </article>
          <article className="story-step story-step--reverse">
            <div className="story-step__index">03</div>
            <div className="story-step__visual story-step__visual--visual" aria-hidden="true">
              <div>
                <i />
                <i />
                <i />
              </div>
              <span />
              <b />
            </div>
            <div className="story-step__content">
              <p className="step-label">HOW VISUAL COMMUNICATION HELPS</p>
              <h3>Give every idea a clear place.</h3>
              <p>
                Shape, spacing, typography, and sequence can guide attention before a
                user has to search for it.
              </p>
            </div>
          </article>
          <article className="story-step">
            <div className="story-step__index">04</div>
            <div className="story-step__visual story-step__visual--system" aria-hidden="true">
              <div className="system-node system-node--one" />
              <div className="system-node system-node--two" />
              <div className="system-node system-node--three" />
              <i />
              <b />
            </div>
            <div className="story-step__content">
              <p className="step-label">THE NIBREXO APPROACH</p>
              <h3>Build the system around the understanding.</h3>
              <p>Purposeful visual systems keep the message, the experience, and the next action connected.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
