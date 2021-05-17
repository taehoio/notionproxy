#!/bin/sh

GITHUB_URL="https://github.com"

DEPLOY_STATE=$(echo "${1}" | tr '[:upper:]' '[:lower:]')
DEPLOY_DESC=$(echo "${2}" | tr '[:upper:]' '[:lower:]')

curl --silent --show-error --fail \
    -X POST "${GITHUB_DEPLOY_EVENT_URL}" \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Content-Type: text/json; charset=utf-8" \
    -H "Accept: application/vnd.github.flash-preview+json" \
    -d @- <<EOF
{
    "state": "${DEPLOY_STATE}",
    "target_url": "${GITHUB_URL}/${GITHUB_REPOSITORY}/actions",
    "description": "${DEPLOY_DESC}"
}
EOF
