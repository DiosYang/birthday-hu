"""Wait for GitHub's artifact listing to reflect the completed upload."""
import json
import os
import time
from urllib.request import Request, urlopen

url = (f"{os.environ['GITHUB_API_URL']}/repos/{os.environ['GITHUB_REPOSITORY']}"
       f"/actions/runs/{os.environ['GITHUB_RUN_ID']}/artifacts")
request = Request(url, headers={
    'Authorization': f"Bearer {os.environ['GH_TOKEN']}",
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
})
name = os.environ['ARTIFACT_NAME']
for attempt in range(12):
    with urlopen(request, timeout=15) as response:
        artifacts = json.load(response)['artifacts']
    matches = [item for item in artifacts if item['name'] == name and not item['expired']]
    if len(matches) == 1:
        print(f'Artifact {name} is available for deployment.')
        break
    if len(matches) > 1:
        raise RuntimeError(f'Multiple artifacts found: {name}')
    time.sleep(3)
else:
    raise RuntimeError(f'Uploaded artifact was not visible: {name}')
