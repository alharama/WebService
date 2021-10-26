const express = require('express');
var count = 0;

var musicMap = new Map();
const service = express();
service.use(express.json());

service.post('/:song', (request, response) => {
  
    var songR = JSON.parse(JSON.stringify(request.body));
    console.log(songR);
    var curSong = request.params.song.replaceAll(_, ' ');
    
    const curArtist = Object.keys(songR)[0];
    const curGenre = Object.keys(songR)[1];
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