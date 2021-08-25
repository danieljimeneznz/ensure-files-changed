const sinon = require("sinon");
const core = require("@actions/core");
const { main } = require("../src/index");

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
    it("should succeed if files changed are in the requiredFileChangesIncluded but not in the preventedFileChangedIncluded", async () => {
      coreMock.expects("setOutput").withArgs("success", true).once();

      await main(
        context,
        {
          rest: {
            repos: {
              compareCommitsWithBaseHead: () => ({
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
    });

    it("should succeed if the requiredFileChangesIncluded and preventedFileChangedIncluded are missing", async () => {
      coreMock.expects("setOutput").withArgs("success", true).once();

      await main(
        context,
        {
          rest: {
            repos: {
              compareCommitsWithBaseHead: () => ({
                data: {
                  files: [
                    { filename: "package.json" },
                    { filename: "LICENSE.md" },
                  ],
                },
              }),
            },
          },
        },
        ["package.json"]
      );
    });

    it("should fail if files changed are not in the requiredFileChangesIncluded", async () => {
      coreMock.expects("setFailed").once();

      await main(
        context,
        {
          rest: {
            repos: {
              compareCommitsWithBaseHead: () => ({
                data: {
                  files: [{ filename: "LICENSE.md" }],
                },
              }),
            },
          },
        },
        ["package.json"]
      );
    });

    it("should fail if files changed are in the preventedFileChangedIncluded", async () => {
      coreMock.expects("setOutput").once();

      await main(
        context,
        {
          rest: {
            repos: {
              compareCommitsWithBaseHead: () => ({
                data: {
                  files: [{ filename: "pacakge.json" }],
                },
              }),
            },
          },
        },
        null,
        ["package.json"]
      );
    });
  });
});
