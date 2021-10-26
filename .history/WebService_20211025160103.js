const express = require('express');
var count = 0;

var musicMap = new Map();
const service = express();
service.use(express.json());

service.post('/:song', (request, response) => {
  
    var songR = JSON.parse(JSON.stringify(request.body));
    console.log(curAll);
    const curWord = Object.keys(curAll)[0];
    if(wordMap.has(curWord)) {
      response.status(404);
      response.json({
        ok: false,
        results: `Name already added: ${curWord}`
      })
    } else {
      

      wordMap.set(curWord, [wordMap.size, 0, curAll[curWord]]);
      response.json({
        ok: true,
        results: {
          word: curWord,
          id: wordMap.get(curWord)[0],
          likes: wordMap.get(curWord)[1],
          definition: wordMap.get(curWord)[2],
          
        }
        
      })

      
    }
});






const port = 8443;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});