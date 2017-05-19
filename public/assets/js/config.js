var app = angular.module('app', ['ui.router', 'ngAnimate', 'ngMaterial', 'ngCookies', 'ngFileUpload', 'lr.upload', 'ngSanitize', 'ui.bootstrap', 'angular-smilies']);

app.config(function($mdThemingProvider, $stateProvider, $qProvider, $urlRouterProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $urlRouterProvider.otherwise('login');
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $stateProvider
        .state('login', {
            url: '/login',
            controller : 'loginController',
            //use assets folder in the search path
            templateUrl: 'assets/partials/login.html'
            //add controller
        })
        .state('chat', {
            url:'/chat',
            controller: 'chatController',
            templateUrl: 'assets/partials/chat.html',
            resolve: {
                currentChannel: function(channelService) {
                    return channelService.get('?id=' + channelService.current._id);
                },
                userChannels: function(channelService, userService) {
                    return channelService.getChannelsForUser(userService.active._id);
                },
                userContacts: function(userService){
                    return userService.getUsers();
                }


            }
        })
        .state('settings', {
            url: '/settings',
            controller: 'settingsController',
            templateUrl: 'assets/partials/settings.html'
        })
        .state('addChannel', {
            url: '/addChannel',
            controller: 'channelController',
            templateUrl: 'assets/partials/addChannel.html'
        });
});

app.factory('REST', ['$http', '$q', function($http, $q) {
    return {
        get: function get(url) {
            return $q(function(resolve) {
                $http.get(url).then(function(response) {
                    resolve(response.data);
                });
            });
        },
        post: function post(url, body) {
            return $q(function(resolve) {
                $http.post(url, body).then(function(response) {
                    resolve(response);
                });
            });
        },
        put: function put(url, body) {
            return $q(function(resolve) {
                $http.put(url, body).then(function(response) {
                    resolve(response);
                });
            });
        }
    };
}]);

app.factory("userService", ["REST", function(REST) {
    var url = '/users';
    return{
        active: null,

        post: function (user){
            return REST.post(url, user);
        },
        updateUser: function (user){
            return REST.put(url, user);
        },
        getUsers: function(){
            return REST.get(url);
        }
    };
}]);

app.factory("messageService", ["REST", function (REST) {
    var url = '/messages';
    return {
        post: function(message) {
            return REST.post(url, message);
        },
        getAllMessages: function(query) {
            //console.log("messageService.get query: ",query);
            return REST.get(url + query);
        }
    };
}]);

angular.module('app').factory('channelService', function(REST, userService) {
    var url = '/channel';
    return {
        current: null,

        post: function(channel) {
            return REST.post(url, channel);
        },
        get: function(query) {
            //console.log("channelService.get Url + query", url + query);
            return REST.get(url + query);
        },
        getAll: function() {
            return REST.get('/channels');
        },
        getChannelsForUser: function(userId) {
            return REST.get('/channels?user=' + userId);
        },
        updateTimeStamp: function(channel) {
            return REST.put(url,channel);
        }
    };
});

app.run(function($rootScope, $cookies, channelService) {
    //$rootScope.channels = [];
    console.log('cookie', $cookies.get('user'));

    $rootScope.checkChannels = function() {
        channelService.getAll().then(function(response) {
            if (response.length === 0) {
                $rootScope.generateChannels();
            } else {
                $rootScope.channels = response;
                //NOTE: Sets current channel first entry.
                //TODO: Channel should / MUST be set when user logs in.
                channelService.current = $rootScope.channels[0];
            }
        });
    };

    $rootScope.generateChannels = function() {
        var channels = [{
            name: "General",
            purpose: '',
            accessability: 'public',
            users: [],
            timestamp: ''
        }, {
            name: "Work",
            purpose: '',
            accessability: 'public',
            users: [],
            timestamp: ''
        }, {
            name: "Afterwork",
            purpose: '',
            accessability: 'public',
            users: [],
            timestamp: ''
        }, {
            name: "Crazy cat-lady Videos",
            purpose: '',
            accessability: 'public',
            users: [],
            timestamp: ''
        }, {
            name: "pr0n",
            purpose: '',
            accessability: 'public',
            users: [],
            timestamp: ''
        }];
        channelService.post(channels).then(function(response){
            //console.log("Generating new channels.", response);
            $rootScope.checkChannels();
        });
    };
    $rootScope.checkChannels();
});
