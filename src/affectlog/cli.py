"""
AffectLog ALT-AI — Command Line Interface.

Usage:
  affectlog [COMMAND] [OPTIONS]
"""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table

from affectlog.logging import configure_logging

app = typer.Typer(
    name="affectlog",
    help="AffectLog Trustworthy AI Assessment Building Block (ALT-AI)",
    add_completion=False,
)
console = Console()


def _get_settings() -> "Settings":  # type: ignore[name-defined]
    from affectlog.config import get_settings
    return get_settings()


@app.command("validate-csv")
def validate_csv(
    input: Path = typer.Option(..., "--input", "-i", help="Path to input CSV file"),
    schema: str = typer.Option("maskott_csv_v1", "--schema", "-s", help="Schema name to validate against"),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """Validate a CSV file against a named schema."""
    configure_logging("DEBUG" if verbose else "INFO")
    from affectlog.ingest.validators import validate_schema
    result = validate_schema(input, schema)
    if result.get("valid"):
        console.print(f"[green]✓ Schema '{schema}' — VALID[/green]")
        if result.get("extra_columns"):
            console.print(f"[yellow]Extra columns (not in schema): {result['extra_columns']}[/yellow]")
    else:
        console.print(f"[red]✗ Schema '{schema}' — INVALID[/red]")
        if result.get("missing_columns"):
            console.print(f"[red]Missing columns: {result['missing_columns']}[/red]")
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
        raise typer.Exit(1)


@app.command("infer-json-template")
def infer_json_template(
    input: Path = typer.Option(..., "--input", "-i", help="Path to Becomino JSON sample"),
    output: Optional[Path] = typer.Option(None, "--output", "-o", help="Output path for inferred template"),
) -> None:
    """Infer Becomino-compatible xAPI template from a sample JSON file."""
    configure_logging("INFO")
    from affectlog.transform.becomino_template import infer_becomino_template
    template = infer_becomino_template(input, output)
    console.print_json(json.dumps(template, indent=2))


@app.command("convert-csv")
def convert_csv(
    input: Path = typer.Option(..., "--input", "-i", help="Path to Maskott CSV"),
    recipe: Path = typer.Option("configs/recipes/maskott_tactileo.yaml", "--recipe", "-r"),
    template: Optional[Path] = typer.Option(None, "--template", "-t", help="Becomino JSON template"),
    output: Path = typer.Option(..., "--output", "-o", help="Output JSONL path"),
    format: str = typer.Option("jsonl", "--format", "-f"),
    chunk_size: int = typer.Option(100_000, "--chunk-size"),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """Convert Maskott CSV to normalized xAPI JSONL."""
    configure_logging("DEBUG" if verbose else "INFO")
    cfg = _get_settings()
    from affectlog.privacy.pseudonymizer import Pseudonymizer
    from affectlog.recipes.loader import load_recipe
    from affectlog.transform.maskott_csv_to_xapi import convert_maskott_csv_to_xapi
    from affectlog.transform.verb_mapper import VerbMapper

    rec = load_recipe(recipe)
    pseudo = Pseudonymizer.from_recipe(
        {
            "method": rec.privacy.method,
            "hash_fields": rec.privacy.hash_fields,
            "suppress_fields": rec.privacy.suppress_fields,
            "allow_raw_identifiers": rec.privacy.allow_raw_identifiers,
        },
        secret=cfg.hash_secret,
    )
    vm = VerbMapper(rec.xapi.verb_mapping)
    summary = convert_maskott_csv_to_xapi(
        input, output,
        chunk_size=chunk_size,
        template_path=template,
        pseudonymizer=pseudo,
        verb_mapper=vm,
        allow_raw=rec.privacy.allow_raw_identifiers,
    )
    console.print_json(json.dumps(summary, indent=2))


@app.command("audit")
def audit(
    input: Path = typer.Option(..., "--input", "-i", help="Input JSONL or CSV"),
    recipe: Path = typer.Option("configs/recipes/maskott_tactileo.yaml", "--recipe", "-r"),
    output: Path = typer.Option(..., "--output", "-o", help="Output run directory"),
    chunk_size: int = typer.Option(100_000, "--chunk-size"),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """Run the full trustworthy AI audit pipeline."""
    configure_logging("DEBUG" if verbose else "INFO")
    cfg = _get_settings()
    from affectlog.recipes.loader import load_recipe
    from affectlog.recipes.runner import run_audit

    rec = load_recipe(recipe)
    ctx = run_audit(
        input, rec, output,
        hash_secret=cfg.hash_secret,
        chunk_size=chunk_size,
    )
    console.print(f"[green]Audit complete: {ctx.run_id}[/green]")
    console.print(f"Artifacts: {len(ctx.artifacts)} files in {output}")
    for name, path in ctx.artifacts.items():
        console.print(f"  {name}: {path}")


@app.command("profile")
def profile(
    input: Path = typer.Option(..., "--input", "-i"),
    output: Optional[Path] = typer.Option(None, "--output", "-o"),
    verbose: bool = typer.Option(False, "--verbose", "-v"),
) -> None:
    """Profile a dataset (CSV, JSON, JSONL) and print statistics."""
    configure_logging("DEBUG" if verbose else "INFO")
    from affectlog.profiling.schema_profiler import profile_schema
    result = profile_schema(input)
    if output:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, indent=2))
        console.print(f"Profile written to {output}")
    else:
        console.print_json(json.dumps(result, indent=2, default=str))


@app.command("compliance-export")
def compliance_export(
    run: Path = typer.Option(..., "--run", help="Run directory"),
    format: str = typer.Option("jsonld", "--format", "-f", help="Export format: jsonld"),
    output: Path = typer.Option(..., "--output", "-o"),
) -> None:
    """Export compliance graph from an audit run."""
    configure_logging("INFO")
    manifest_path = run / "audit_manifest.json"
    if not manifest_path.exists():
        console.print(f"[red]No audit_manifest.json found in {run}[/red]")
        raise typer.Exit(1)
    manifest = json.loads(manifest_path.read_text())
    existing_jld = run / "compliance_graph.jsonld"
    if existing_jld.exists() and str(output) != str(existing_jld):
        import shutil
        shutil.copy2(existing_jld, output)
        console.print(f"[green]Compliance graph exported to {output}[/green]")
    else:
        console.print(f"[yellow]compliance_graph.jsonld already at {existing_jld}[/yellow]")


@app.command("sop")
def sop_cmd(
    run: Path = typer.Option(..., "--run", help="Run directory"),
    output: Path = typer.Option(..., "--output", "-o"),
) -> None:
    """Export SOP from an audit run."""
    configure_logging("INFO")
    sop_path = run / "SOP.md"
    if not sop_path.exists():
        console.print(f"[red]No SOP.md found in {run}[/red]")
        raise typer.Exit(1)
    import shutil
    shutil.copy2(sop_path, output)
    console.print(f"[green]SOP exported to {output}[/green]")


@app.command("generate-synthetic")
def generate_synthetic(
    rows: int = typer.Option(100_000, "--rows", "-n", help="Number of rows to generate"),
    output: Path = typer.Option("data/samples/maskott_synthetic.csv", "--output", "-o"),
    seed: int = typer.Option(42, "--seed"),
) -> None:
    """Generate a synthetic Maskott-style CSV for testing and benchmarks."""
    configure_logging("INFO")
    from scripts.generate_synthetic_maskott_csv import generate_csv
    generate_csv(output, rows, seed)
    console.print(f"[green]Synthetic CSV with {rows:,} rows written to {output}[/green]")


@app.command("serve")
def serve(
    host: str = typer.Option("0.0.0.0", "--host"),
    port: int = typer.Option(8000, "--port"),
    workers: int = typer.Option(1, "--workers"),
    reload: bool = typer.Option(False, "--reload"),
) -> None:
    """Start the ALT-AI FastAPI server."""
    import uvicorn
    configure_logging("INFO")
    uvicorn.run(
        "affectlog.api.main:app",
        host=host,
        port=port,
        workers=workers,
        reload=reload,
    )


if __name__ == "__main__":
    app()
