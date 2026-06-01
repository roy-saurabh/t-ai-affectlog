# Recipes

Recipes are YAML files that configure the full audit pipeline. They live in `configs/recipes/`.

## Format

```yaml
name: my_recipe
input_schema: maskott_csv_v1      # Schema to validate against
source_platform: "My Platform"    # Human-readable source name
mode: dataset_only                # or: model_and_dataset

privacy:
  pseudonymize: true
  method: hmac_sha256             # or: sha256, redact, suppress
  hash_fields: [_id, EntityId, EntityUaiCode, ActivitySessionId]
  suppress_fields: []
  allow_raw_identifiers: false    # NEVER set to true in production

xapi:
  verb_default: accessed
  verb_mapping:
    GROUP_SESSION: accessed
    TEST: assessed
  resource_id_field: ResourceId
  actor_field: EntityId
  timestamp_field: AccessDate

metrics:
  coverage_k: [10, 20, 50]
  dominance_top_percent: [1, 5, 10]
  profile_verbs: true
  profile_temporal: true

compliance:
  export_jsonld: true
  export_data_card: true
  export_sop: true
  export_field_inventory: true
  export_model_card: false
```

## Built-in Recipes

| Recipe | File | Use Case |
|---|---|---|
| `maskott_tactileo` | `configs/recipes/maskott_tactileo.yaml` | Maskott/Tactileo teacher logs |
| `inokufu_becomino` | `configs/recipes/inokufu_becomino.yaml` | Inokufu/Becomino anonymized logs |
| `generic_xapi` | `configs/recipes/generic_xapi.yaml` | Generic xAPI JSONL |
| `generic_tabular_model_audit` | `configs/recipes/generic_tabular_model_audit.yaml` | Tabular data + model |

## Adding a New Recipe

1. Copy `configs/recipes/maskott_tactileo.yaml` to `configs/recipes/my_recipe.yaml`.
2. Edit `name`, `input_schema`, `source_platform`.
3. Adjust `privacy.hash_fields` for your dataset's personal fields.
4. Run `affectlog audit --recipe configs/recipes/my_recipe.yaml --input <path> --output runs/my_run`.
