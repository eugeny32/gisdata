"""
Stub -- in the upstream slamcloude/worker/pipeline/tasks.py itself this
step is already a no-op (`if step is PipelineStep.BIN_TO_RINEX: ... return
StepOutcome()`) regardless of ROVER_PPKRAW_BIN/BASE_BIN presence -- ported
as-is, this isn't a gap in the port, it's a fact of the source system.
"""


def run(ctx: dict) -> dict:
    return {}

