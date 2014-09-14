var chatApp = angular.module('chat', ['firebase']);

chatApp.controller('chatController',
    function($scope, $http,  $firebase) {
      var baseRef = new Firebase("https://tokku.firebaseio.com/");

      var matchId;
      var waitingRef = baseRef.child('waiting');
      var chatroomRef = baseRef.child('chatroom');
      var privateRoomRef = baseRef;
      var roomId;
      var suggestions = [];
      var level1 = true;
      var level2 = true;
      var level3 = true;
      var level4 = true;
      var level5 = true;
      var level6 = true;
      $scope.id = null;

      $scope.matched = false;
      $scope.loading = false;
      $scope.suggestions = [];

      $scope.findNewMatch = function() {
        $firebase(waitingRef).$push({
          matched: false
        }).then(function(newChildRef) {
          console.log("Waiting Pushed");
          $scope.id = newChildRef.name();
          console.log("added record with id " + newChildRef.name());
        });

        var potentialMatches = $firebase(waitingRef).$asArray();
        potentialMatches.$loaded().then(function() {
          console.log(potentialMatches);
          if(potentialMatches.length > 1) {
            matchId = potentialMatches[0].$id;
            console.log("Matched!")
          $firebase(chatroomRef).$push({
            "-A": {
              from: "System",
            body: "Matched!"
            }
          }).then(function(newChildRef) {
            roomId = newChildRef.name();
            console.log("RoomID: " + roomId);
            var matchRef = waitingRef.child(matchId);
            $firebase(matchRef).$set({
              matched: roomId
            });
            privateRoomRef = chatroomRef.child(roomId);
            $scope.matched = true;
            $scope.messages = $firebase(privateRoomRef).$asArray();
            $firebase(waitingRef).$remove($scope.id);
            $scope.messages.$watch(function() {
              $(".chat").scrollTop($(".chat")[0].scrollHeight-100);
              var length = $scope.messages.length;
              console.log(suggestions);
              console.log("Length: " + length);

              if (length % 5 == 0) {
                var sug = getNextSuggestion(suggestions);
                if (sug != null)
                  $scope.suggestions.unshift(sug);
              }

            });
          });
          } else {
            console.log("no match");
            $scope.loading = true;
            var room = $firebase(waitingRef.child($scope.id)).$asObject();
            room.$watch(function() {
              if(room.matched) {
                privateRoomRef = chatroomRef.child(room.matched);
                $scope.matched = true;
                $scope.messages = $firebase(privateRoomRef).$asArray();
                $firebase(waitingRef).$remove($scope.id);

                $scope.loading = false;
                $scope.messages.$watch(function() {
                  $(".chat").scrollTop($(".chat")[0].scrollHeight);
                  var length = $scope.messages.length;
                  console.log(suggestions);
                  console.log("Length: " + length);

                  if (length % 5 == 0) {
                    var sug = getNextSuggestion(suggestions);
                    if (sug != null)
                      $scope.suggestions.unshift(sug);
                  }

                });

              }
            });


          }
        });

      }

      $scope.messages = null;
      $scope.addMessage = function(e) {
        $scope.messages.$watch(function() {
          $(".chat").scrollTop($(".chat")[0].scrollHeight);
        });

        if (e.keyCode === 13 && $scope.msg) {
          var name = $scope.name || 'anonymous';
          $scope.messages.$add({
            id: $scope.id,
            from: name,
            body: $scope.msg
          });
          $scope.msg = "";
        }

        var topCount = $firebase(baseRef.child('topCount')).$asObject();
        topCount.$loaded().then(function() {
          console.log(topCount.$value);
          if( $scope.messages.length > topCount.$value ) {
            console.log("RoomId: " + $scope.id);
            $firebase(baseRef.child('topId')).$set(privateRoomRef.name());
            $firebase(baseRef.child('topCount')).$set($scope.messages.length);
          }
        });

        $(".chat").scrollTop($(".chat")[0].scrollHeight);
      }

      window.onbeforeunload = closingCode;
      function closingCode(){
        $firebase(waitingRef).$remove($scope.id);
        $scope.messages.$add({
          id: $scope.id,
          from: "System",
          body: "The other person has disconnected"
        });
        return null;
      }

      $http.get('/getSubject/').
        success(function(data, status, headers, config) {
          suggestions = data;
        }).
      error(function(data, status, headers, config) {
        // log error
      });
    });

function getNextSuggestion(suggestions) {
  if (suggestions.length == 0) 
    return null;

  var toReturn = null;

  console.log("In Suggestion");
  while(true) {
    var rand = Math.floor(Math.random() * 3) + 1;
    var toReturn;

    if (suggestions.concepts.length == 0 &&
        suggestions.taxonomy.length == 0 &&
        suggestions.keywords.length == 0)
      return null;

    if (rand == 1) {
      if (suggestions.concepts.length == 0) {
        continue;
      }
      console.log("In concept");
      toReturn =  {
        category: 'concepts',
        text: "Try mentioning " + suggestions.concepts.shift() + "."
      };
    }
    if (rand == 2) {
      if (suggestions.taxonomy.length == 0) {
        continue;
      } 
      console.log("In tax");
      toReturn =  {
        category: 'taxonomy',
        text: "Consider talking about " + suggestions.taxonomy.shift() + "."
      };
    }
    if (rand == 3) {
      if (suggestions.keywords.length == 0) {
        continue;
      }
      console.log("In keyt");
      toReturn =  {
        category: 'keywords',
        text: "Others talked about " + suggestions.keywords.shift() + "."
      };
    }
    
    return toReturn;
  }

}
