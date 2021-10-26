const express = require('express');
var count = 0;

var musicMap = new Map();
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
    if(!musicMap.has(provSong)) {
        response.json({
            ok: false,
            results: '${provSong} has not been added'
        })
    } else {


        response.json({
            ok: true,
            results: {
                song: provSong,
                id: musicMap.get(provSong)[0],
                favorites: musicMap.get(provSong)[1],
                artist: musicMap.get(provSong)[2],
                genre: musicMap.get(provSong)[3],
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

        var art_list = Array.from(musicMap.values());

        for(let i = 0; i < art_list.length; i++) {
            art_list[i] = art_list[i][2]
        }

        response.json({
            ok: true,
            results: art_list.sort(),
        })
    }
});


service.get('/songs/artist', (request, response) =>{

    if(musicMap.size == 0) {
        response.json({
            ok: false,
            results: 'No songs added by ${request.params.artist}'
        })
    } else {

        var art_songs = []
        const art = request.params.artist;
    
        for(let i = 0; i < musicMap.length; i++) {
            
            if(musicMap[i][2] == art) {
                art_songs.push(musicMap[i]);
            }
        }

        if(art_songs.length == 0) {
            response.json({
                ok: false,
                results: 'No songs added by ${request.params.artist}'
            })
        }
        response.json({
            ok: true,
            results: art_songs,
        })
    }



});






const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});

