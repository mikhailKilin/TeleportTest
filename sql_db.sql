users (
 id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
 login varchar(50) NOT NULL,
 password char(40) NOT NULL,
 color varchar(10) NOT NULL,
 PRIMARY KEY (id),
 UNIQUE INDEX email_UNIQUE (login)
)
ENGINE = INNODB
AUTO_INCREMENT = 18
AVG_ROW_LENGTH = 277
CHARACTER SET utf8
COLLATE utf8_unicode_ci
ROW_FORMAT = DYNAMIC;





places (
 horisontalNumber int(11) UNSIGNED NOT NULL,
 verticalNumber int(11) UNSIGNED NOT NULL,
 reserved tinyint(1) NOT NULL,
 user_id int(11) UNSIGNED DEFAULT NULL,
 buyed tinyint(1) NOT NULL DEFAULT 0,
 PRIMARY KEY (horisontalNumber, verticalNumber),
 CONSTRAINT FK_places_users_id FOREIGN KEY (user_id)
 REFERENCES sequelize_demo_kilin.users (id) ON DELETE RESTRICT ON UPDATE RESTRICT
)
ENGINE = INNODB
AVG_ROW_LENGTH = 2340
CHARACTER SET utf8
COLLATE utf8_general_ci
ROW_FORMAT = DYNAMIC;