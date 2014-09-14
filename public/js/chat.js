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

              if (length >= 5 && length < 10) {
                if (level1) {
                  $scope.suggestions.push(suggestions[0]);
                  level1 = false;
                }
              }
              if (length >= 10 && length < 15) {
                if (level2) {
                  $scope.suggestions.push(suggestions[1]);
                  level2 = false;
                }
              }
              if (length >= 15 && length < 20) {
                if (level3) {
                  $scope.suggestions.push(suggestions[2]);
                  level3 = false;
                }
              }
              if (length >= 20 && length < 25) {
                if (level4) {
                  $scope.suggestions.push(suggestions[3]);
                  level4 = false;
                }
              }
              if (length >= 25 && length < 30) {
                if (level5) {
                  $scope.suggestions.push(suggestions[4]);
                  level5 = false;
                }
              }
              if (length >= 30 && length < 35) {
                if (level6) {
                  $scope.suggestions.push(suggestions[5]);
                  level6 = false;
                }
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

                  if (length >= 5 && length < 10) {
                    if (level1) {
                      console.log(level1);
                      $scope.suggestions.push(suggestions[0]);
                      level1 = false;
                      console.log("-1");
                    }
                  }
                  if (length >= 10 && length < 15) {
                    if (level2) {
                      $scope.suggestions.push(suggestions[1]);
                      level2 = false;
                      console.log("-2");
                    }
                  }
                  if (length >= 15 && length < 20) {
                    if (level3) {
                      $scope.suggestions.push(suggestions[2]);
                      level3 = false;
                    }
                  }
                  if (length >= 20 && length < 25) {
                    if (level4) {
                      $scope.suggestions.push(suggestions[3]);
                      level4 = false;
                    }
                  }
                  if (length >= 25 && length < 30) {
                    if (level5) {
                      $scope.suggestions.push(suggestions[4]);
                      level5 = false;
                    }
                  }
                  if (length >= 30 && length < 35) {
                    if (level6) {
                      $scope.suggestions.push(suggestions[5]);
                      level6 = false;
                    }
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
        if($scope.id != null)
          $firebase(waitingRef).$remove($scope.id);
        return null;
      }

      $http.get('/getSubject/').
        success(function(data, status, headers, config) {
          console.log(data);
          for (var i in data.concepts ) {
            suggestions.push(data.concepts[i]);
          }
          for (var i in data.taxonomy ) {
            suggestions.push(data.taxonomy[i]);
          }
          console.log(suggestions);
        }).
      error(function(data, status, headers, config) {
        // log error
      });
    });

