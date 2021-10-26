const express = require('express');
var count = 0;

var musicMap = new Map();
const service = express();
service.use(express.json());

service.post('/:song', (request, response) => {
  
    var songR = request.body;
    console.log(request.body);
    var provSong = request.params.song;
    var curSong = provSong.replace(/_/g, ' ');
    const curArtist = songR[0];
    const curGenre = songR[1];
    console.log(curArtist);
    console.log(curGenre);
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






const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});

function decodeJsonBody(request, response, next) {
    if (request.hasJsonBody) {
      request.body = JSON.parse(request.bodyString);
    }
    next();
  }