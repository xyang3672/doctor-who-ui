"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const { deleteOne } = require("./schema/Companion");
const router = express.Router();



// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .sort('odering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        if (req.body.name && req.body.seasons) {
            Doctor.create(req.body)
            .save()
            .then(result => {
                res.status(201).send(result);
            })
        }
        else{
            throw err;
            res.status(400).send({'message': 'name and seasons required'});
        }
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .exec()
            .then(doctor => {
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findOneAndUpdate(
            {_id: req.params.id},
            req.body, 
            {new: true})
            .exec()
            .then(updateDoc => {
                res.status(200).send(updateDoc);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({_id: req.params.id})
            .exec()
            .then(delDoc => {
                res.status(200).send();
            })
            .catch(err => {
                res.status(400).send(err);
            })
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Companion.find({doctors: req.params.id})
            .exec()
            .then(companion => {
                res.status(200).send(companion);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });
    

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        let goodparent = true;
        Companion.find({doctors: req.params.id})
            .exec()
            .then(companions => {
                if (companions) {
                    for (var i=0; i < companions.length; i++) {
                        if (companions[i].alive == false) {
                            goodparent = false;
                            break;
                        }
                    }
                    res.status(200).send(goodparent);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        const newComp = req.body;
        if (!newComp.name || !newComp.character || !newComp.doctors || !newComp.seasons || !newComp.alive){
            res.status(500).send({
                message: "You need a name, a character, doctors, seasons, live status, image, and ordering."
            });
            return;
        } 
        Companion.create(newComp)
            .save()
            .then(newComp => {
                res.status(201).send(newComp);
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
            .then(data => {
                const listofComp = data.filter(companion => companion.doctors.length > 1)
                res.status(200).send(listofComp);
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
            .exec()
            .then(companion => {
                res.status(200).send(companion)
            })
            .catch(err => {
                res.status(404).send(err)
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            {_id: req.params.id},
            req.body,
            {new: true})
                .exec()
                .then(updateComp => {
                    res.status(200).send(updateComp);
                })
                .catch(err => {
                    res.status(404).send(err);
                })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({_id: req.params.id})
            .exec()
            .then(result => {
                res.status(200).send()
            })
            .catch(err => {
                res.status(400).send(err)
            })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id)
            .exec()
            .then(companion => {
                const doc_id = companion.doctors;
                Doctor.find({_id: {$in:doc_id}})
                    .exec()
                    .then(result => {
                    res.status(200).send(result);
                })
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
            .exec()
            .then(companion => {
                const seasons = companion.seasons;
                Companion.find({_id: {$nin: req.params.id}, seasons: {$in: seasons}})
                    .exec()
                    .then(result => {
                        res.status(200).send(result);
                    })
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;