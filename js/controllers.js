angular.module('starter.controllers', [])

//favoritecontroller - controls the favorite view and loads a list of saved favorites
    .controller('FavoriteCtrl', function ($scope, Favorites) {

        $scope.favoriteList = Favorites.all();
        $scope.favoritePlaceholder = 'Du har ikke nogen favoritter endnu, tilføj under fanen "resultater"';


        //set the initial value of placeholder
        if (typeof $scope.favoriteList !== undefined || $scope.favoriteList.length === 0) {
            $scope.favoritePlaceholder = "Du har ikke nogen favoritter endnu, tilføj under fanen resultater";
        } else {
            $scope.favoritePlaceholder = '';
        }
        //watch the favoriteList variable - if it changes, we updata the placeholder
        $scope.$watch('favoriteList', function () {

            if (typeof Favorites.all() === undefined || Favorites.all().length === 0) {
                $scope.favoritePlaceholder = "Du har ikke nogen favoritter endnu, tilføj under fanen resultater";
                console.log("emptylist");
            } else {
                $scope.favoritePlaceholder = '';
            }
        });
    })
//favoritedetailcontroller - is responsible for handeling the favorite details
    .controller('FavoriteDetailCtrl', function ($scope, $rootScope, $stateParams, Favorites, $window) {
        $scope.favoriteContent = Favorites.get($stateParams.favoriteId);

        //local functions
        $scope.shareFavorites = function () {
            console.log("share");
        }
        $scope.navigateToFavorites = function () {
            console.log("navigating to");
            window.location.href = 'geo:' + $scope.favoriteContent.lat + ',' + $scope.favoriteContent.long;
        }
        $scope.deleteFavorite = function () {
            console.log("deleting");
            localStorage.removeItem("favorites");
            $rootScope.favoriteList.splice($scope.favoriteContent.id, 1);
            if($rootScope.favoriteList === undefined){
                //if undefined no items is in the list
            }else {
                //else we trim
                for (var i = 0; i <= $rootScope.favoriteList.length; i++) {
                    $rootScope.favoriteList.id = i;
                    console.log($rootScope.favoriteList.name);

                }
            }

            localStorage.favorites = JSON.stringify($rootScope.favorites);

            $window.history.back();

        }
    })
