# PII Detection Action 

This is a GitHub action to detect PII (Personally Identifiable Information) such as phone numbers, social security numbers, email addresses, IP addresses, etc. in any issues or pull requests that are opened, edited or commented on. If PII is detected using the `personal` domain, a `PII` tag is added to the issue or pull request.

Only positive detections with a confidence score are considered valid. All detections are logged to the console for review.

PII detection is processed using [Entity Recognition Cognitive Service](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/named-entity-types?tabs=personal) from Microsoft.

## Usage

Create a `.github/workflows/detect-pii.yml` file:

```yaml
name: 'detect-pii'
on:
  issues:
    types:
      - opened
      - edited
  issue_comment:
    types:
      - created
      - edited
  pull_request:
    types:
      - opened
      - edited
  pull_request_review_comment:
    types:
      - created
      - edited
jobs:
  detect-pii:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ./
        name: "Run PII detector"
        with:
          azureCognitiveSubscriptionKey: ${{ secrets.AZURE_COGNITIVE_SUBSCRIPTION_KEY }}
          azureCognitiveEndpoint: ${{ secrets.AZURE_COGNITIVE_ENDPOINT }}
          categories: "email|ip|credit card|phoneNumber"
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

The following environment variables are supported:

- `azureCognitiveSubscriptionKey`: A valid [Azure Cognitive Service](https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesAllInOne) key
- `azureCognitiveEndpoint`: Navigate to your Cognitive Service resource > Keys and Endpoint > Endpoint [i.e. `https://centralus.api.cognitive.microsoft.com/`]
- `gitHubToken`: leave this be :metal:

## Limitations

* There is a 5,120 character limit and 1MB total request payload size as outlined [here](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/concepts/data-limits?tabs=version-3).
* This sample could be extended to batch the request up to 5 per payload.

## Improvements

* input parameters to configure:
  * source language (defaults to English)
  * additional trigger points
  * custom labels to add based on PII type
  * subcategory support
* support for larger text payloads

## License

MIT