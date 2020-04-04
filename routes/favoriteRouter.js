const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find()
    .populate('comments.author')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            console.log(favorite.campsites);
            req.body.forEach(campsite => {
                console.log(campsite._id);
                if(!favorite.campsites.includes(campsite._id)) {
                    favorite.campsites.push(campsite._id)
                }
            })
                favorite.save()
                    .then(response => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(response);
                    })
        } else {
            Favorite.create({user: req.user._id, campsites: req.body})
                .then(response => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
        }
    })
    .catch(err => next(err));
})
    
.put(authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
res.setHeader('Content-Type', 'application/json');
res.end('Operation not supported');
})

    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
            .then(favorite => {
                if(favorite) {
                    favorite.remove()
                        .then(response => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(response);
                        })
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                }
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        Favorite.findOne({user: req.user._id})
            .then(favorite => {
                if(favorite) {
                    if(favorite.campsites.includes(req.params.campsiteId)) {
                        res.statusCode = 200;
                        res.end('That campsite is already in the list of favorites');
                        res.setHeader('Content-Type', 'application/json');
                    } else {
                        favorite.campsites.push(req.params.campsiteId)
                        favorite.save()
                            .then(response => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(response);
                            })
                    }
                } else {
                    Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
                        .then(response => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(response);
                        })
                }
            })
            .catch(err => next(err));
    })

.put(authenticate.verifyUser,  authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end('Operation not supported');
})
    
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite) {
            if(!favorite.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 200;
                res.end('Campsite was not in the list');
                res.setHeader('Content-Type', 'application/json');
            } else {
                let index = favorite.campsites.indexOf(req.params.campsiteId)
                favorite.campsites.splice(index, 1)
                favorite.save()
                    .then(response => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(response);
                    })
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end('You have no favorites');
        }
    })
    .catch(err => next(err));
})

module.exports = favoriteRouter;
