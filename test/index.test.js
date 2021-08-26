const sinon = require("sinon");
const core = require("@actions/core");
const { main } = require("../src/index");
const { expect } = require("chai");

describe("index.js", () => {
  const token = "1234";
  const context = {
    eventName: "pull_request",
    payload: { pull_request: { base: { sha: "1" }, head: { sha: "2" } } },
  };

  let coreMock;

  beforeEach(() => {
    coreMock = sinon.mock(core);
  });

  afterEach(sinon.verifyAndRestore);

  describe("main()", () => {
    describe("success", () => {
      it("should succeed if only required files changed", async () => {
        coreMock.expects("setOutput").withArgs("success", true).once();

        const result = await main(
          context,
          {
            rest: {
              repos: {
                compareCommitsWithBasehead: () => ({
                  data: {
                    files: [
                      { filename: "package.json" },
                      { filename: "README.md" },
                    ],
                  },
                }),
              },
            },
          },
          ["package.json"],
          ["LICENSE.md"]
        );

        expect(result).to.be.true;
      });

      it("should succeed if required files changed with pattern overlap but files prevented from changing, did not change", async () => {
        coreMock.expects("setOutput").withArgs("success", true).once();

        const result = await main(
          context,
          {
            rest: {
              repos: {
                compareCommitsWithBasehead: () => ({
                  data: {
                    files: [
                      { filename: "package.json" },
                      { filename: "README.md" },
                    ],
                  },
                }),
              },
            },
          },
          ["package.json", "*.md"],
          ["LICENSE.md"]
        );

        expect(result).to.be.true;
      });
    });

    describe("failure", () => {
      it("should fail if required files are not changed", async () => {
        coreMock.expects("setFailed").once();

        const result = await main(
          context,
          {
            rest: {
              repos: {
                compareCommitsWithBasehead: () => ({
                  data: {
                    files: [{ filename: "LICENSE.md" }],
                  },
                }),
              },
            },
          },
          ["package.json"],
          undefined
        );

        expect(result).to.be.false;
      });

      it("should fail if files prevented from changing were changed", async () => {
        coreMock.expects("setFailed").once();

        const result = await main(
          context,
          {
            rest: {
              repos: {
                compareCommitsWithBasehead: () => ({
                  data: {
                    files: [{ filename: "package.json" }],
                  },
                }),
              },
            },
          },
          undefined,
          ["package.json"]
        );

        expect(result).to.be.false;
      });

      it("should fail if required files changed with pattern overlap but files prevented from changing, changed", async () => {
        coreMock.expects("setFailed").once();

        const result = await main(
          context,
          {
            rest: {
              repos: {
                compareCommitsWithBasehead: () => ({
                  data: {
                    files: [
                      { filename: "package.json" },
                      { filename: "README.md" },
                      { filename: "LICENSE.md" }
                    ],
                  },
                }),
              },
            },
          },
          ["package.json", "*.md"],
          ["LICENSE.md"]
        );

        expect(result).to.be.false;
      });
    });
  });
});
