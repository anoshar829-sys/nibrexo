export type FaqLink = {
  label: string;
  href: string;
};

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  links: FaqLink[];
};

export const faqItems: FaqItem[] = [
  {
    id: "orders-receive-after-purchase",
    category: "ORDERS & DELIVERY",
    question: "What do I receive after purchase?",
    answer: "You'll receive instant access to your digital product unless stated otherwise.",
    links: [],
  },
  {
    id: "orders-physical-product",
    category: "ORDERS & DELIVERY",
    question: "Is this a physical product?",
    answer: "No. All products are delivered digitally.",
    links: [],
  },
  {
    id: "orders-receive-files",
    category: "ORDERS & DELIVERY",
    question: "How will I receive my files?",
    answer: "Your download instructions will be available after your purchase.",
    links: [],
  },
  {
    id: "orders-download-again",
    category: "ORDERS & DELIVERY",
    question: "Can I download my product again?",
    answer: "Yes, if your account or purchase history includes download access.",
    links: [],
  },
  {
    id: "payments-methods",
    category: "PAYMENTS",
    question: "What payment methods do you accept?",
    answer: "Available payment methods are shown during checkout.",
    links: [],
  },
  {
    id: "payments-security",
    category: "PAYMENTS",
    question: "Is my payment secure?",
    answer: "Yes. Payments are processed through trusted payment providers.",
    links: [],
  },
  {
    id: "license-purchase-includes",
    category: "LICENSE",
    question: "What does my purchase include?",
    answer: "Your purchase includes a license to use the product, not ownership.",
    links: [{ label: "Digital Product License Agreement", href: "/legal/digital-product-license-agreement" }],
  },
  {
    id: "license-commercial-use",
    category: "LICENSE",
    question: "Can I use products commercially?",
    answer: "Yes, if your purchased license includes commercial rights.",
    links: [{ label: "Digital Product License Agreement", href: "/legal/digital-product-license-agreement" }],
  },
  {
    id: "license-customize",
    category: "LICENSE",
    question: "Can I edit or customize the product?",
    answer: "Yes. You may customize it for your own projects.",
    links: [],
  },
  {
    id: "license-share-files",
    category: "LICENSE",
    question: "Can I share the files with others?",
    answer: "No. Licenses are non-transferable unless stated otherwise.",
    links: [{ label: "Digital Product License Agreement", href: "/legal/digital-product-license-agreement" }],
  },
  {
    id: "license-resell",
    category: "LICENSE",
    question: "Can I resell your products?",
    answer: "No. Reselling or redistributing our original files is prohibited.",
    links: [{ label: "Digital Product License Agreement", href: "/legal/digital-product-license-agreement" }],
  },
  {
    id: "refunds-available",
    category: "REFUNDS",
    question: "Do you offer refunds?",
    answer: "Please refer to our Refund Policy before requesting one.",
    links: [{ label: "Refund Policy", href: "/legal/refund-policy" }],
  },
  {
    id: "refunds-wrong-product",
    category: "REFUNDS",
    question: "What if I bought the wrong product?",
    answer: "Contact us as soon as possible. We'll review your request fairly.",
    links: [],
  },
  {
    id: "refunds-file-not-work",
    category: "REFUNDS",
    question: "What if my file doesn't work?",
    answer: "We'll help resolve the issue. If we can't, we'll review your case under our Refund Policy.",
    links: [{ label: "Refund Policy", href: "/legal/refund-policy" }],
  },
  {
    id: "updates-product-updates",
    category: "UPDATES & SUPPORT",
    question: "Do products receive updates?",
    answer: "If updates are included, they'll be mentioned on the product page.",
    links: [],
  },
  {
    id: "updates-technical-support",
    category: "UPDATES & SUPPORT",
    question: "Do you provide technical support?",
    answer: "Yes. We help with product-related questions and technical issues.",
    links: [],
  },
  {
    id: "updates-custom-work",
    category: "UPDATES & SUPPORT",
    question: "Do you offer custom work?",
    answer: "Only if it's listed as an available service.",
    links: [],
  },
  {
    id: "privacy-sell-data",
    category: "PRIVACY & SECURITY",
    question: "Do you sell my personal information?",
    answer: "No. We never sell your personal data.",
    links: [{ label: "Privacy Policy", href: "/legal/privacy-policy" }],
  },
  {
    id: "privacy-cookies",
    category: "PRIVACY & SECURITY",
    question: "Why do you use cookies?",
    answer: "To improve website functionality and understand how visitors use our site.",
    links: [{ label: "Cookie Policy", href: "/legal/cookie-policy" }],
  },
  {
    id: "legal-copyright",
    category: "LEGAL",
    question: "Who owns the copyright?",
    answer: "We retain ownership of all copyrights and intellectual property.",
    links: [{ label: "Copyright & Trademark Policy", href: "/legal/copyright-and-trademark-policy" }],
  },
  {
    id: "legal-brand-assets",
    category: "LEGAL",
    question: "Can I use your logo or brand assets?",
    answer: "Only with our written permission.",
    links: [{ label: "Copyright & Trademark Policy", href: "/legal/copyright-and-trademark-policy" }],
  },
  {
    id: "legal-ai-training",
    category: "LEGAL",
    question: "Can your products be used for AI training?",
    answer: "No, unless we provide written permission.",
    links: [{ label: "Digital Product License Agreement", href: "/legal/digital-product-license-agreement" }],
  },
  {
    id: "general-contact-support",
    category: "GENERAL",
    question: "How do I contact support?",
    answer: "Use our official support channels listed on the website.",
    links: [],
  },
  {
    id: "general-policies",
    category: "GENERAL",
    question: "Where can I read your policies?",
    answer: "Visit our Legal Center for all policies and agreements.",
    links: [{ label: "Legal Center", href: "/legal" }],
  },
  {
    id: "general-still-question",
    category: "GENERAL",
    question: "I still have a question. What should I do?",
    answer: "Contact our support team—we're happy to help.",
    links: [],
  },
];
