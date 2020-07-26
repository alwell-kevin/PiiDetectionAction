import * as pii from "./pii-detector";
import * as core from "@actions/core";
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const subKey = core.getInput("azureCognitiveSubscriptionKey", { required: true })
    const url = core.getInput("azureCognitiveEndpoint", { required: true })
    const gitHubToken = core.getInput("gitHubToken", { required: true })

    console.log(github.context.payload);

    const client = github.getOctokit(gitHubToken);
    let textToCheck;
    let containsPii = false;
    let issueNumber;

    if (github.context.payload.issue && (github.context.payload.action === 'opened' || github.context.payload.action === 'edited')) {
      //An issue was opened or updated
      textToCheck = github.context.payload.issue.body;
      issueNumber = github.context.issue.number;
    }

    if (github.context.payload.comment && (github.context.payload.action === 'created' || github.context.payload.action === 'edited')) {
      //A comment was added to the issue
      textToCheck = github.context.payload.comment.body;
      issueNumber = github.context.issue.number;
    }

    if (github.context.payload.pull_request && (github.context.payload.action === 'opened' || github.context.payload.action === 'edited')) {
      //A pull request was opened or updated
      textToCheck = github.context.payload.pull_request.body;
      issueNumber = github.context.payload.pull_request.number;
    }

    const response = await pii.callPiiDetectionEndpoint(textToCheck, url, subKey)

    if (response) {
      console.log("\n\n------------------------------------------------------");
      response.documents.forEach(doc => {
        doc.entities.forEach(ent => {

          let log = `${ent.category} detected with ${ent.confidenceScore * 100}% confidence score and a value of: '${ent.text}'`

          //We only care about results with a confidence score of 60% or higher
          if(ent.confidenceScore >= .6)
          {
            containsPii = true;
          } else {
            log = `${log} - SKIPPING`
          }
          console.log(log)
        });
      });
      core.setOutput("results", JSON.stringify(response));

      if (containsPii) {
        let labels = ["PII"];

        client.issues.addLabels({
          labels: labels,
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: issueNumber
        })
      } else {
        console.log(`No PII detected in:\n${textToCheck}`)
      }
      console.log("------------------------------------------------------\n\n");
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()