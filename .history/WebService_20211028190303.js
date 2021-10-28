const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);
var musicMap = new Map();
var count = 0;

const connection = mysql.createConnection(credentials);
connection.connect(error => {
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


service.post('/:song', (request, response) => {
  
    var songR = JSON.parse(JSON.stringify(request.body));
    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');
    const curArtist = Object.keys(songR)[0];
    const curGenre = songR[curArtist];
    var isAdded = false;

    connection.query("SELECT song FROM music", function (err, result, fields) {
        // if any error while executing above query, throw error
        if (err) {
            throw err;
        } else {
     
            if(Object.keys(result).length == 0) {
                isAdded = false;
            }else {
                for(var i = 0; i < Object.keys(result).length; i++) {

                    var db_song = result[i].song;
                    
                    console.log("key is " + db_song);
                    console.log("cur_song is " + curSong);
                    console.log(db_song == curSong);
                    console.log(db_song === curSong);
                    if(db_song == curSong) {
                        
                        isAdded = true;
                        response.status(404);
                        response.json({
                            ok: false,
                        results: `Song already added: ${curSong}`
                        })
                    }
                }

                const insertQuery = 'INSERT INTO music(song,favorites,artist,genre) VALUES (?, ?, ?, ?)';
        const parameters = [curSong, 0, curArtist, curGenre];

        connection.query(insertQuery, parameters, (error, result) => {
            if (error) {

                Object.keys(result).forEach(function(key) {

                    var row = result[key];
                    console.log(row.name)
                  });
                
                console.log(error);
                response.json({
                    ok: false,
                    results: 'not added'
                }) 
                
            } else {
                response.json({
                    ok: true,
                    results: {
                      song: curSong,
                      artist: curArtist,
                      genre: curGenre
                  
                    }
                
                })
                
            }
            
          });
                    
            }
            
            
        }
    });
    console.log("isAdded is2 " + isAdded);
    if(isAdded) {
      response.status(404);
      response.json({
        ok: false,
        results: `Song already added: ${curSong}`
      })
    } else {
      

        const insertQuery = 'INSERT INTO music(song,favorites,artist,genre) VALUES (?, ?, ?, ?)';
        const parameters = [curSong, 0, curArtist, curGenre];

        connection.query(insertQuery, parameters, (error, result) => {
            if (error) {

                Object.keys(result).forEach(function(key) {

                    var row = result[key];
                    console.log(row.name)
                  });
                
                console.log(error);
                response.json({
                    ok: false,
                    results: 'not added'
                }) 
                
            } else {
                response.json({
                    ok: true,
                    results: {
                      song: curSong,
                      artist: curArtist,
                      genre: curGenre
                  
                    }
                
                })
                
            }
            
          });

      
    }
});

service.get('/songs', (request, response) =>{


    // if(musicMap.size == 0) {
    //     response.json({
    //         ok: false,
    //         results: 'No songs added'
    //     })
    // } else {

        connection.query("SELECT song FROM music", function (err, result, fields) {
            // if any error while executing above query, throw error
            if (err) {
                throw err;
            } else {

                if(Object.keys(result).length == 0) {
                    response.json({
                        ok: false,
                        results: 'No songs added'
                    })
                }else {
                    response.json({
                        ok: true,
                        results: result,
                    })
                }
                
            }
          });
    // }



});

service.get('/:song', (request, response) =>{
    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');
    if(!musicMap.has(curSong)) {
        response.json({
            ok: false,
            results: `${curSong} has not been added`
        })
    } else {


        response.json({
            ok: true,
            results: {
                song: curSong,
                id: musicMap.get(curSong)[0],
                favorites: musicMap.get(curSong)[1],
                artist: musicMap.get(curSong)[2],
                genre: musicMap.get(curSong)[3],
            }
        })
    }

});

service.get('/songs/artists', (request, response) =>{
    if(musicMap.size == 0) {
        response.json({
            ok: false,
            results: `No artists added`
        })
    } else {

        var all_art = Array.from(musicMap.values());
        
        const art_set = new Set();

        for(let i = 0; i < all_art.length; i++) {
            var curArtist = all_art[i] = all_art[i][2];
            
            if(!art_set.has(curArtist)) {
                art_set.add(curArtist);
            }
            
            
        }

        response.json({
            ok: true,
            results: Array.from(art_set.values()),
        })
    }
});


service.get('/songs/:artist', (request, response) =>{

    var provArtist = request.params.artist.substr(1);
    var curArtist = provArtist.replace(/_/g, ' ');

    if(musicMap.size == 0) {
        response.json({
            ok: false,
            results: `No songs added by ${curArtist}`
        })
    } else {

        const art_songs = [];
        const art = curArtist;
    
        for(let [key, value] of musicMap) {
            
            if(value[2] == art) {
                art_songs.push(key);
            }
        }

        if(art_songs.length == 0) {
            response.json({
                ok: false,
                results: `No songs added by ${curArtist}`
            })
        } else {
            response.json({
            ok: true,
            results: art_songs,
        })
    }
    }
});


service.patch('/:song/favorite' , (request, response) => {

    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');

    if(!musicMap.has(curSong)) {

        response.json({
            ok: false,
            results: `${curSong} not in database`
        })
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
        })
    }


});


service.delete('/:song', (request , response) => {

    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');
    
    if(!musicMap.has(curSong)) {

        response.json({
            ok: false,
            results: `${curSong} not in database`
        })
    } else {

        
        musicMap.delete(curSong);

        response.json({
            ok: true,
            result: `${curSong} deleted from database`
        })
    }


});

service.delete('/songs/:artist', (request , response) => {

    var provArtist = request.params.artist.substr(1);
    var curArtist = provArtist.replace(/_/g, ' ');
    
    const art_songs = [];
    const art = curArtist;
    
    for(let [key, value] of musicMap) {
            
        if(value[2] == art) {
            art_songs.push(key);
        }
    }
        
    for(let i = 0; i < art_songs.length; i++) {
        musicMap.delete(art_songs[i]);
        
    }

    response.json({
        ok: true,
        result: `All songs from ${curArtist} deleted from database`
    })
    
    



});



const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});


function checkIfAdded(given_song) {
    let isAdded = false;

    connection.query("SELECT song FROM music", function (err, result, fields) {
        // if any error while executing above query, throw error
        if (err) {
            throw err;
        } else {

            
            if(Object.keys(result).length == 0) {
                isAdded = false;
            }else {
                for(var i = 0; i < Object.keys(result).length; i++) {

                    var db_song = result[i].song;
                    
                    console.log("key is " + db_song);
                    console.log("cur_song is " + given_song);
                    console.log(db_song == given_song);
                    console.log(db_song === given_song);
                    if(db_song == given_song) {
                        
                        isAdded = true;
                    }
                }
                // Object.keys(result).forEach(function(key) {
                //     var db_song = result[key].song;
                //     var cur_song = given_song;
                //     // console.log("key is " + db_song);
                //     // console.log("cur_song is " + cur_song);
                //     // console.log(db_song == db_song);
                //     // console.log(db_song === cur_song);
                //     if(db_song == cur_song) {
                        
                //         isAdded = true;
                //     }
                // });
                    
            }
            console.log("isAdded is1 " + isAdded);
            return isAdded;
            
        }
    });
    console.log("isAdded is2 " + isAdded);
    return isAdded;
}

