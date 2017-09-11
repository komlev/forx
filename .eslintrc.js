module.exports = {
  extends: "airbnb-base",
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  globals: {
    expect: true,
    it: true,
    describe: true
  },
  settings: {
    "import/resolver": {
      webpack: {
        config: "./config/webpack.config.js"
      }
    }
  },
  rules: {
    semi: ["error", "never"],
    "one-var": ["error", "always"],
    "no-underscore-dangle": 0,
    "comma-dangle": ["error", "never"],
    "max-len": ["error", 80]
  }
};
