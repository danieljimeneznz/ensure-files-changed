const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");
const minimatch = require("minimatch");

async function getCommitBaseHead(context) {
  if (context.eventName === "pull_request") {
    const pr = context.payload.pull_request;
    return `${pr.base.sha}...${pr.head.sha}`;
  } else {
    const compareURL = context.payload.compare;
    const endPoint = compareURL.lastIndexOf("/");

    if (endPoint === -1) {
      core.setFailed("Endpoint not found");
    }

    return compareURL.substring(endPoint + 1);
  }
}

async function main(
  context,
  client,
  requiredChangePatterns,
  preventModificationPatterns
) {
  if (requiredChangePatterns && typeof requiredChangePatterns !== "object") {
    core.setFailed(
      "Please fill in the requiredChangePatterns names as an object"
    );
    return;
  }

  if (
    preventModificationPatterns &&
    typeof preventModificationPatterns !== "object"
  ) {
    core.setFailed(
      "Please fill in the preventModificationPatterns names as an object"
    );
    return;
  }

  const basehead = await getCommitBaseHead(context);
  const commitChanges = await client.rest.repos.compareCommitsWithBaseHead({
    ...context.repo,
    basehead
  });
  const changedFileNames = commitChanges.data.files.map((f) => f.filename);

  const requiredFileChangesIncluded = !!requiredChangePatterns
    ? requiredChangePatterns.every(
        (pattern) => !!changedFileNames.find((file) => minimatch(file, pattern))
      )
    : true;

  const preventedFileChangedIncluded = !!preventModificationPatterns
    ? preventModificationPatterns.every(
        (pattern) => !!changedFileNames.find((file) => minimatch(file, pattern))
      )
    : false;

  if (requiredFileChangesIncluded && !preventedFileChangedIncluded) {
    core.setOutput("success", true);
    return;
  }

  core.setFailed(`
    Files changed:\n
    ${JSON.stringify(changedFileNames, null, 2)}\n\n
    Please ensure you have changed all files that match the following patterns:\n
    ${JSON.stringify(requiredFileChangesIncluded, null, 2)}\n\n
    Please ensure you have not changed any of the files that match the following patterns:\n
    ${JSON.stringify(preventedFileChangedIncluded, null, 2)}\n\n
  `);
}

async function run() {
  const githubToken = core.getInput("token", { required: true });
  const requiredChangePatterns = JSON.parse(
    core.getInput("require-change-file-patterns", { required: false })
  );
  const preventModificationPatterns = JSON.parse(
    core.getInput("prevent-modification-file-patterns", { required: false })
  );

  const client = getOctokit(githubToken);
  await main(
    context,
    client,
    requiredChangePatterns,
    preventModificationPatterns
  );
}

run();

module.exports = {
  main: main,
};
