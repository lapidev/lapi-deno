module.exports = {
  types: [
    { type: "feat", section: "Features" },
    { type: "fix", section: "Fixes" },
    { type: "perf", section: "Performance" },
    { type: "chore", hidden: true },
    { type: "docs", hidden: true },
    { type: "style", hidden: true },
    { type: "refactor", hidden: true },
    { type: "test", hidden: true },
    { type: "ci", hidden: true },
  ],
  commitUrlFormat: "https://github.com/LukeShay/lapi/commits/{{hash}}",
  compareUrlFormat:
    "https://github.com/LukeShay/lapi/compare/{{previousTag}}...{{currentTag}}",
  bumpFiles: [
    {
      filename: "version.txt",
      type: "plain-text",
    },
  ],
};
