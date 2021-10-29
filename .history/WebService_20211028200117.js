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
  // }
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

service.get("/songs/:artist", (request, response) => {
  var provArtist = request.params.artist.substr(1);
  var curArtist = provArtist.replace(/_/g, " ");

  if (musicMap.size == 0) {
    response.json({
      ok: false,
      results: `No songs added by ${curArtist}`,
    });
  } else {
    const art_songs = [];
    const art = curArtist;

    for (let [key, value] of musicMap) {
      if (value[2] == art) {
        art_songs.push(key);
      }
    }

    if (art_songs.length == 0) {
      response.json({
        ok: false,
        results: `No songs added by ${curArtist}`,
      });
    } else {
      response.json({
        ok: true,
        results: art_songs,
      });
    }
  }
});

service.patch("/:song/favorite", (request, response) => {
  var provSong = request.params.song.substr(1);
  var curSong = provSong.replace(/_/g, " ");

  if (!musicMap.has(curSong)) {
    response.json({
      ok: false,
      results: `${curSong} not in database`,
    });
  } else {
    const curID = musicMap.get(curSong)[0];
    const curFav = musicMap.get(curSong)[1] + 1;
    const curArtist = musicMap.get(curSong)[2];
    const curGen = musicMap.get(curSong)[3];
    musicMap.set(curSong, [curID, curFav, curArtist, curGen]);

    response.json({
      ok: true,
      song: curSong,
      id: curID,
      favorites: curFav,
    });
  }
});

service.delete("/:song", (request, response) => {
  var provSong = request.params.song.substr(1);
  var curSong = provSong.replace(/_/g, " ");

  if (!musicMap.has(curSong)) {
    response.json({
      ok: false,
      results: `${curSong} not in database`,
    });
  } else {
    musicMap.delete(curSong);

    response.json({
      ok: true,
      result: `${curSong} deleted from database`,
    });
  }
});

service.delete("/songs/:artist", (request, response) => {
  var provArtist = request.params.artist.substr(1);
  var curArtist = provArtist.replace(/_/g, " ");

  const art_songs = [];
  const art = curArtist;

  for (let [key, value] of musicMap) {
    if (value[2] == art) {
      art_songs.push(key);
    }
  }

  for (let i = 0; i < art_songs.length; i++) {
    musicMap.delete(art_songs[i]);
  }

  response.json({
    ok: true,
    result: `All songs from ${curArtist} deleted from database`,
  });
});

const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});