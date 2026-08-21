"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { faqItems } from "@/lib/content/faq";

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(faqItems.map((item) => item.category))], []);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-container">
        <div className="faq-heading">
          <p className="eyebrow eyebrow--center">
            <span className="eyebrow-line" />
            05 / Clear Answers
          </p>
          <h2 id="faq-title">Frequently Asked Questions</h2>
          <p>Answers will only be published after policy and process information is formally verified.</p>
        </div>

        <div className="faq-list">
          <p className="faq-source-note">
            The approved question set and answers are organized below by category.
          </p>
          {categories.map((category) => (
            <div className="faq-category" key={category}>
              <p className="faq-category-label">{category}</p>
              {faqItems
                .filter((item) => item.category === category)
                .map((item) => {
                  const questionId = `faq-question-${item.id}`;
                  const answerId = `faq-answer-${item.id}`;
                  const isOpen = openId === item.id;

                  return (
                    <article className={isOpen ? "faq-item is-open" : "faq-item"} key={item.id}>
                      <h3>
                        <button
                          type="button"
                          id={questionId}
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                        >
                          <span>{item.question}</span>
                          <span className="faq-toggle" aria-hidden="true" />
                        </button>
                      </h3>
                      <div
                        className="faq-answer"
                        id={answerId}
                        role="region"
                        aria-labelledby={questionId}
                        hidden={!isOpen}
                      >
                        <div>
                          <p>{item.answer}</p>
                          {item.links.map((link) => (
                            <Link className="faq-policy-link" href={link.href} key={`${item.id}-${link.href}`}>
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
