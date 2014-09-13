var Firebase = require('firebase');

var AlchemyAPI = require('../alchemyapi');
var alchemy = new AlchemyAPI();

exports.getSubject = function(req, res) {
  var roomid = req.params.roomid;
  var chatroom = new Firebase("https://tokku.firebaseio.com/chatroom/");

  var text = "";
  chatroom.limit(1).startAt(0).once('child_added', function(snapshot) {
    var chat = snapshot.val();
    console.log(chat);
    for (var key in chat) {
      text += chat[key].body; 
      text += '.  ';
    }
    console.log(text);
    alchemy.taxonomy('text', text, {}, function(response) {
      res.set('Content-Type', 'application/json');
      res.send(response);
    });


  });

}
