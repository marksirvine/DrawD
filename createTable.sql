create table origImages (origImageID INTEGER PRIMARY KEY, location, description);

-- create table users (userID INTEGER PRIMARY KEY, name);
create table comments (commentID INTEGER PRIMARY KEY, userImageID, comment varchar(255), foreign key (userImageID) references userImages(userImageID));


create table userImages (userImageID INTEGER PRIMARY KEY , origImageID int, location varchar(255), date varchar(255), score int , foreign key (origImageID) references origImages(origImageID));

insert into origImages values (1, "flags/albania.png", "National flag of Albania");
insert into origImages values (2, "flags/algeria.png", "National flag of Algeria");
insert into origImages values (3, "flags/zimbabwe.png", "National flag of Zimbabwe");
insert into origImages values (4, "flags/lionking.png", "Iconic scene from The Lion King");
insert into origImages values (5, "flags/windows.png", "Iconic Windows background image");
insert into origImages values (6, "flags/mountain.png", "Picture of a mountain");

insert into userImages (userImageID,origImageID, location, score) values (0, 2, "userimages/test.png", 1);
insert into userImages (userImageID,origImageID, location, score) values (1, 3, "userimages/test1.png", 1);
insert into userImages (userImageID,origImageID, location, score) values (2, 1, "userimages/test2.png", 0);
insert into userImages (userImageID,origImageID, location, score) values (3, 2, "userimages/test3.png", 3);
insert into userImages (userImageID,origImageID, location, score) values (4, 1, "userimages/test4.png", 0);
insert into userImages (userImageID,origImageID, location, score) values (5, 1, "userimages/test5.png", 3);


insert into comments (userImageID, comment) values (3, "Cool drawing dude!");


pragma foreign_keys = on;
