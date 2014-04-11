/**
 * Created by Sagar on 4/5/14.
 */
var trelloApp = angular.module('trello',['firebase']);

trelloApp.controller('body',function($scope,$firebase,data){

    $scope.newUser = false;
    $scope.user = null;
    $scope.people = $firebase(new Firebase("https://fire-suck.firebaseio.com/users"));
    $scope.displayBoards = {};
    $scope.boards = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards"));
    var fireRef;
    $scope.selectedBoard = 0;

    var auth = new FirebaseSimpleLogin(new Firebase("https://fire-suck.firebaseio.com"), function(error, user) {

        if(user){
            $scope.msg = 'Login Success.'
            afterLogIn(user);
        } else {
            $scope.msg = 'Not logged in.';
            afterLogOut();
        }
    });

    var afterLogIn = function(user){
        $scope.isLoggedIn = true;
        $scope.user = user;
        $scope.$apply();
        fireRef =  $firebase(new Firebase("https://fire-suck.firebaseio.com/users/"+user.email.replace(/\./g,"_")));
        $scope.userBoards = fireRef.$child('boards');
        $scope.userBoards.$on('child_added',function(ref){
            var child = ref.snapshot;
            $scope.displayBoards[child.name] = $scope.boards.$child(child.name);
            $scope.$apply();
        })

        $scope.userBoards.$on('child_removed',function(ref){
            var child = ref.snapshot;
            $scope.displayBoards[child.name] = undefined;
            if($scope.selectedBoard.$id == child.name)
                $scope.selectedBoard = 0;
            $scope.$apply();
        })
    }

    var afterLogOut = function(){
        $scope.user = null;
        if(! (typeof $scope.isLoggedIn == 'undefined')){ // was logged in before? or new page load
            $scope.userBoards.$off('child_added')
            $scope.displayBoards = {};
            fireRef = null;
            $scope.userBoards = null;
            $scope.selectedBoard = 0;
        }
        $scope.isLoggedIn = undefined;
        $scope.$apply()
    }

    $scope.login = function(){
        auth.login('password', {
            email: $scope.userName,
            password: $scope.pwd
        });

        $scope.userName = ''
        $scope.pwd = ''
        $scope.msg = 'Wait...'
    };

    $scope.logout = function(){
        auth.logout();
        $scope.msg = 'Wait...'
    };

    $scope.signup = function(){

        $scope.msg = 'Wait...'
        auth.createUser($scope.newUserName, $scope.newPwd, function(error, user) {
            if (!error) {
                $scope.msg = 'Signup success.'
                $firebase(new Firebase("https://fire-suck.firebaseio.com/users/"+user.email.replace(/\./g,"_"))).$child('email').$set(user.email);
                afterLogIn(user);
            } else {
                $scope.msg = error;
            }

        });

        $scope.newUserName = ''
        $scope.newPwd = ''
        $scope.newUser = false;
    };

    $scope.showSignup = function(bool){
        if(bool){
            $scope.newUser = true;
        }else{
            $scope.newUser = false;
        }
    };


    $scope.addBoard = function(){
        $scope.boards.$add({name:$scope.newBoardName,by: $scope.user.email}).then(function(ref) {
            $scope.userBoards.$child(ref.name()).$set(true);
        });
        $scope.newBoardName =''
        $scope.newBoardUser = ""
    }

    $scope.selectedBoard = 0;

    $scope.showShareBtn = function(email){
        return ($scope.user && $scope.shared && $scope.user.email != email && $scope.selectedBoard && $scope.selectedBoard.by == $scope.user.email && email && typeof $scope.shared[email.replace(/\./g,"_")]== 'undefined')
    }

    $scope.showUnshareBtn = function(email){
        return ($scope.user && $scope.shared && $scope.selectedBoard && ($scope.selectedBoard.by == $scope.user.email || $scope.user.email == email ) && email)
    }

    $scope.selectBoard = function(id){
        $scope.selectedBoard = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards/"+id));
        $scope.cards = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards/"+id+"/cards"));
        $scope.shared = $firebase(new Firebase("https://fire-suck.firebaseio.com/boards/"+id+"/shared"));
    }

    $scope.shareWith = function(email){
        $scope.shared.$child(email.replace(/\./g,"_")).$child('email').$set(email);
        $scope.people.$child(email.replace(/\./g,"_")).$child('boards').$child($scope.selectedBoard.$id).$set(true);
    }

    $scope.dontShareWith = function(email){
        $scope.shared.$child(email.replace(/\./g,"_")).$set(null);
        $scope.people.$child(email.replace(/\./g,"_")).$child('boards').$child($scope.selectedBoard.$id).$set(null);
    }

    $scope.addCard = function(){
        $scope.cards.$add({name:$scope.newCardName,by: $scope.user.email});
        $scope.newCardName =''
        $scope.newCardUser = ""
    }

});

trelloApp.factory('data',function(){
    data = {};
    data.setCurrentUser = function(userId){
        localStorage.setItem("currentLoggedInUser", userId);
    };

    data.getCurrentUser = function(){
        return localStorage.getItem("currentLoggedInUser");
    };

    return data;
})