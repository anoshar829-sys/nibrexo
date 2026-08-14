(() => {
  const body = document.body;
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  body.classList.add('js');

  const setHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  const setMenu = (open, restoreFocus = false) => {
    header.classList.toggle('is-menu-open', open);
    body.classList.toggle('is-menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.setAttribute('aria-hidden', String(!open));

    if (open) {
      window.requestAnimationFrame(() => mobileMenu.querySelector('a, button')?.focus());
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  menuToggle.addEventListener('click', () => {
    const opening = !header.classList.contains('is-menu-open');
    setMenu(opening, !opening);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-menu-open')) {
      setMenu(false, true);
    }
  });

  mobileMenu.querySelectorAll('button, a').forEach((element) => {
    element.addEventListener('click', () => setMenu(false));
  });

  // The hero content is already visible on first paint; the short entrance simply establishes hierarchy.
  window.requestAnimationFrame(() => {
    document.querySelectorAll('.hero-reveal').forEach((element) => element.classList.add('is-visible'));
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  // FAQ content is sourced from the public content manifest. The static HTML remains as a no-JS fallback.
  const faqContent = window.NibrexoContent?.faq;
  const faqList = document.getElementById('faq-list');
  if (faqList && Array.isArray(faqContent) && faqContent.length) {
    const categoryOrder = [...new Set(faqContent.map((item) => item.category))];
    const fragment = document.createDocumentFragment();
    const sourceNote = document.createElement('p');
    sourceNote.className = 'faq-source-note';
    sourceNote.textContent = 'The approved question set and answers are organized below by category.';
    fragment.appendChild(sourceNote);

    let index = 1;
    categoryOrder.forEach((category) => {
      const group = document.createElement('div');
      group.className = 'faq-category';
      const label = document.createElement('p');
      label.className = 'faq-category-label';
      label.textContent = category;
      group.appendChild(label);

      faqContent.filter((item) => item.category === category).forEach((item) => {
        const article = document.createElement('article');
        article.className = 'faq-item';
        article.dataset.faqId = item.id;
        const heading = document.createElement('h3');
        const button = document.createElement('button');
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;
        button.type = 'button';
        button.id = questionId;
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', answerId);
        const question = document.createElement('span');
        question.textContent = item.question;
        const toggle = document.createElement('span');
        toggle.className = 'faq-toggle';
        toggle.setAttribute('aria-hidden', 'true');
        button.append(question, toggle);
        heading.appendChild(button);

        const answer = document.createElement('div');
        answer.className = 'faq-answer';
        answer.id = answerId;
        answer.hidden = true;
        answer.setAttribute('role', 'region');
        answer.setAttribute('aria-labelledby', questionId);
        const answerInner = document.createElement('div');
        const answerText = document.createElement('p');
        answerText.textContent = item.answer;
        answerInner.appendChild(answerText);
        (item.links || []).forEach((link) => {
          const policyLink = document.createElement('a');
          policyLink.className = 'faq-policy-link';
          policyLink.href = link.href;
          policyLink.textContent = link.label;
          answerInner.appendChild(policyLink);
        });
        answer.appendChild(answerInner);
        article.append(heading, answer);
        group.appendChild(article);
        index += 1;
      });
      fragment.appendChild(group);
    });
    faqList.replaceChildren(fragment);
  }

  // FAQ: a single, keyboard-native accordion. Buttons carry the state for assistive technology.
  const accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll('.faq-item'));

    const closeItem = (item) => {
      const button = item.querySelector('button[aria-expanded]');
      const panel = item.querySelector('.faq-answer');
      if (!button || !panel || button.getAttribute('aria-expanded') !== 'true') return;

      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      window.setTimeout(() => {
        if (button.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      }, 250);
    };

    const openItem = (item) => {
      const button = item.querySelector('button[aria-expanded]');
      const panel = item.querySelector('.faq-answer');
      if (!button || !panel) return;

      items.forEach((otherItem) => {
        if (otherItem !== item) closeItem(otherItem);
      });

      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(() => item.classList.add('is-open'));
    };

    items.forEach((item) => {
      const button = item.querySelector('button[aria-expanded]');
      button.addEventListener('click', () => {
        if (button.getAttribute('aria-expanded') === 'true') {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });
  }

  // Newsletter UI states are ready for a future service integration. This preview never claims a subscription succeeded.
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    const emailInput = document.getElementById('newsletter-email');
    const newsletterStatus = document.getElementById('newsletter-status');

    const setNewsletterState = (state, message) => {
      newsletterForm.classList.remove('is-error', 'is-loading', 'is-unavailable', 'is-success');
      newsletterForm.setAttribute('aria-busy', String(state === 'loading'));
      newsletterStatus.className = 'newsletter-status is-visible';
      newsletterStatus.classList.add(`is-${state}`);
      newsletterStatus.textContent = message;
      newsletterForm.classList.add(`is-${state}`);
    };

    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!emailInput.value.trim() || !emailInput.validity.valid) {
        setNewsletterState('error', 'Enter a valid email address.');
        emailInput.focus();
        return;
      }

      setNewsletterState('unavailable', 'Email service is not configured. Your email has not been sent or stored.');
    });

    emailInput.addEventListener('input', () => {
      if (newsletterForm.classList.contains('is-error')) {
        newsletterForm.classList.remove('is-error');
        newsletterStatus.classList.remove('is-visible', 'is-error');
      }
    });

    // A future configured email service can call these only around a real provider request/response.
    window.nibrexoNewsletterLoading = () => {
      setNewsletterState('loading', 'Submitting your email…');
    };
    window.nibrexoNewsletterSuccess = () => {
      setNewsletterState('success', 'Subscription confirmed.');
    };
  }

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 640);
    };

    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
