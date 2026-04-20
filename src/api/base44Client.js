// Base44 removed — replaced with local stub

export const base44 = {
  auth: {
    me: async () => {
      throw new Error("Base44 removed: auth disabled");
    },
    logout: () => {
      console.log("Logout disabled (Base44 removed)");
    },
    redirectToLogin: () => {
      console.log("Login disabled (Base44 removed)");
    }
  }
};

