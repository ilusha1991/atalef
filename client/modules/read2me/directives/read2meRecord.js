angular.module('ProjectHands.read2me')

    .directive('read2meRecord', function () {
        return {
            restrict: 'E',
            scope: {album: '@'},
            replace: true,
            templateUrl: 'modules/read2me/templates/directives/read2meRecord.html',
            controller: function ($interval, $scope, $mdToast, Upload, $timeout, Read2meService, $mdDialog, $mdMedia, $sce, $window, $location) {

                var last = {
                    bottom: true,
                    top: false,
                    left: true,
                    right: true
                };
                $scope.toastPosition = angular.extend({},last);
                $scope.getToastPosition = function() {
                    sanitizePosition();
                    return Object.keys($scope.toastPosition)
                        .filter(function(pos) { return $scope.toastPosition[pos]; })
                        .join(' ');
                };
                function sanitizePosition() {
                   /* var current = $scope.toastPosition;
                    if ( current.bottom && last.top ) current.top = false;
                    if ( current.top && last.bottom ) current.bottom = false;
                    if ( current.right && last.left ) current.left = false;
                    if ( current.left && last.right ) current.right = false;*/
                    last = angular.extend({},last);
                }
                $scope.showSimpleToast = function(text) {
                    var pinTo = $scope.getToastPosition();
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent(text)
                            .position(pinTo )
                            .hideDelay(3000)
                    );
                };
                $scope.showActionToast = function() {
                    var pinTo = $scope.getToastPosition();
                    var toast = $mdToast.simple()
                        .textContent('Marked as read')
                        .action('UNDO')
                        .highlightAction(true)
                        .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                        .position(pinTo);
                    $mdToast.show(toast).then(function(response) {
                        if ( response == 'ok' ) {
                            alert('You clicked the \'UNDO\' action.');
                        }
                    });
                };

                var uri = $location.search().url;
                window.URL = window.URL || window.webkitURL;
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                $scope.ownerName = 'david';
                $scope.uri = uri;
                $scope.isContentLoaded = false;
                $scope.path = '';

                $scope.uploadAudio = function () {
                    if(!blob)
                        return $scope.showSimpleToast('no file for upload');
                    Read2meService.uploadAudio($scope.uri, blob, $scope.ownerName)
                        .then(function (data) {
                            $scope.showSimpleToast('File uploaded successfully!');
                            console.log('uploadPhoto data', data);
                        })
                        .catch(function (error) {
                            $scope.showSimpleToast('Error uploading file');
                            console.log('uploadPhoto error ', error);
                        });
                };

                $scope.getArticleHtml = function (uri) {
                    Read2meService.getArticleHtml(uri)
                        .then(function (data) {
                            console.log('getArticleHtml data', data);
                            $scope.articleHtml = data[0].article;
                            $scope.articleTitle = data[0].title;
                            $scope.title = $sce.trustAsHtml($scope.articleTitle);
                            $scope.article = $sce.trustAsHtml($scope.articleHtml);
                            $scope.isContentLoaded = true;
                        })
                        .catch(function (error) {
                            console.log('getArticleHtml error ', error);
                        });
                };

                $scope.getArticleHtml(uri);
                var onFail = function (e) {
                    console.log('Rejected!', e);
                };

                var onSuccess = function (s) {
                    var context = new webkitAudioContext();
                    var mediaStreamSource = context.createMediaStreamSource(s);
                    recorder = new Recorder(mediaStreamSource);
                    recorder.record();

                    // audio loopback
                    // mediaStreamSource.connect(context.destination);
                };

                var recorder;
                var audio = document.querySelector('audio');

                $scope.isPlaying = false;
                $scope.isRecroding = false;
                $scope.inDeterminate = 'determinate';

                $scope.switchRecording = function(){
                    if($scope.isPlaying)
                        return $scope.showSimpleToast('please stop playback before recording');
                    if($scope.isRecroding) {
                        $scope.isRecroding = false;
                        $scope.inDeterminate = 'determinate';
                        $scope.stopRecording();
                    }
                    else {
                        $scope.isRecroding = true;
                        $scope.inDeterminate = 'indeterminate'
                        $scope.startRecording();
                    }
                };

                $scope.switchPlaying = function(){
                    if($scope.isRecording)
                        return $scope.showSimpleToast('please stop recording before playback');
                    if($scope.isPlaying) {
                        $scope.isPlaying= false;
                        $scope.pause();
                    }
                    else {
                        if(!audio.src)
                            return $scope.showSimpleToast('nothing to play');
                        $scope.isPlaying = true;
                        $scope.play();
                    }
                };

                $scope.timerRecordingCounter = 0;
                $scope.startRecording = function () {
                    if($scope.timerPlaying)
                    {
                        $interval.cancel($scope.timerPlaying);
                        $scope.timerPlaying = undefined;
                    }
                    $scope.progValue = 0;
                    if (navigator.getUserMedia) {
                        navigator.getUserMedia({audio: true}, onSuccess, onFail);
                        $scope.recordingTimer = $interval(function(){
                            $scope.timerRecordingCounter += 0.1;
                            curTime.textContent = toStringTime($scope.timerRecordingCounter);
                        },100);
                    } else {
                        console.log('navigator.getUserMedia not present');
                    }
                };
                var blob;
                $scope.stopRecording = function () {
                    recorder.stop();
                    recorder.exportWAV(function (s) {
                        blob = s;
                        audio.src = window.URL.createObjectURL(s);
                        audio.pause();
                    });
                    $interval.cancel($scope.recordingTimer);
                    $scope.recordingTimer = undefined;
                    $scope.timerRecordingCounter = 0;
                };

                var source = document.getElementById('wavSource');
                var duration = document.getElementById('duration');
                var curTime = document.getElementById('cur_time');
                var progBar = document.getElementById('prog_bar');

                $scope.ctime = 0;
                $scope.duration = 0;
                $scope.audio = audio;
                $scope.progValue = 0;


                $scope.play = function()
                {
                    audio.play();
                    curTime.textContent = toStringTime(0);
                    $scope.timerPlaying = $interval(function(){
                        $scope.progValue = audio.currentTime.toFixed(1)/audio.duration*100;
                        $scope.ctime = audio.currentTime.toFixed(1);
                        curTime.textContent = toStringTime(audio.currentTime.toFixed(0));
                        if(audio.currentTime >= audio.duration)
                        {
                            $scope.isPlaying = false;
                            audio.currentTime = 0;
                            audio.pause();
                        }
                    },100);
                };

                $scope.$watch('audio.duration', function(newval){
                    if(!isNaN(audio.duration)) {
                        duration.textContent = toStringTime(audio.duration.toFixed(0));
                        $scope.duration = audio.duration.toFixed(1);
                    }
                });
                $scope.changetime = function(t){
                    audio.currentTime = t;
                };

                $scope.pause = function() {
                    audio.pause();
                    $interval.cancel($scope.timerPlaying);
                    $scope.timerPlaying = undefined;
                }

                $scope.seekBack = function() {
                    $scope.changetime(Math.min($scope.ctime - 5, 0));
                }

                $scope.seekForward = function() {
                    $scope.changetime(Math.min(5 + Number($scope.ctime), audio.duration));
                }

                function toStringTime(d)
                {
                    d = Number(d);
                    var h = Math.floor(d / 3600);
                    var m = Math.floor(d % 3600 / 60);
                    var s = Math.floor(d % 3600 % 60);
                    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
                }
            }
        };
    });