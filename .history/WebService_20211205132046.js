const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const fsPromises = require("fs").promises;
const path = require("path");
const json = fs.readFileSync("credentials.json", "utf8");
const credentials = JSON.parse(json);
var musicMap = new Map();
var count = 0;

const connection = mysql.createConnection({
  user: "music_record_user",
  password: "password",
  database: "music_record",
});

connection.connect((error) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

const service = express();
service.use(express.json());

function rowToMemory(row) {
  return {
    song: row.song,
    id: row.id,
    favorites: row.favorites,
    artist: row.artist,
    genre: row.genre,
  };
}

service.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// service.options("*", (request, response) => {
//   response.set("Access-Control-Allow-Headers", "Content-Type");
//   response.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
//   response.sendStatus(200);
// });

service.post("/:song", (request, response) => {
  var songR = JSON.parse(JSON.stringify(request.body));
  var provSong = request.params.song;
  var curSong = provSong.replace(/_/g, " ");
  const curArtist = Object.keys(songR)[0];
  const curGenre = songR[curArtist];

  connection.query("SELECT song FROM music", function (err, result, fields) {
    let isAdded = false;
    // if any error while executing above query, throw error

    if (err) {
      throw err;
    } else {
      if (Object.keys(result).length != 0) {
        for (var i = 0; i < Object.keys(result).length; i++) {
          var db_song = result[i].song;
          if (db_song == curSong) {
            isAdded = true;
          }
        }
      }

      if (isAdded) {
        response.status(404);
        response.json({
          ok: false,
          results: `Song already added: ${curSong}`,
        });
      } else {
        let insertQuery =
          "INSERT INTO music(song,favorites,artist,genre) VALUES (?, ?, ?, ?)";
        let parameters = [curSong, 0, curArtist, curGenre];

        connection.query(insertQuery, parameters, (error) => {
          if (error) {
            throw err;
          } else {
            response.json({
              ok: true,
              results: {
                song: curSong,
                favorites: 0,
                artist: curArtist,
                genre: curGenre,
              },
            });
          }
        });
      }
    }
  });
});

service.get("/report.html", (request, response) => {
  const fileName = "report.html";
  fsPromises
    .readFile(fileName, "utf8")
    .then((text) => {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html");
      response.write(text);
      response.end();
    })
    .catch((error) => {
      response.statusCode = 404;
      response.end();
    });
});

service.get("/songs", (request, response) => {
  connection.query("SELECT * FROM music", function (err, result, fields) {
    if (err) {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      }
    } else {
      if (Object.keys(result).length == 0) {
        response.json({
          ok: false,
          results: "No songs added",
        });
      } else {
        response.json({
          ok: true,
          results: result,
        });
      }
    }
  });
});

service.get("/:song", (request, response) => {
  var provSong = request.params.song;
  var curSong = provSong.replace(/_/g, " ");

  const parameters = [curSong];
  connection.query(
    "SELECT * FROM music WHERE song = ?",
    parameters,
    (error, rows) => {
      let isAdded = false;
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        if (Object.keys(rows).length != 0) {
          for (var i = 0; i < Object.keys(rows).length; i++) {
            var db_song = rows[i].song;
            if (db_song == curSong) {
              isAdded = true;
            }
          }
        }

        if (isAdded) {
          const songInfo = rows.map(rowToMemory);
          response.json({
            ok: true,
            results: songInfo,
          });
        } else {
          response.json({
            ok: false,
            results: `${curSong} not in database`,
          });
        }
      }
    }
  );
});

service.get("/songs/artists", (request, response) => {
  connection.query("SELECT artist FROM music", (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      const artistInfo = rows.map(rowToMemory);
      response.json({
        ok: true,
        results: artistInfo,
      });
    }
  });
});

service.get("/songs/music/:genre", (request, response) => {
  var provGenre = request.params.genre;
  var curGenre = provGenre.replace(/_/g, " ");

  let parameters = [curGenre];
  connection.query(
    "SELECT * FROM music WHERE genre = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        const genreInfo = rows.map(rowToMemory);
        response.json({
          ok: true,
          results: genreInfo,
        });
      }
    }
  );
});

service.get("/songs/:artist", (request, response) => {
  var provArtist = request.params.artist;
  var curArtist = provArtist.replace(/_/g, " ");

  let parameters = [curArtist];
  connection.query(
    "SELECT * FROM music WHERE artist = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        const artistInfo = rows.map(rowToMemory);
        response.json({
          ok: true,
          results: artistInfo,
        });
      }
    }
  );
});

service.patch("/:id", (request, response) => {
  var songID = request.params.id;

  var songInfo = JSON.parse(JSON.stringify(request.body));

  const curSong = Object.keys(songInfo)[0];
  const curArtist = songInfo[curSong][0];
  const curGenre = songInfo[curSong][1];

  let parameters = [curSong, songID, curArtist, curGenre, songID];

  connection.query(
    "UPDATE music SET song = ?, id = ?, favorites = 0, artist = ?, genre = ? WHERE id = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: `${curSong} information updated`,
        });
      }
    }
  );
});

service.patch("/:song/favorite", (request, response) => {
  var provSong = request.params.song;
  var curSong = provSong.replace(/_/g, " ");

  const parameters = [curSong];
  connection.query(
    "UPDATE music SET favorites = favorites + 1 WHERE song = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        if (Object.keys(rows).length != 0) {
          response.json({
            ok: true,
            results: `Added favorite to ${curSong}`,
          });
        } else {
          response.json({
            ok: false,
            results: `${curSong} not in database`,
          });
        }
      }
    }
  );
});

service.delete("/:song", (request, response) => {
  var provSong = request.params.song;
  var curSong = provSong.replace(/_/g, " ");

  let parameters = [curSong];
  connection.query(
    "DELETE FROM music WHERE song = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: `${curSong} deleted from database`,
        });
      }
    }
  );
});

service.delete("/songs/:artist", (request, response) => {
  var provArtist = request.params.artist;
  var curArtist = provArtist.replace(/_/g, " ");

  let parameters = [curArtist];
  connection.query(
    "DELETE FROM music WHERE artist = ?",
    parameters,
    (error, rows) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        response.json({
          ok: true,
          results: `All songs from ${curArtist} deleted from database`,
        });
      }
    }
  );
});

function decodeJsonBody(request, response, next) {
  if (request.hasJsonBody) {
    request.body = JSON.parse(request.bodyString);
  }
  next();
}

const port = 5001;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});
