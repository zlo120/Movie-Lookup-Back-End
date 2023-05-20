var express = require('express');
var router = express.Router();

/* GET person data */
router.get('/:id', function (req, res, next) {

    req.db
        .from("principals")
        .select("*")
        .where("nconst", "=", req.params.id)
        .then(rows => {
            res.json({ Error: false, Message: "Success", Data: rows });
        })
        .catch((err) => {
            console.log(err);
            res.json({ Error: true, Message: "Error in MySQL query" });
        });

});

module.exports = router;