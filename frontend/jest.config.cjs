module.exports = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    transform: {
      "^.+\\.jsx?$": "babel-jest",
    },
    moduleNameMapper: {
        "\\.(css|scss)$": "identity-obj-proxy",
        "\\.(jpg|png|svg)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|scss|sass)$": "identity-obj-proxy"
    },
    testEnvironment: "jsdom",
  };
  