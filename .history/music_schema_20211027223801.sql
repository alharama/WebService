DROP TABLE IF EXISTS music;

CREATE TABLE music (

    song CHAR(50),
    id SERIAL,
    favorites INT,
    artist CHAR(50),
    genre CHAR(50)
);