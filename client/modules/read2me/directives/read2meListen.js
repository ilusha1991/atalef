angular.module('ProjectHands.read2me')

    .directive('read2meListen', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'modules/read2me/templates/directives/read2meListen.html',
            controller: function ($scope, Read2meService, $sce, $location, $interval) {

                var uri = $location.search().url;
                $scope.isContentLoaded = false;
                $scope.path = '';
                $scope.hasAudio = true;
                $scope.isPlaying = false;
                $scope.getAvailableAudioAndArticle = function (uri) {
                    Read2meService.getAvailableAudioAndArticle(uri)
                        .then(function (data) {
                            console.log('getAvailableAudioAndArticle data', data);
                            $scope.articleHtml = data[0].article;
                            $scope.articleTitle = data[0].title;

                            $scope.title = $sce.trustAsHtml($scope.articleTitle);
                            $scope.article = $sce.trustAsHtml($scope.articleHtml);
                            $scope.path = data[0].audios[0].path;
                            if ($scope.path !== '') {
                                $scope.isContentLoaded = true;
                                source.src = "http://localhost:8080/api/readability/getAudioFile?path=" + $scope.path;
                                audio.load(); //call this to just preload the audio without playing
                                /*audio.play(); //call this to play the song right away*/
                            }
                            else
                            {
                                $scope.hasAudio = false;
                            }
                        })
                        .catch(function (error) {
                            console.log('getAvailableAudioAndArticle error ', error);
                        });
                };
                $scope.getAvailableAudioAndArticle(uri);

                $scope.switchPlaying = function(){
                    if($scope.isPlaying)
                        $scope.pause();
                    else
                        $scope.play();
                };

                var audio = document.getElementById('audio');
                var source = document.getElementById('wavSource');
                var duration = document.getElementById('duration');
                var curTime = document.getElementById('cur_time');
                var progBar = document.getElementById('prog_bar');

                $scope.ctime = 0;
                $scope.duration = 0;
                $scope.audio = audio;
                $scope.progValue = 0;

                $scope.play = function () {
                    audio.play();
                    $scope.isPlaying = true;
                };
                $interval(function () {
                    $scope.progValue = audio.currentTime.toFixed(1) / audio.duration * 100;
                    $scope.ctime = audio.currentTime.toFixed(1);
                    curTime.textContent = toStringTime(audio.currentTime.toFixed(0));
                }, 100);
                $scope.$watch('audio.duration', function (newval) {
                    if (!isNaN(audio.duration)) {
                        duration.textContent = toStringTime(audio.duration.toFixed(0));
                        $scope.duration = audio.duration.toFixed(1);
                    }
                });
                $scope.changetime = function (t) {
                    audio.currentTime = t;
                };

                $scope.pause = function () {
                    audio.pause();
                    $scope.isPlaying = false;
                }

                $scope.seekBack = function () {
                    $scope.changetime(Math.min($scope.ctime - 5, 0));
                }

                $scope.seekForward = function () {
                    $scope.changetime(Math.min(5 + Number($scope.ctime), audio.duration));
                }

                function toStringTime(d) {
                    d = Number(d);
                    var h = Math.floor(d / 3600);
                    var m = Math.floor(d % 3600 / 60);
                    var s = Math.floor(d % 3600 % 60);
                    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
                }
            }
        };
    });