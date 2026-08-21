export function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container testimonials-layout">
        <div className="testimonials-intro">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            04 / Real Feedback
          </p>
          <h2 id="testimonials-title">Testimonials</h2>
          <p>Client and customer feedback is shown here only after publication approval.</p>
          <p className="testimonials-intro__note">
            <span aria-hidden="true" />
            Trust is published when it is real.
          </p>
        </div>

        <div className="testimonial-empty" aria-label="Testimonial content placeholder">
          <div className="testimonial-empty__top">
            <span>VERIFIED FEEDBACK</span>
            <span>CONTENT STATE / PENDING</span>
          </div>
          <div className="testimonial-empty__body">
            <div className="testimonial-empty__avatar" aria-hidden="true" />
            <div className="testimonial-empty__message">
              <h3>Approved feedback belongs here.</h3>
              <p>This component is ready for a real quote, name, role, company, and optional avatar or company mark.</p>
            </div>
          </div>
          <div className="testimonial-empty__slots" aria-label="Future testimonial component fields">
            <span>QUOTE</span>
            <span>ATTRIBUTION</span>
            <span>OPTIONAL AVATAR</span>
            <span>OPTIONAL COMPANY MARK</span>
          </div>
        </div>
      </div>
    </section>
  );
}
