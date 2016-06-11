angular.module('ProjectHands')

    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

        $stateProvider.state('renovation_dashboard', {
            url: '/renovation_dashboard',
            templateUrl: 'templates/renovation_dashboard.html',
            controller: 'renovationDashboardController'
        });
        
        $locationProvider.html5Mode(true);
    });
