var app = angular.module('app', ['ui.router', 'ngAnimate', 'ngMaterial', 'ngCookies', 'ngFileUpload', 'lr.upload', 'ngSanitize', 'ui.bootstrap', 'angular-smilies']);

app.config(function($mdThemingProvider, $stateProvider, $qProvider, $urlRouterProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $urlRouterProvider.otherwise('');
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $stateProvider
        //TODO ändra state-address i samtliga
        .state('app', {
            url: '',
            controller: 'appController',
            template: '<ui-view></ui-view>',
            resolve: {
                sessionUser: function(userService) {
                    return userService.restoreSession();
                },
                channels : function(channelService) {
                    return channelService.getAll();
                }
            }
        }) 
        .state('app.login', {
            url: '/login',
            controller : 'loginController',
            templateUrl: 'assets/partials/login.html'
        })
        .state('app.chat', {
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
                userContacts: function(userService) {
                    return userService.getUsers();
                }
            }
        })
        .state('app.settings', {
            url: '/settings',
            controller: 'settingsController',
            templateUrl: 'assets/partials/settings.html'
        })
        .state('app.addChannel', {
            url: '/addChannel',
            controller: 'channelController',
            templateUrl: 'assets/partials/addChannel.html'
        });
});

app.controller('appController', function($state, sessionUser, userService, channels, channelService) {
    console.log('appController');
    if (channels.length > 0) {
        channelService.current = channels[0];
        console.log('current', channelService.current);
    }
    if (sessionUser) {
        console.log('active', sessionUser);
        userService.active = sessionUser;
        $state.go('app.chat');
    } else {
        $state.go('app.login');
    }
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

app.factory("userService", ["REST", '$q', '$cookies', function(REST, $q, $cookies) {
    var url = '/users';
    return{
        active: null,

        restoreSession: function() {
            var user = $cookies.get('user');
            if (user) {
                return REST.get('/user?id=' + user);
            } else {
                return null;
            }
        },
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
