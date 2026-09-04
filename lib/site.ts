export const routes = {
  home: "/",
  homeTop: "/#top",
  coreStory: "/#core-story",
  portfolio: "/#portfolio",
  faq: "/#faq",
  store: "/store",
  cart: "/store/cart",
  services: "/services",
  resources: "/resources",
  about: "/about",
  legal: "/legal",
  privacy: "/legal/privacy-policy",
  terms: "/legal/terms-and-conditions",
  refund: "/legal/refund-policy",
  license: "/legal/digital-product-license-agreement",
  disclaimer: "/legal/disclaimer",
  cookies: "/legal/cookie-policy",
  copyright: "/legal/copyright-and-trademark-policy",
  login: "/account/login",
  register: "/account/register",
  forgotPassword: "/account/forgot-password",
  account: "/account",
  profile: "/account/profile",
  admin: "/admin",
  adminProducts: "/admin/products",
  contact: "/contact",
} as const;

export const pendingPages = {
  [routes.store]: {
    title: "Products",
    description: "The product store is not migrated yet. This route matches the original Products destination.",
  },
  [routes.cart]: {
    title: "Cart",
    description: "Cart is not migrated yet. This route matches the original Cart destination.",
  },
  [routes.services]: {
    title: "Services",
    description: "The services page is not migrated yet. This route matches the original Services destination.",
  },
  [routes.resources]: {
    title: "Resources",
    description: "The resources page is not migrated yet. This route matches the original Resources destination.",
  },
  [routes.about]: {
    title: "About",
    description: "The about page is not migrated yet. This route matches the original About destination.",
  },
  [routes.legal]: {
    title: "Legal Center",
    description: "The legal center is not migrated yet. This route matches the original Legal destination.",
  },
  [routes.privacy]: {
    title: "Privacy Policy",
    description: "This legal page is not migrated yet.",
  },
  [routes.terms]: {
    title: "Terms & Conditions",
    description: "This legal page is not migrated yet.",
  },
  [routes.refund]: {
    title: "Refund Policy",
    description: "This legal page is not migrated yet.",
  },
  [routes.license]: {
    title: "Digital Product License Agreement",
    description: "This legal page is not migrated yet.",
  },
  [routes.disclaimer]: {
    title: "Disclaimer",
    description: "This legal page is not migrated yet.",
  },
  [routes.cookies]: {
    title: "Cookie Policy",
    description: "This legal page is not migrated yet.",
  },
  [routes.copyright]: {
    title: "Copyright & Trademark Policy",
    description: "This legal page is not migrated yet.",
  },
  [routes.login]: {
    title: "Account",
    description: "Account sign-in is not migrated yet. This route matches the original Account destination.",
  },
  [routes.contact]: {
    title: "Contact",
    description: "The contact page is not migrated yet. This route matches the original Contact destination.",
  },
} as const;
