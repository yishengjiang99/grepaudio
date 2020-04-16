const express = require('express');
const bodyParser = require('body-parser');
const promoRouter = express.Router();
const Promotions = require("../models/promotions");


const errorResponse = ((err,res)=>{
    res.statusCode=500;
    res.json({
        message: err.message
    });
})

promoRouter.use(bodyParser.json());

promoRouter.route('/').all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    next();
})
.get((req,res,next) => {
    Promotions.find({}).then(promotions=>{
        res.json(promotions);
        res.end();
    }).catch(err=>{
        errorResponse(err,res);
    })
})
.post((req, res, next) => {
    const obj = req.body;
    var newPromotion = new Promotions({
        name: obj.name,
        image: obj.image,
        label: obj.label || "",
        price: obj.price,
        featured: obj.featured || false,
        description: obj.description || ""
    });
    newPromotion.save().then((saved)=>{
        res.json(saved);
        res.end();
    }).catch(err=>{
        errorResponse(err,res);
    })    
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    Promotions.deleteMany({}).then((result)=>{
        res.json(result);
    })
    .catch(err=>errorResponse(err,res));
});

promoRouter.route("/:promoId").all((req,res,next)=>{
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next();
})
.get((req,res)=>{
    Promotions.findOne({_id: req.params.promoId}).then((item)=>{
        res.json(item);
        res.end();
    })
})
.post((req,res)=>{
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/:promoID');
})
.put((req,res)=>{
    Promotions.findByIdAndUpdate(req.params.promoId,req.body).then(result=>res.json(result))
    .catch(err=>errorResponse(err,res));
})
.delete((req,res)=>{
    Promotions.deleteOne({_id: req.params.promoId}).then(result=>res.json(result))
    .catch(err=>errorResponse(err,res));
})

module.exports = promoRouter;
