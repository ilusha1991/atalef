angular.module('ProjectHands.read2me')

    .factory("Read2meService", function ($rootScope, $resource, $cookies, Upload, $q) {

        var baseUrl = '/api/readability';
        
        function uploadAudio(uri, file, ownerName) {
            var deferred = $q.defer();
            Upload.upload({
                url: baseUrl + '/uploadAudio',
                data: {
                    uri: uri,
                    file: file,
                    ownerName: ownerName
                }
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, null, function (evt) {

            }).catch(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function deletePhoto(fileId) {
            var deferred = $q.defer();
            $resource(baseUrl + '/delete').delete({
                file_id: fileId
            })
                .$promise
                .then(function (result) {
                    deferred.resolve(result);

                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
        
        function getPhotos(album) {
            var deferred = $q.defer();
            $resource(baseUrl + '/album').query({
                album: album
            }).$promise
                .then(function (result) {
                    console.log(result);
                    deferred.resolve(result);

                })
                .catch(function (error) {
                    console.log(error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function getArticleHtml(uri) {
            var deferred = $q.defer();
            $resource(baseUrl + '/articleHtml').query({
                uri: uri
            }).$promise
                .then(function (result) {
                    console.log(result);
                    deferred.resolve(result);

                })
                .catch(function (error) {
                    console.log(error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }
        
        function getAvailableAudioAndArticle(uri){
            var deferred = $q.defer();
            $resource(baseUrl + '/getAvailableAudioAndArticle').query({
                uri: uri
            }).$promise
                .then(function (result) {
                    console.log(result);
                    deferred.resolve(result);

                })
                .catch(function (error) {
                    console.log(error);
                    deferred.reject(error);
                });

            return deferred.promise;
        }
        
        return {
            getArticleHtml: getArticleHtml,
            deletePhoto: deletePhoto,
            getPhotos: getPhotos,
            uploadAudio: uploadAudio,
            getAvailableAudioAndArticle : getAvailableAudioAndArticle
        };
    });
