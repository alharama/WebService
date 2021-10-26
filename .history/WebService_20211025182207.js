const express = require('express');
var count = 0;

var musicMap = new Map();
const service = express();
service.use(express.json());

service.post('/:song', (request, response) => {
  
    var songR = JSON.parse(JSON.stringify(request.body));
    console.log(songR);
    var provSong = request.params.song;
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
            results: Array.sort(Array.from(musicMap.keys())),
        })
    }



});






const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});

