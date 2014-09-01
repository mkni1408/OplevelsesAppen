angular.module('starter.services', [])
    //search service that returns a list of search results
    .factory('Search', function ($http, $rootScope) {
        // Might use a resource here that returns a JSON array

        $rootScope.searchResults = [];

        $http({
            method: "GET",
            url: 'http://www.michaelkvistnielsen.dk/app/get_ex.php?longitude=' + 0 + '&latitude=' + 0 + '&kilometers=' + 0,
            headers: {
                "Content-Type": "application/json"
            },
            data: new Blob([JSON.stringify({
                a: 1
            })])
        })

            .success(function (data, status, headers, config) {
                console.log("Called");

                //console.log(data[0][0].toString());
                for (i = 0; i < data.length; i++) {
                    $rootScope.searchResults.push({id: i, name: data[i][1], comment: data[i][2], price: data[i][7], lat: data[i][4], long: data[i][5], opening: data[i][6]});
                }

            })
            .error(function (data, status, headers, config) {
                console.log("Error occurred. 1  Status:" + status);
            });

        return {
            all: function () {
                return $rootScope.searchResults;
            },
            get: function (searchId) {
                // Simple index lookup
                return $rootScope.searchResults [searchId];
            }
        }
    })
    //favorite service that returns a list of saved items
    .factory('Favorites', function ($rootScope) {
        // Might use a resource here that returns a JSON array

        $rootScope.favoriteList = [];

        //get the items from the localstorage
        if (localStorage.getItem("favorites") !== null) {
            $rootScope.favoriteList = JSON.parse(localStorage.favorites);
        }

        return {
            all: function () {
                return $rootScope.favoriteList;
            },
            get: function (searchId) {
                // Simple index lookup
                return $rootScope.favoriteList [searchId];
            }
        }
    });
