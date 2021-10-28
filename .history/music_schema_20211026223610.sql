DROP TABLE IF EXISTS music;

CREATE TABLE music (

    song CHAR,
    id SERIAL,
    favorites INT,
    artist CHAR,
    genre CHAR
);