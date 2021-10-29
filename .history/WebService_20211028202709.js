const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const path = require("path");
const json = fs.readFileSync("credentials.json", "utf8");
const credentials = JSON.parse(json);
var musicMap = new Map();
var count = 0;

const connection = mysql.createConnection(credentials);
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

// const options = process.argv.slice(2);
// console.log(`Usage: node ${path.basename(process.argv[1])} Extra Options on startup(Choose one): Get_Songs Get_Artists`);
// if(options.length > 0) {

//     if(options[0] === "Get_Songs") {
//         con.query("SELECT songs FROM music", function (err, result, fields) {

//             if (err) {
//                 throw err;
//             } else {

//                 console.log(result);
//             }

//             console.log(result);
//           });
//     }
// }

service.post("/:song", (request, response) => {
  var songR = JSON.parse(JSON.stringify(request.body));
  var provSong = request.params.song.substr(1);
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

        connection.query(insertQuery, parameters, (error, result) => {
          if (error) {
            throw err;
          } else {
            response.json({
              ok: true,
              results: {
                song: curSong,
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

service.get("/songs", (request, response) => {
  // if(musicMap.size == 0) {
  //     response.json({
  //         ok: false,
  //         results: 'No songs added'
  //     })
  // } else {

  connection.query("SELECT song FROM music", function (err, result, fields) {
    // if any error while executing above query, throw error
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
  var provSong = request.params.song.substr(1);
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

service.get("/songs/:genre", (request, response) => {
  var provGenre = request.params.genre.substr(1);
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
        const artistInfo = rows.map(rowToMemory);
        response.json({
          ok: true,
          results: artistInfo,
        });
      }
    }
  );
});

service.get("/songs/:artist", (request, response) => {
  var provArtist = request.params.artist.substr(1);
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

service.patch("/:song/favorite", (request, response) => {
  var provSong = request.params.song.substr(1);
  var curSong = provSong.replace(/_/g, " ");
  let isAdded = false;

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
  var provSong = request.params.song.substr(1);
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
  var provArtists = request.params.song.substr(1);
  var curArtist = provSong.replace(/_/g, " ");

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

const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});
