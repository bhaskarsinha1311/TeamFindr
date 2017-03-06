//module
var TeamApp = angular.module('TeamApp',['ngRoute' , 'ngResource' , 'firebase']);


//Routes

TeamApp.config(function ($routeProvider , $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl:'pages/login.html',
            controller:'AuthCtrl'
        })
        .when('/:id', {
            templateUrl:'pages/home.htm',
            controller:'homeController'
        })
        .when('/:id/list.htm', {
            templateUrl:'pages/list.htm',
            controller:'listController'
        })
        .when('/:id/editSkills.html', {
            templateUrl:'pages/editSkills.html',
            controller:'editController'
        });


    $locationProvider.hashPrefix('');
});

//services
TeamApp.factory('Auth' , function($firebaseAuth) {
    var auth = $firebaseAuth();
    return auth;
});

TeamApp.factory('Ref' , function ($firebaseArray , $firebaseObject) {

    var usersRef = firebase.database().ref('');
    var users = $firebaseArray(usersRef);
    var Users = {
        getProfile: function(uid){
            return $firebaseObject(usersRef.child(uid));
        },
        getDisplayName: function(uid){
            return users.$getRecord(uid).displayName;
        },
        all: users
    };



});


//controllers
TeamApp.controller('AuthCtrl' ,['$rootScope','$scope', '$window','Auth','$location' ,'$firebaseArray' , '$firebaseObject',
    function($rootScope,$scope , $window,Auth, $location , $firebaseArray , $firebaseObject) {

        $scope.test = "I am login";
        var authCtrl = this;
        $scope.email = "";
        $scope.password = "";

// HELPER FUNCTION TO NAVIGATE TO PATH
        $scope.go = function (path) {
            $location.path(path);
        };

        $scope.authChanged = function () {
            console.log("in Auth Changed");
            Auth.$onAuthStateChanged( function (user) {

                if(user === null){
                    $scope.go("/");

                }

                else {
                    console.log("Logged in as: " + user.uid);
                    $scope.uid = user.uid;
                    $scope.go("/" + $scope.uid);
                    const dbRef = firebase.database().ref();
                    const userRef = dbRef.child(user.uid);
                    $scope.object = $firebaseObject(userRef);
                    console.log($scope.object);
                }
            });
        };

        $scope.login = function () {
            console.log("In Login Method");
            Auth.$signInWithEmailAndPassword($scope.email , $scope.password).then(function (auth) {
                console.log("Logged in successfully");
                $scope.authChanged();

            }, function (error) {


                console.log("Error Occured" + error.message);
            });
        };

        $scope.createUser = function () {
            console.log("In create Method");
            Auth.$createUserWithEmailAndPassword($scope.email , $scope.password).then(function (auth) {
                console.log("User Created Successfully");
                //OPEN FORM AND ADD SKILL

                $scope.login();
            }, function (error) {
                console.log("Error Occured" + error.message);
            });
        };
    }]);


TeamApp.controller('homeController' ,['$scope', '$route', '$routeParams', '$location' , function($scope , $route, $routeParams, $location) {

    $scope.param = $routeParams.id;

    // Fetching data from firebase:

    var userId = firebase.auth().currentUser.uid;

    var phone,name,email,skills;

    firebase.database().ref(userId+'/email').on('value', function(snapshot){
        $scope.email = snapshot.val();
    });

    firebase.database().ref(userId+'/phone').on('value', function(snapshot){
        $scope.phone = snapshot.val();
    });

    firebase.database().ref(userId+'/skills').on('value', function(snapshot){
        $scope.skills = snapshot.val();
    });

    firebase.database().ref(userId+'/name').on('value', function(snapshot){
        $scope.name = snapshot.val();
    });

    $scope.redirect = function(){
        $location.path('#/list.htm');
    }

    $scope.redirect2 = function(){
        $location.path('#/editSkills.html');
    }

    $scope.signOut = function () {
        Auth.$signOut();

    }

}]);

TeamApp.controller('listController' ,['$scope', '$route', '$routeParams', '$location' , function($scope , $route, $routeParams, $location) {

    $scope.param = $routeParams.id;

    var allnames;
    var allemails;
    var allphones;


    $scope.searchForSkills = function(value2){

        var names = [];
        var emails = [];
        var phones = [];

        value2 = value2.toLowerCase();
        value2 = value2.trim();

        firebase.database().ref().on('value', function(snapshot){

            snapshot.forEach(function (childSnap) {

                for(var i=0;i<childSnap.val().skills.length;i++){

                    if(childSnap.val().skills[i]==value2) {

                        names.push(childSnap.val().name);
                        emails.push(childSnap.val().email);
                        phones.push(childSnap.val().phone);

                        console.log(childSnap.val().name);
                        break;
                        /*
                        console.log(childSnap.val().email);
                        console.log(childSnap.val().phone);
                        */
                    }

                }

            });
            console.log(names);
        });

        $scope.allnames = names;
        $scope.allemails = emails;
        $scope.allphones = phones;

    }



    }]);


TeamApp.controller('editController' ,['$scope', '$route', '$routeParams', '$location' , function($scope , $route, $routeParams, $location) {

    var userId = firebase.auth().currentUser.uid;
    var skills;
    $scope.param = $routeParams.id;

    firebase.database().ref(userId+'/skills').on('value', function(snapshot){
            $scope.skills = snapshot.val();
    });

    var phone,name,email;

    firebase.database().ref(userId+'/email').on('value', function(snapshot){
        $scope.email = snapshot.val();
    });

    firebase.database().ref(userId+'/phone').on('value', function(snapshot){
        $scope.phone = snapshot.val();
    });

    firebase.database().ref(userId+'/name').on('value', function(snapshot){
        $scope.name = snapshot.val();
    });


    $scope.addThisSkill = function(value3){

        value3 = value3.toLowerCase();
        value3 = value3.trim();

        $scope.skills.push(value3);

        firebase.database().ref(userId).set({
            email: $scope.email ,
            name : $scope.name ,
            phone : $scope.phone ,
            skills : $scope.skills
        });

    }


    $scope.removeThisSkill = function(value4){

        value4 = value4.toLowerCase();
        value4 = value4.trim();

        var newSkills = [];

        for(var i=0;i<$scope.skills.length;i++){
            var item = $scope.skills[i];
            if(item!=value4){
                newSkills.push(item);
            }
        }

        $scope.skills=newSkills;

        firebase.database().ref(userId).set({
            email: $scope.email ,
            name : $scope.name ,
            phone : $scope.phone ,
            skills : $scope.skills
        });

    }

    }]);