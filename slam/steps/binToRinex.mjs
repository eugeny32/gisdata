// Заглушка — в самом upstream slamcloude/worker/pipeline/tasks.py этот шаг
// уже no-op (`if step is PipelineStep.BIN_TO_RINEX: ... return StepOutcome()`,
// см. tasks.py:495-502) вне зависимости от наличия ROVER_PPKRAW_BIN/BASE_BIN
// — переносится как есть, это не пробел порта, а факт исходной системы.
import { runStep } from "../lib/stepContext.mjs";

await runStep(async () => {
  return {};
});
