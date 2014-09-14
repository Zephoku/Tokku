var Firebase = require('firebase');

var AlchemyAPI = require('../alchemyapi');
var alchemy = new AlchemyAPI();

exports.getSentiment = function(req, res) {
  var roomId = req.param('roomId');

  console.log(roomId);
  var chatroom = new Firebase("https://tokku.firebaseio.com/chatroom/" + roomId);
  chatroom.once('value', function(snapshot) {
    var chat = snapshot.val();
    console.log("chat: " + chat);
    var text = "";
    for (var key in chat) {
      text += chat[key].body;
      text += ' ';
    }
    console.log(text);

    alchemy.sentiment('text', text, {}, function(response) {
      res.set('Content-Type', 'application/json');
      console.log(response);
      res.send(response.docSentiment);
    });
  } );

}

exports.getSubject = function(req, res) {
  var customResponse = {};

  var topRoom = new Firebase("https://tokku.firebaseio.com/topId");
  topRoom.once('value', function(snapshot) {
    topId = snapshot.val();
    //console.log(topId);
    var chatroom = new Firebase("https://tokku.firebaseio.com/chatroom/" + topId);
    var text = "";
    chatroom.once('value', function(snapshot) {
      var chat = snapshot.val();
      //console.log(chat);
      for (var key in chat) {
        text += chat[key].body; 
        text += '.  ';
      }
      //console.log(text);
      alchemy.taxonomy('text', text, {}, function(responseTax) {
        customResponse.taxonomy = taxToResponse(responseTax.taxonomy);
        alchemy.concepts('text', text, {}, function(responseConcept) {
          customResponse.concepts = conceptsToResponse(responseConcept.concepts);
            alchemy.keywords('text', text, {}, function(responseKeywords) {
            customResponse.keywords = conceptsToResponse(responseKeywords.keywords);
            res.set('Content-Type', 'application/json');
            res.send(customResponse);
          });
        });
      });


    });

  });

}

function taxToResponse(tax) {
  response = [];
  for (var i in tax) {
    response.push(tax[i].label); 
  }
  return response;
}

function conceptsToResponse(concepts) {
  response = [];
  for (var i in concepts) {
    response.push(concepts[i].text); 
  }
  return response;
}
