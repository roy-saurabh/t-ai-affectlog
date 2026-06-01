#!/usr/bin/env bash
# Validate the generated OpenAPI spec
set -e
echo "Validating OpenAPI spec at docs/openapi.yaml..."
if command -v npx &>/dev/null; then
  npx @redocly/openapi-cli lint docs/openapi.yaml || true
else
  echo "npx not found; skipping CLI lint."
fi
python3 -c "
import yaml, json, sys
with open('docs/openapi.yaml') as f:
    spec = yaml.safe_load(f)
assert spec.get('openapi', '').startswith('3.'), 'Not OpenAPI 3.x'
print('OpenAPI spec version:', spec['openapi'])
print('Title:', spec.get('info', {}).get('title'))
print('Paths:', len(spec.get('paths', {})))
print('OK')
"
