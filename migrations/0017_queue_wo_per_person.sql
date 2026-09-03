drop index if exists build_queue_wo_uidx;

create unique index if not exists build_queue_who_wo_uidx
  on build_queue (assigned_build, wo_number)
  where wo_number is not null;
