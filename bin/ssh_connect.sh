#!/usr/bin/env bash
# SSH-подключение к ntrip.host с ключом gisdata_deploy
exec ssh \
  -i ~/.ssh/gisdata_deploy \
  -o StrictHostKeyChecking=no \
  admin@ntrip.host \
  "$@"
