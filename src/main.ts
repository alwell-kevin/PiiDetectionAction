import * as pii from "./pii-detector";
import * as core from "@actions/core";
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const subKey = core.getInput("azureCognitiveSubscriptionKey", { required: true })
    const url = core.getInput("azureCognitiveEndpoint", { required: true })

    console.log(github.context.payload);
    console.log(JSON.stringify(github.context.payload));

    if (github.context.payload.action !== 'opened') {
      console.log('No issue or PR was opened, skipping');
      return;
    }

    if (!github.context.payload.issue) {
      console.log('The event that triggered this action was not a issue, skipping.');
      return;
    }

    const client = github.getOctokit(gitHubToken);

    const { data: issue } = await client.issues.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    });

    const response = await pii.callPiiDetectionEndpoint(issue.body, url, subKey)
    let containsPii = false;

    if (response) {
      response.documents.forEach(doc => {
        doc.entities.forEach(ent => {
          console.log(`${ent.confidenceScore} : ${ent.category} - ${ent.text}`)
          containsPii = true;
        });
      });
      core.setOutput("results", JSON.stringify(response));

      if (containsPii) {
        let labels = ["PII"];
        client.issues.addLabels({
          labels: labels,
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.issue.number
        })
      }
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()