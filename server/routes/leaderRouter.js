const express = require('express');
const bodyParser = require('body-parser');
const leaderRouter = express.Router();
const Leaders = require("../models/leaders");


const errorResponse = ((err, res) => {
    res.statusCode = 500;
    res.json({
        message: err.message
    });
})

leaderRouter.use(bodyParser.json());

leaderRouter.route('/').all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        next();
    })
    .get((req, res, next) => {
        Leaders.find({}).then(leaders => {
            res.json(leaders);
            res.end();
        }).catch(err => {
            errorResponse(err, res);
        })
    })
    .post((req, res, next) => {
        const obj = req.body;
        var newLeader = new Leaders({
            name: obj.name,
            image: obj.image,
            label: obj.label || "",
            featured: obj.featured || false,
            description: obj.description || ""
        });
        
        newLeader.save().then((saved) => {
            res.json(saved);
            res.end();
        }).catch(err => {
            errorResponse(err, res);
        })
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete((req, res, next) => {
        Leaders.deleteMany({}).then((result) => {
                res.json(result);
            })
            .catch(err => errorResponse(err, res));
    });


leaderRouter.route("/:leaderId").all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        next();
    })
    .get((req, res) => {
        Leaders.findOne({
                _id: req.params.leaderId
            })
            .then((item) => {
                res.json(item);
                res.end();
            })
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/:promoID');
    })
    .put((req, res) => {
        Leaders.findByIdAndUpdate(req.params.leaderId, req.body)
        .then(result => res.json(result))
        .catch(err => errorResponse(err, res));
    })
    .delete((req, res) => {
        Leaders.deleteOne({
            _id: req.params.leaderId
        })
        .then(result => res.json(result))
        .catch(err => errorResponse(err, res));
    });

module.exports = leaderRouter;