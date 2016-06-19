var fs = require('fs');
var router = require('express').Router();
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var driveUtils = require('../utils/drive');
var mongoUtils = require('../utils/mongo');
var config = require('../../config.json');
var COLLECTIONS = config.COLLECTIONS;
var HttpStatus = require('http-status-codes');
var ms = require('mediaserver');

// var readability = require('../utils/readability');
var readability = require('node-readability');


/**
 * gets article Html
 * Expected Params:
 * @param urk {string} : album to by deleted
 */
router.get('/articleHtml', function (req, res) {

    readability(req.query.uri, function (err, article, meta) {
        if (err)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);

        res.send([{
                title: article.title,
                article: article.content
            }]
        );
        article.close();
    });
});

/**
 * gets album data from the db
 * Expected Params:
 * @param uri {string} : album to by deleted
 */
router.delete('/readability', function (req, res) {

    readability(req.query.uri, function (err, article, meta) {

        if (err)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);


        res.send(article.content);

        article.close();
    });
});

//the router for photos module
/**
 * post for upload photos to sever using multipartyMiddleware
 * Expected Params:
 * @param file {File} : photo file to be upload
 * @param uri {string} :
 */
router.post('/uploadAudio', multipartyMiddleware, function (req, res) {

    if (req.body.uri === undefined || req.body.uri === null)
        return res.status(HttpStatus.BAD_REQUEST).send("Error: missing uri");

    if (req.files.file === undefined || req.files.file === null)
        return res.status(HttpStatus.BAD_REQUEST).send("Error: missing file");
    var name = new Date().getTime() + '.wav';
    fs.rename(req.files.file.path, '../audioFiles/' + name, function (err) {
        if (err)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        res.send({success: true});
        checkIfAudioExist(req.body.uri, req.body.ownerName, function (err, result) {
            if (err)
                console.log(err);
            else {
                if (result.length == 0) {
                    saveAudio(req.body.uri, '../audioFiles/' + name, req.body.ownerName, function (err, result) {
                        if (err)
                            console.log(err);
                        else
                            console.log('insert to db successfully')
                    });
                }
                else {
                    deleteAudioPath(req.body.uri, req.body.ownerName, function (err, result) {
                        if (err)
                            console.log(err);
                        else {
                            saveAudio(req.body.uri, '../audioFiles/' + name, req.body.ownerName, function (err, result) {
                                if (err)
                                    console.log(err);
                                else
                                    console.log('update db successfully');
                            });
                        }
                    });
                }
            }
        })

    });

});

router.get('/getAvailableAudioAndArticle', function (req, res) {
    if (req.query.uri !== undefined) {
        readability(req.query.uri, function (err, article, meta) {
            if (err)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
            findAudioByUri(req.query.uri, function (err, result) {
                if (err)
                    console.log(err);
                else {
                    res.send([{
                            title: article.title,
                            article: article.content,
                            audios: result
                        }]
                    );
                }
                article.close();
            });

        });
    }
    else {
        return res.status(HttpStatus.BAD_REQUEST).send("uri not exist");
    }
});

router.get('/getAvailableAudio', function (req, res) {
    if (req.query.url !== undefined) {
        findAudioByUri(req.query.url, function (err, result) {
                if (err)
                    console.log(err);
                else {
                    res.send(result);
                }
        });
    }
    else {
        return res.status(HttpStatus.BAD_REQUEST).send("uri not exist");
    }
});

router.get('/getAudioFile', function (req, res) {
    ms.pipe(req, res, req.query.path);
});
/**
 * post for delete photo from drive and db
 * Expected Params:
 * @param file_id {string} : file id to by deleted
 */
router.delete('/delete', function (req, res) {

    if (req.query.file_id === undefined || req.query.file_id === null)
        return res.status(HttpStatus.BAD_REQUEST).send("Missing file id");

    driveUtils.deleteFile(req.query.file_id, function (error, result) {
        if (error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);

        deletePhoto(req.query.file_id, function (error, result) {
            if (error)
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);

            res.send({success: true});
        })
    });
});


//DB METHODS
/**
 *  save photo data to db
 * @param fileId {String} : photo drive file id
 * @param webContentLink {String} : drive direct link
 * @param album {String} : album of the photo
 * @param callback {Function} : holds err / success
 */
function savePhoto(fileId, webContentLink, album, callback) {
    mongoUtils.insert(COLLECTIONS.PHOTOS, {
            album: album,
            web_link: webContentLink,
            file_id: fileId
        }
        , callback);
}
/**
 *  get all photos of particular album
 * @param album {String} : the album
 * @param callback {Function} : callback holds err / success
 */
function getAlbum(album, callback) {
    // console.log('getAlbumImages(albumKey) ' + albumKey);
    mongoUtils.query(COLLECTIONS.PHOTOS, {
        album: album
    }, callback);
}
/**
 * delete photo data from the db
 * @param fileId {String} : the drive file id
 * @param callback {Function} : callback holds err / success
 */
function deletePhoto(fileId, callback) {
    mongoUtils.delete(COLLECTIONS.PHOTOS, {
        file_id: fileId
    }, callback);
}

function saveAudio(uri, path, ownerName, callback) {
    mongoUtils.insert(COLLECTIONS.AUDIOS, {
        uri: uri,
        owner_name: ownerName,
        path: path
    }, callback);
}

function checkIfAudioExist(uri, ownerName, callback) {
    mongoUtils.query(COLLECTIONS.AUDIOS, {
        uri: uri,
        owner_name: ownerName
    }, callback);
}

function findAudioByUri(uri, callback) {
    mongoUtils.query(COLLECTIONS.AUDIOS, {
        uri: uri
    }, callback);
}

function deleteAudioPath(uri, ownerName, callback) {
    mongoUtils.delete(COLLECTIONS.AUDIOS,
        {uri: uri, owner_name: ownerName}, callback);
}

module.exports = router;