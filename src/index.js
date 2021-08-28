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
  requiredFileChanges = [],
  preventFileChanges = []
) {
  const basehead = await getCommitBaseHead(context);
  const commitChanges = await client.rest.repos.compareCommitsWithBasehead({
    ...context.repo,
    basehead,
  });
  const changedFiles = commitChanges.data.files.map((f) => f.filename);

  const requiredFileChangesIncluded = requiredFileChanges.every(
    (pattern) => !!changedFiles.find((file) => minimatch(file, pattern))
  );

  const preventedFileChangedIncluded = preventFileChanges.length > 0 && preventFileChanges.every(
    (pattern) => !!changedFiles.find((file) => minimatch(file, pattern))
  );

  if (requiredFileChangesIncluded && !preventedFileChangedIncluded) {
    core.setOutput("success", true);
    return true;
  }

  core.setFailed(`
    Files changed:\n
    ${JSON.stringify(changedFiles, null, 2)}\n\n
    Please ensure you have changed all files that match the following patterns:\n
    ${JSON.stringify(requiredFileChanges, null, 2)}\n\n
    Please ensure you have not changed any of the files that match the following patterns:\n
    ${JSON.stringify(preventFileChanges, null, 2)}\n\n
  `);
  return false;
}

async function run() {
  const githubToken = core.getInput("token", { required: true });
  const requiredFileChanges = core.getMultilineInput("require-changes-to", {
    required: false,
  });
  const preventFileChanges = core.getMultilineInput("prevent-changes-to", {
    required: false,
  });

  const client = getOctokit(githubToken);
  await main(context, client, requiredFileChanges, preventFileChanges);
}

run();

module.exports = {
  main: main,
};
