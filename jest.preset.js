const nxPreset = require("@nrwl/jest/preset");

module.exports = {
  ...nxPreset,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "jest tests",
        outputDirectory: "test-results",
        uniqueOutputName: "true",
        classNameTemplate: "{classname}-{title}",
        titleTemplate: "{classname}-{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: "true",
      },
    ],
  ],
};
