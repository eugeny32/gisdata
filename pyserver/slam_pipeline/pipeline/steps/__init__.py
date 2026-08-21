"""Step-name -> implementation registry, used by the slam_step_worker
management command. Keys match slam_pipeline.models.PIPELINE_ORDER /
sql/schema.sql's slam_jobs.pipeline_step check constraint exactly."""

from . import bin_to_rinex, build_octree, colorize, compute_slam, decode_raw, filter_outliers, georeference, ppk_correction

STEP_FUNCS = {
    "compute_slam": compute_slam.run,
    "decode_raw": decode_raw.run,
    "filter_outliers": filter_outliers.run,
    "bin_to_rinex": bin_to_rinex.run,
    "ppk_correction": ppk_correction.run,
    "colorize": colorize.run,
    "georeference": georeference.run,
    "build_octree": build_octree.run,
}
