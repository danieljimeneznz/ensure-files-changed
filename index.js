const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

async function run() {
  const githubToken = core.getInput("token", { required: true });
  const fileNames = JSON.parse(core.getInput("file-names", { required: true }));

  if (typeof fileNames !== "object" || !fileNames.length) {
    core.setFailed("Please fill in the correct file names");
  }

  const client = getOctokit(githubToken);

  const [ base, head ] = (() => {
    if (context.eventName === "pull_request") {
      const pr = context.payload.pull_request;

      return [pr.base.sha, pr.head.sha];
    } else {
      const compareURL = context.payload.compare;

      const endPoint = compareURL.lastIndexOf("/");

      if (endPoint === -1) {
        core.setFailed("Endpoint not found");
      }

      return compareURL.substring(endPoint + 1).split("...");
    }
  })();

  const changedFileNames = (await client.repos.compareCommits({
    ...context.repo,
    base,
    head
  })).data.files.map(f => f.filename);

  const isAllIncluded = fileNames.every(fileName =>changedFileNames.includes(fileName));

  if (isAllIncluded) {
    core.setOutput("success", true);
  } else {
    core.setFailed(`
      Please check your changed files
      Expect: ${JSON.stringify(fileNames, null, 2)}
      Actual: ${JSON.stringify(changedFileNames, null, 2)}
    `);
  }
}

run();
