import * as pii from "./pii-detector";
import * as core from "@actions/core";

async function run(): Promise<void> {
  try {
    const subKey = core.getInput("azureCognitiveSubscriptionKey")
    const url = core.getInput("azureCognitiveEndpoint")
    const text = core.getInput("textToCheck")
    let response = await pii.callPiiDetectionEndpoint(text, url, subKey)

    if (response) {
      response.documents.forEach(doc => {
        doc.entities.forEach(ent => {
          console.log(`${ent.confidenceScore} : ${ent.category} - ${ent.text}`)
        });
      });
      core.setOutput("results", JSON.stringify(response));
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()