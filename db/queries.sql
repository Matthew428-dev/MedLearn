use medlearnLMS;
alter table invites drop column role;
alter table invites add column role varchar(16) not null;
describe invites;



/*
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE invites;
TRUNCATE TABLE inquiries;
SET FOREIGN_KEY_CHECKS = 1;*/