//resultcontroller - is responsible for presenting a list of search results
    .controller('SearchCtrl', function ($scope, $rootScope, Search, $ionicModal, $timeout, $http, $ionicLoading, $ionicPopup) {

        //get the content
        $scope.contentList = Search.all();
        $scope.seachLong = "";
        $scope.searchLat = "";
        //set the placeholders initial value - will be changed when the user searches
        $scope.searcPlaceholder = 'Du har ikke nogen favoritter endnu, tilføj under fanen "resultater"';
        //check if list is empty.
        //function checkinitialvalues - checks if there are any results for good practice
        if (typeof $scope.contentList !== undefined || $scope.contentList.length === 0) {
            $scope.searcPlaceholder = 'Du har ikke søgt på nogle oplevelser endnu, søg ved at trykke på "Søg" øverst i højre hjørne.';

        } else {
            $scope.searcPlaceholder = '';
        }


        var timeoutId = null;

        //handles the kilometer picker - watches the slider movement
        $scope.$watch('data.volume', function () {

            if (timeoutId !== null) {
                return;
            }
            timeoutId = $timeout(function () {
                $timeout.cancel(timeoutId);
                timeoutId = null;
            }, 1000);


        });

        $scope.$watch('contentList', function () {

            if (typeof $scope.contentList !== undefined || $scope.contentList.length === 0) {
                $scope.searcPlaceholder = 'Du har ikke søgt på nogle oplevelser endnu, søg ved at trykke på "Søg" øverst i højre hjørne.';

            } else {
                $scope.searcPlaceholder = '';
            }
        });

        //definition of the modal that will appear when the search button is pressed - defined in index.html
        $ionicModal.fromTemplateUrl('modal.html', function ($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });


        //setup initial values for the modal
        //address
        $scope.address = { 'address': ''};
        //volumeslider
        $scope.data = { 'volume': '0' };
        //the toggle button variable
        $scope.toggleButton = { checked: false };

        //LOCAL FUNCTIONS

        //Will handle the search button click and
        //trigger the http call to get our entries
        $scope.searchfilter = function () {

            //check i the address or volume is valid
            //if not we show a popup
            if($scope.data.address === "" || $scope.data.address === undefined || $scope.data.volume < 1){

                    var alertPopup = $ionicPopup.alert({
                        title: 'Fejl i indtastning!',
                        template: 'Du skal indtaste en addresse samt vælge en afstand der er større end 0!',
                        animation: 'fade-in',
                        showBackdrop: true
                    });
                    alertPopup.then(function(res) {

                    });

            }else {
                console.log($scope.data.address + $scope.data.volume);
                $scope.getLocationandUpdateList($scope.data.address, $scope.data.volume);
                $scope.modal.hide();
            }
        };
        //loadingindicator - will appear if the user presses the use this location button
        $scope.showLoading = function () {

            $scope.loadingIndicator = $ionicLoading.show({
                content: '<p>Henter addresse - Vent! </p><p><i class="icon ion-loading-d"></i></p>',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 800,
                maxHeight: 800,
                showDelay: 500
            });
        };
        //Will handle the toggle button - calls the get position
        $scope.toggleButtonChange = function () {
            console.log('Push Notification Change', $scope.toggleButton.checked);
            if ($scope.toggleButton.checked === false) {
                //show the loading view
                $scope.showLoading();
                //get current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition($scope.showPosition);
                } else {
                    console.log("Geolocation is not supported by this browser.");
                }

            }

        };
        //function showPosition, that takes a position and translates them into coordinates
        $scope.showPosition = function (position) {
            $scope.codeLatLng(position.coords.latitude, position.coords.longitude);
        }
        // function codeLatLng will handle the retrieval of address from a set of coordinates
        $scope.codeLatLng = function (lat, lng) {
            var geocoder = new google.maps.Geocoder();
            console.log("Getting Address....");

            var latlng = new google.maps.LatLng(lat, lng);
            geocoder.geocode({'latLng': latlng}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    // console.log(results)
                    if (results[1]) {
                        //formatted address
                        var address = results[0].formatted_address;
                        //alert("address = " + address);
                        $scope.data.address = address;
                        $ionicLoading.hide();
                    } else {
                        alert("No results found");
                    }
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            });
        }
        //function getlocationandupdatelist - will translate an address string to a set of coordinates
        $scope.getLocationandUpdateList = function (address, kilometers) {

            var geocoder = new google.maps.Geocoder();
            var address = address;
            var result = '';
            //use google maps geocode to translate the address string to a set of long and lat
            geocoder.geocode({ 'address': address}, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    $scope.searchLat = results[0].geometry.location.lat();
                    $scope.searchLong = results[0].geometry.location.lng();
                    console.log($scope.searchLat + " " + $scope.searchLong);
                    result = 'latitude=' + $scope.searchLat + '&longitude=' + $scope.searchLong;
                    //call the get content function to update our list
                    $scope.getContent(result, kilometers);
                } else {
                    console.log("Geolocation is not supported by this browser.");
                }
            });
        };
        //will calculate a distance between two points - to be used for distance to object
        $scope.calcDistance = function (originLat,originLong,destLat,destLong){

            var p1 = new google.maps.LatLng(originLat, originLong);
            var p2 = new google.maps.LatLng(destLat, destLong);

            return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(1);
        }
        //function getcontent - will handle the search functionality
        $scope.getContent = function (address, kilometers) {

            var resultList = [];
            //get data from server
            $http.get('http://www.michaelkvistnielsen.dk/app/REST/get_ex.php?' + address + '&kilometers=' + kilometers)
                .success(function (data, status, headers, config) {
                    //retrieved data is looped through and added to our resultlist
                    for (i = 0; i < data.length; i++) {
                        resultList.push({id: i, name: data[i][1], comment: data[i][2], price: data[i][7],
                            lat: data[i][4], long: data[i][5], opening: data[i][6],
                            distanceTo: $scope.calcDistance($scope.searchLat,$scope.searchLong,data[i][4],data[i][5])});
                    }
                    //is then added to the global searchlist
                    $rootScope.searchResults = [];
                    $rootScope.searchResults = resultList;

                    //if there was no data we replace text in placeholder
                    if ($rootScope.searchResults.length === 0) {

                        $scope.searcPlaceholder = 'Søgningen gav desværre ingen resultater, prøv igen med andre søgekriterier!';

                    } else {
                        $scope.searcPlaceholder = '';

                    }
                })
                //if we could not retrive any data
                .error(function (data, status, headers, config) {
                    console.log("Error occurred.  Status:" + status);
                });
        };

    })
//result detail controller - is responsible for showing details about the selected item
    .controller('SearchDetailCtrl', function ($scope, $rootScope, $stateParams, Search, $window) {
        $scope.listContent = Search.get($stateParams.friendId);
        //local functions

        $scope.savetoFavorites = function () {
            //add the favorite to the favoritelist
            console.log("saving to favorites");
            var tempexp = Search.get($stateParams.friendId);

            if ($rootScope.favoriteList === undefined) {//if the list is empty we can set the id to 0
                tempexp.id = 0;
                $rootScope.favoriteList = [];
                $rootScope.favoriteList.push(tempexp);

            } else {//else we set it to the last element of the list
                tempexp.id = $rootScope.favoriteList.length;
                $rootScope.favoriteList.push(tempexp);
            }
            //save to local storage
            localStorage.favorites = JSON.stringify($rootScope.favoriteList);


        }
        $scope.share = function () {
            console.log("sharing");
        }
        $scope.navigateTo = function () {
            console.log("navigating to");
            window.location.href = 'geo:' + $scope.listContent.lat + ',' + $scope.listContent.long;
        }

    })
//is not used
    .controller('AccountCtrl', function ($scope) {
    })
//not used
    .controller('ModalCtrl', function ($scope, $timeout, $ionicModal) {

        $scope.myTitle = 'Template';

        $scope.searchFilter = searchFilter;
        function searchFilter() {
            $scope.modal.hide();
        }


        var timeoutId = null;

        $scope.$watch('data.kilometers', function () {


            console.log('Has changed');

            if (timeoutId !== null) {
                console.log('Ignoring this movement');
                return;
            }

            console.log('Not going to ignore this one');
            timeoutId = $timeout(function () {

                console.log('It changed recently!');

                $timeout.cancel(timeoutId);
                timeoutId = null;

                // Now load data from server
            }, 1000);


        });

    });
