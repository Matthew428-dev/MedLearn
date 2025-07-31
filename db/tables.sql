use medlearnLMS;

create table invites(inviteID int unsigned not null primary key auto_increment, token varchar(255) not null, tokenUsed tinyint not null default 0, expirationTime dateTime not null, unique key (token));
create table inquiries(approved tinyint(1) not null default 0, inquiryID int unsigned not null primary key auto_increment, inviteID int unsigned, email varchar(255) not null, firstName varchar(255) not null, lastName varchar(255) not null, npi char(10) not null, inquiryType ENUM('demo request','pricing','other') not null default 'demo request', phoneNumber varchar(20), foreign key (inviteID) references invites(inviteID) on delete set null);

create table users(firstLogin tinyint unsigned not null default 1, id int unsigned not null primary key auto_increment,companyID int unsigned not null, firstName varchar(255) not null, lastName varchar(255) not null, role char(1) not null default 'e', email varchar(255) not null, password_hash varchar(255) not null, foreign key (companyID) references companies(companyID),unique key (email));
create table companies(companyID int unsigned not null primary key auto_increment, companyName varchar(255) not null);

