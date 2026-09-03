-- Customer / company name from Prospect (Division.Name).

alter table problem_tickets
  add column if not exists customer text not null default '';
