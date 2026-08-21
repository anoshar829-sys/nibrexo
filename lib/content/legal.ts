export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  lists?: { intro?: string; introClass?: "policy-subhead"; items: string[] }[];
};

export type LegalPolicy = {
  slug: string;
  number: string;
  title: string;
  cardSummary: string;
  description: string;
  version: string;
  lead: string;
  sections: PolicySection[];
};

export const legalPolicies: LegalPolicy[] = [
  {
    slug: "terms-and-conditions",
    number: "01 / POLICY",
    title: "Terms & Conditions",
    cardSummary: "Simple rules for using our products and services.",
    description: "Terms & Conditions — Nibrexo",
    version: "Version: 1.0",
    lead: "These Terms explain how you can use our products and services, and what both you and we agree to when you make a purchase or use our platform.",
    sections: [
      {
        heading: "1. Acceptance",
        lists: [
          {
            items: [
              "Using our website or purchasing any product means you agree to these Terms.",
              "If you disagree with any part, please do not use our services.",
            ],
          },
        ],
      },
      {
        heading: "2. Digital Products",
        lists: [
          {
            items: [
              "All products are delivered digitally.",
              "No physical items are shipped unless clearly stated.",
              "Product descriptions explain what is included.",
            ],
          },
        ],
      },
      {
        heading: "3. Orders & Payment",
        lists: [
          {
            items: [
              "Full payment is required before delivery.",
              "Prices may change without prior notice.",
              "Orders confirmed before a price change are not affected.",
            ],
          },
        ],
      },
      {
        heading: "4. Your License",
        lists: [
          {
            items: [
              "Your purchase gives you a license to use the product, not ownership.",
              "License details are explained in our Digital Product License Agreement.",
            ],
          },
        ],
      },
      {
        heading: "5. Acceptable Use",
        lists: [
          {
            intro: "You may:",
            introClass: "policy-subhead",
            items: [
              "Use the product according to your license.",
              "Create projects using permitted assets.",
              "Contact us for support when needed.",
            ],
          },
          {
            intro: "You may not:",
            introClass: "policy-subhead",
            items: [
              "Resell our products.",
              "Share download files.",
              "Claim our work as your own.",
              "Remove copyright or branding where prohibited.",
            ],
          },
        ],
      },
      {
        heading: "6. Account Responsibility",
        lists: [
          {
            items: [
              "Keep your account information secure.",
              "You are responsible for activity under your account.",
            ],
          },
        ],
      },
      {
        heading: "7. Updates",
        lists: [
          {
            items: [
              "Some products may receive updates.",
              "Update availability depends on the product description.",
            ],
          },
        ],
      },
      {
        heading: "8. Support",
        lists: [
          {
            items: [
              "Support covers product-related questions.",
              "Custom work, training, or consulting is not included unless purchased separately.",
            ],
          },
        ],
      },
      {
        heading: "9. Intellectual Property",
        lists: [
          {
            items: [
              "All content remains our intellectual property unless stated otherwise.",
              "Purchasing a product does not transfer copyright.",
            ],
          },
        ],
      },
      {
        heading: "10. Refunds",
        lists: [
          {
            items: [
              "Refund requests are handled according to our Refund Policy.",
              "Digital products may have different refund conditions than physical goods.",
            ],
          },
        ],
      },
      {
        heading: "11. Limitation of Liability",
        lists: [
          {
            items: [
              "We work to provide accurate, high-quality products.",
              "We are not responsible for losses caused by misuse, unauthorized modification, or use outside the product's intended purpose.",
            ],
          },
        ],
      },
      {
        heading: "12. Suspension & Termination",
        paragraphs: ["We may suspend or terminate access if you:"],
        lists: [
          {
            items: [
              "Violate these Terms.",
              "Abuse our services.",
              "Attempt fraud or unauthorized access.",
              "Distribute our products illegally.",
            ],
          },
        ],
      },
      {
        heading: "13. Changes to These Terms",
        lists: [
          {
            items: [
              "We may update these Terms when necessary.",
              "The latest version will always replace previous versions.",
            ],
          },
        ],
      },
      {
        heading: "14. Contact",
        paragraphs: ["Questions about these Terms can be sent through our official support channels."],
      },
    ],
  },
  {
    slug: "privacy-policy",
    number: "02 / POLICY",
    title: "Privacy Policy",
    cardSummary: "We respect your privacy.",
    description: "Privacy Policy — Nibrexo",
    version: "Version: 1.0",
    lead: "Your privacy matters. This policy explains what information we collect, why we collect it, and how we protect it.",
    sections: [
      {
        heading: "1. Information We Collect",
        paragraphs: ["We may collect:"],
        lists: [
          {
            items: [
              "Name",
              "Email address",
              "Billing details",
              "Account information",
              "Device and browser information",
              "Website usage data",
            ],
          },
        ],
      },
      {
        heading: "2. Why We Collect It",
        paragraphs: ["We use your information to:"],
        lists: [
          {
            items: [
              "Process orders",
              "Deliver digital products",
              "Provide customer support",
              "Improve our products and services",
              "Protect against fraud and abuse",
              "Meet legal obligations",
            ],
          },
        ],
      },
      {
        heading: "3. What We Don't Do",
        lists: [
          {
            items: [
              "We do not sell your personal data.",
              "We do not collect unnecessary information.",
              "We do not access your private files or devices.",
            ],
          },
        ],
      },
      {
        heading: "4. Payment Information",
        lists: [
          {
            items: [
              "Payments are processed through trusted payment providers.",
              "We do not store your full payment card details.",
            ],
          },
        ],
      },
      {
        heading: "5. Cookies & Analytics",
        paragraphs: ["We may use cookies to:"],
        lists: [
          {
            items: [
              "Keep you signed in.",
              "Improve website performance.",
              "Understand how visitors use our website.",
              "More details are available in our Cookie Policy.",
            ],
          },
        ],
      },
      {
        heading: "6. Data Protection",
        paragraphs: [
          "We use reasonable security measures to help protect your information from unauthorized access, loss, or misuse.",
        ],
      },
      {
        heading: "7. Data Sharing",
        paragraphs: ["We only share information when necessary with:"],
        lists: [
          {
            items: [
              "Payment providers",
              "Hosting services",
              "Email service providers",
              "Legal authorities when required by law",
            ],
          },
        ],
      },
      {
        heading: "8. Your Rights",
        paragraphs: ["You may request to:"],
        lists: [
          {
            items: [
              "Access your personal information.",
              "Correct inaccurate information.",
              "Delete your account where legally possible.",
              "Contact us with privacy-related questions.",
            ],
          },
        ],
      },
      {
        heading: "9. Data Retention",
        paragraphs: ["We keep information only as long as necessary for business, legal, or security purposes."],
      },
      {
        heading: "10. Children's Privacy",
        paragraphs: [
          "Our services are not intended for children under the minimum legal age in their country without parental or guardian involvement.",
        ],
      },
      {
        heading: "11. Policy Updates",
        paragraphs: ["We may update this Privacy Policy when our services or legal requirements change."],
      },
      {
        heading: "12. Contact",
        paragraphs: [
          "If you have questions about your privacy or personal data, please contact us through our official support channels.",
        ],
      },
    ],
  },
  {
    slug: "digital-product-license-agreement",
    number: "03 / POLICY",
    title: "Digital Product License Agreement",
    cardSummary: "Using our products is simple:",
    description: "Digital Product License Agreement — Nibrexo",
    version: "Version: 1.0",
    lead: "This License explains how you may use our digital products and what actions require our permission.",
    sections: [
      {
        heading: "1. License Grant",
        lists: [
          {
            items: [
              "Purchasing a product gives you a license to use it, not ownership.",
              "The license begins after your purchase is completed.",
            ],
          },
        ],
      },
      {
        heading: "2. You May",
        lists: [
          {
            items: [
              "Use the product for its intended purpose.",
              "Create personal or commercial projects if your purchased license allows it.",
              "Keep a backup copy for your own use.",
            ],
          },
        ],
      },
      {
        heading: "3. You May Not",
        lists: [
          {
            items: [
              "Resell our products.",
              "Share, upload, or redistribute original files.",
              "Claim our work as your own.",
              "Remove copyright or ownership notices.",
              "Include our products in products that directly compete with ours.",
            ],
          },
        ],
      },
      {
        heading: "4. Commercial Use",
        lists: [
          {
            items: [
              "Commercial use is allowed only if your license includes commercial rights.",
              "Different products may have different license types.",
            ],
          },
        ],
      },
      {
        heading: "5. Modifications",
        lists: [
          {
            items: [
              "You may customize products for your own projects.",
              "Modifying a product does not transfer ownership or copyright.",
            ],
          },
        ],
      },
      {
        heading: "6. AI & Machine Learning",
        paragraphs: ["(Ye clause future-proof hai. Bohat si companies ab isay add kar rahi hain.)"],
        lists: [
          {
            items: [
              "Our products may not be used to train, fine-tune, or build AI or machine learning systems unless we provide written permission.",
            ],
          },
        ],
      },
      {
        heading: "7. Intellectual Property",
        lists: [
          {
            items: [
              "All copyrights, trademarks, and intellectual property remain our property.",
              "Buying a license does not transfer ownership.",
            ],
          },
        ],
      },
      {
        heading: "8. License Termination",
        paragraphs: ["Your license ends if you:"],
        lists: [
          {
            items: [
              "Break this agreement.",
              "Share or sell our products without permission.",
              "Misuse our intellectual property.",
            ],
          },
        ],
      },
      {
        heading: "9. Updates",
        lists: [
          {
            items: [
              "Some licenses include future updates.",
              "Product descriptions explain whether updates are included.",
            ],
          },
        ],
      },
      {
        heading: "10. Contact",
        paragraphs: ["Questions about licensing can be sent through our official support channels."],
      },
    ],
  },
  {
    slug: "refund-policy",
    number: "04 / POLICY",
    title: "Refund Policy",
    cardSummary: "Our goal is a fair and transparent refund process.",
    description: "Refund Policy — Nibrexo",
    version: "Version: 1.0",
    lead: "This policy explains when a refund may be approved and how refund requests are handled.",
    sections: [
      {
        heading: "1. Digital Products",
        lists: [
          {
            items: [
              "All products are delivered digitally.",
              "Because digital files cannot be returned, purchases are generally non-refundable after successful delivery.",
            ],
          },
        ],
      },
      {
        heading: "2. Refunds May Be Approved",
        paragraphs: ["You may qualify for a refund if:"],
        lists: [
          {
            items: [
              "You were charged more than once for the same order.",
              "You received the wrong product.",
              "A verified technical issue prevents the product from working as described, and we cannot provide a solution.",
            ],
          },
        ],
      },
      {
        heading: "3. Refunds Are Not Available For",
        lists: [
          {
            items: [
              "Change of mind.",
              "Accidental purchases.",
              "Buying the wrong product without checking the description.",
              "Incompatibility with software or devices listed as unsupported.",
              "Requests made after the product has been downloaded or used, unless required by law.",
            ],
          },
        ],
      },
      {
        heading: "4. Before Requesting a Refund",
        lists: [
          {
            items: [
              "Please contact our support team first.",
              "Most technical issues can be resolved quickly.",
            ],
          },
        ],
      },
      {
        heading: "5. Review Process",
        lists: [
          {
            items: [
              "Every refund request is reviewed individually.",
              "We may request additional information to investigate the issue.",
            ],
          },
        ],
      },
      {
        heading: "6. Approved Refunds",
        lists: [
          {
            items: [
              "Approved refunds will be processed using the original payment method whenever possible.",
            ],
          },
        ],
      },
      {
        heading: "7. Policy Updates",
        lists: [
          {
            items: [
              "We may update this policy when needed.",
              "The latest version will always apply to new purchases.",
            ],
          },
        ],
      },
      {
        heading: "8. Contact",
        paragraphs: ["For refund requests or questions, contact our official support team."],
      },
    ],
  },
  {
    slug: "disclaimer",
    number: "05 / POLICY",
    title: "Disclaimer",
    cardSummary: "Please use our products responsibly.",
    description: "Disclaimer — Nibrexo",
    version: "Version: 1.0",
    lead: "This Disclaimer explains the limits of our responsibility when you use our products and services.",
    sections: [
      {
        heading: "1. General Information",
        lists: [
          {
            items: [
              "Our products are created to provide value and quality.",
              "They should be used according to their intended purpose.",
            ],
          },
        ],
      },
      {
        heading: "2. No Guaranteed Results",
        lists: [
          {
            items: [
              "We do not guarantee specific business, financial, creative, or personal results.",
              "Success depends on how the product is used.",
            ],
          },
        ],
      },
      {
        heading: "3. User Responsibility",
        lists: [
          {
            items: [
              "You are responsible for reviewing and testing products before using them in important or commercial projects.",
              "Always ensure the product meets your specific needs.",
            ],
          },
        ],
      },
      {
        heading: "4. Third-Party Tools",
        lists: [
          {
            items: [
              "Some products may require third-party software or services.",
              "We are not responsible for changes, limitations, or issues caused by third-party platforms.",
            ],
          },
        ],
      },
      {
        heading: "5. Limitation of Liability",
        lists: [
          {
            items: [
              "We are not responsible for indirect, incidental, or consequential losses resulting from the use or inability to use our products.",
              "Our liability is limited to the maximum extent permitted by applicable law.",
            ],
          },
        ],
      },
      {
        heading: "6. Product Updates",
        lists: [
          {
            items: [
              "We may improve, update, or discontinue products without prior notice unless otherwise promised.",
            ],
          },
        ],
      },
      {
        heading: "7. Contact",
        paragraphs: ["If you have questions about this Disclaimer, please contact our official support team."],
      },
    ],
  },
  {
    slug: "cookie-policy",
    number: "06 / POLICY",
    title: "Cookie Policy",
    cardSummary: "We use cookies to improve your experience.",
    description: "Cookie Policy — Nibrexo",
    version: "Version: 1.0",
    lead: "This policy explains how and why we use cookies on our website.",
    sections: [
      {
        heading: "1. What Are Cookies?",
        lists: [
          {
            items: ["Cookies are small files stored on your device to improve your browsing experience."],
          },
        ],
      },
      {
        heading: "2. Why We Use Cookies",
        paragraphs: ["We use cookies to:"],
        lists: [
          {
            items: [
              "Keep the website running smoothly.",
              "Remember your preferences.",
              "Improve website performance.",
              "Understand how visitors use our website.",
            ],
          },
        ],
      },
      {
        heading: "3. Types of Cookies",
        lists: [
          {
            items: [
              "Essential Cookies – Required for the website to function.",
              "Performance Cookies – Help us improve website performance.",
              "Analytics Cookies – Show us how visitors interact with our website.",
            ],
          },
        ],
      },
      {
        heading: "4. Your Choice",
        lists: [
          {
            items: [
              "You can accept, reject, or delete cookies through your browser settings.",
              "Disabling some cookies may affect certain website features.",
            ],
          },
        ],
      },
      {
        heading: "5. Policy Updates",
        lists: [{ items: ["We may update this Cookie Policy when needed."] }],
      },
      {
        heading: "6. Contact",
        paragraphs: ["For questions about cookies or privacy, please contact our support team."],
      },
    ],
  },
  {
    slug: "copyright-and-trademark-policy",
    number: "07 / POLICY",
    title: "Copyright & Trademark Policy",
    cardSummary: "Our content is protected by intellectual property laws.",
    description: "Copyright & Trademark Policy — Nibrexo",
    version: "Version: 1.0",
    lead: "This policy explains who owns our intellectual property and how it may be used.",
    sections: [
      {
        heading: "1. Copyright Ownership",
        lists: [
          {
            items: [
              "All products, designs, graphics, documents, templates, logos, illustrations, text, and website content are protected by copyright.",
              "Ownership remains with us unless a written agreement states otherwise.",
            ],
          },
        ],
      },
      {
        heading: "2. Trademark Protection",
        lists: [
          {
            items: [
              "Our brand name, logo, icons, and other brand assets are our trademarks or protected brand identifiers.",
              "They may not be copied, modified, or used in a way that suggests partnership, endorsement, or ownership without written permission.",
            ],
          },
        ],
      },
      {
        heading: "3. Permitted Use",
        paragraphs: ["You may:"],
        lists: [
          {
            items: [
              "Use purchased products according to your license.",
              "Refer to our brand for legitimate reviews or educational purposes, provided it does not create confusion or misrepresent our business.",
            ],
          },
        ],
      },
      {
        heading: "4. Prohibited Use",
        paragraphs: ["You may not:"],
        lists: [
          {
            items: [
              "Copy or redistribute our original content.",
              "Remove copyright or trademark notices.",
              "Register or use names, logos, or designs that are confusingly similar to our brand.",
              "Claim our intellectual property as your own.",
            ],
          },
        ],
      },
      {
        heading: "5. Reporting Infringement",
        lists: [
          {
            items: [
              "If you believe your intellectual property has been used improperly on our platform, please contact us with the relevant details.",
              "We review all reports and take appropriate action where necessary.",
            ],
          },
        ],
      },
      {
        heading: "6. Policy Updates",
        lists: [
          {
            items: [
              "We may update this policy as our products, services, or legal requirements evolve.",
            ],
          },
        ],
      },
      {
        heading: "7. Contact",
        paragraphs: ["For copyright or trademark questions, please contact our official support team."],
      },
    ],
  },
];

export function getLegalPolicy(slug: string) {
  return legalPolicies.find((policy) => policy.slug === slug) ?? null;
}
