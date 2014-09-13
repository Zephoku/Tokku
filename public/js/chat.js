var chatApp = angular.module('chat', ['firebase']);
var matchId;

chatApp.controller('chatController', ['$scope', '$firebase',
    function($scope, $firebase) {
      var baseRef = new Firebase("https://tokku.firebaseio.com/");

      var waitingRef = baseRef.child('waiting');
      var chatroomRef = baseRef.child('chatroomRef');
      var privateRoomRef = baseRef;
      var selfIdRef = null;

      $scope.matched = false;
      $scope.loading = false;

      $scope.findNewMatch = function() {
        $firebase(waitingRef).$push({
            matched: false
          }).then(function(newChildRef) {
            selfIdRef = newChildRef.name();
            console.log("added record with id " + newChildRef.name());
          });

        var potentialMatches = $firebase(waitingRef).$asArray();
        potentialMatches.$loaded().then(function() {
          console.log(potentialMatches);
          if(potentialMatches.length > 1) {
            matchId = potentialMatches[0].$id;
            $firebase(chatroomRef).$push({
              roomId: "init"
            }).then(function(newChildRef) {
              var roomId = newChildRef.name();
              var matchRef = waitingRef.child(matchId);
              $firebase(matchRef).$set({
                matched: roomId
              });
              privateRoomRef = chatroomRef.child(roomId);
              $scope.matched = true;
              $scope.messages = $firebase(privateRoomRef).$asArray();
              $firebase(waitingRef).$remove(selfIdRef);
            });
          } else {
            console.log("no match");
            $scope.loading = true;
            var room = $firebase(waitingRef.child(selfIdRef)).$asObject();
            room.$watch(function() {
              if(room.matched) {
                privateRoomRef = chatroomRef.child(room.matched);
                $scope.matched = true;
                $scope.messages = $firebase(privateRoomRef).$asArray();
                $firebase(waitingRef).$remove(selfIdRef);

                $scope.loading = false;
              }
            });


          }
        });

      }

      $scope.messages = null;
      $scope.addMessage = function(e) {
        if (e.keyCode === 13 && $scope.msg) {
          var name = $scope.name || 'anonymous';
          $scope.messages.$add({
            from: name,
            body: $scope.msg
          });
          $scope.msg = "";
        }
      }
    }

]);

