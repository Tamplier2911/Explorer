export const featuresPolicyConfig = {
  features: {
    fullscreen: ["'self'"],
    vibrate: ["'none'"],
    payment: ["'none'"],
    syncXhr: ["'none'"],
  },
};

export const contentPolicyConfig = {
  directives: {
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "explorer-s.herokuapp.com",
    ],
  },
};
