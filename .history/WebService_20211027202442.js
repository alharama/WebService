const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const json = fs.readFileSync('credentials.json', 'utf8');
const credentials = JSON.parse(json);

var musicMap = new Map();
var count = 0;


const service = express();
service.use(express.json());

service.post('/:song', (request, response) => {
  
    var songR = JSON.parse(JSON.stringify(request.body));
    console.log(songR);
    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');
    const curArtist = Object.keys(songR)[0];
    const curGenre = songR[curArtist];

    if(musicMap.has(curSong)) {
      response.status(404);
      response.json({
        ok: false,
        results: `Song already added: ${curSong}`
      })
    } else {
      

      musicMap.set(curSong, [count, 0, curArtist, curGenre]);
      count+=1; 

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

service.get('/songs', (request, response) =>{
    if(musicMap.size == 0) {
        response.json({
            ok: false,
            results: 'No songs added'
        })
    } else {

        response.json({
            ok: true,
            results: Array.from(musicMap.keys()).sort(),
        })
    }



});

service.get('/:song', (request, response) =>{
    var provSong = request.params.song.substr(1);
    var curSong = provSong.replace(/_/g, ' ');
    if(!musicMap.has(curSong)) {
        response.json({
            ok: false,
            results: '${curSong} has not been added'
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
            results: 'No artists added'
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
    console.log(curArtist);

    if(musicMap.size == 0) {
        response.json({
            ok: false,
            results: 'No songs added by ${curArtist}'
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
                results: 'No songs added by ${curArtist}'
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
            results: '${curSong} not in database'
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
            results: '${curSong} not in database'
        })
    } else {

        
        musicMap.delete(curSong);

        response.json({
            ok: true,
            result: '${curSong} deleted from database'
        })
    }


});



const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});

