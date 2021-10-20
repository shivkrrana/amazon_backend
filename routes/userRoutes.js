//include library

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const User = require("./../models/User");
const token_key = process.env.TOKEN_KEY

const verifyToken = require("./../middleware/verify_token")

const storage = require("./storage");


// middleware setup
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//default route
//Access:public
//url: http://localhost:500/api/users/
router.get(
    "/",
    (req, res) => {
        return res.status(200).json({
            "status": true,
            "message": "User default Router"
        });

    }
);



// user Register Route
//access: public
//url: http://localhost:500/api/users/register
router.post(
    "/register", [
        // chexk empty fields
        check("username").not().isEmpty().trim().escape(),
        check("password").not().isEmpty().trim().escape(),

        //check email
        check("email").isEmail().normalizeEmail()

    ],
    (req, res) => {
        const errors = validationResult(req);

        // check errors is not empty
        if (!errors.isEmpty()) {
            return res.status(400).json({
                "status": false,
                "errors": errors.array(),
                "message": "form validation error..."
            });
        }



        User.findOne({ email: req.body.email }).then(user => {
            // check email exists or not
            if (user) {
                return res.status(200).json({
                    "status": false,
                    "message": "User email already exists"
                });
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(req.body.password, salt);

                const newUser = new User({
                    email: req.body.email,
                    username: req.body.username,
                    password: hashedPassword
                });

                newUser.save().then(result => {
                    return res.status(200).json({
                        "status": true,
                        "user": result
                    })
                }).catch(error => {
                    return res.status(502).json({
                        "status": false,
                        "error": error
                    })
                });
            }
        }).catch(error => {
            return res.status(502).json({
                "status": false,
                "error": error
            });


        });
    }
);

// user uploadProfilePic Route
//access: public
//url: http://localhost:500/api/users/uploadProfilePic
//method : post

router.post(
    "/uploadProfilePic",
    (req, res) => {
        let upload = storage.getProfilePicUpload();

        upload(req, res, (error) => {
            console.log(req.file);

            return res.status(502).json({
                "status": true,
                "error": error,
                "message": "File upload Success"
            });
        });
    }
);


// user Login Route
//access: public
//url: http://localhost:500/api/users/Login
//method : post

router.post(
    "/login", [
        // chexk empty fields

        check("password").not().isEmpty().trim().escape(),

        //check email
        check("email").isEmail().normalizeEmail()

    ],
    (req, res) => {
        const errors = validationResult(req);

        // check errors is not empty
        if (!errors.isEmpty()) {
            return res.status(400).json({
                "status": false,
                "errors": errors.array(),
                "message": "form validation error..."
            });
        }

        User.findOne({ email: req.body.email })
            .then((user) => {

                if (!user) {
                    return res.status(404).json({
                        "status": false,
                        "message": "User don't exists"
                    });
                } else {
                    let isPasswordMatch = bcrypt.compareSync(req.body.password, user.password)



                    if (!isPasswordMatch) {
                        return res.status(401).json({
                            "status": false,
                            "message": "Password don't match... "
                        });
                    }

                    // json web token

                    let token = jwt.sign({
                            id: user._id,
                            email: user.email

                        },
                        token_key, {
                            expiresIn: 3600
                        }
                    );
                    // if login sucess
                    return res.status(200).json({
                        "status": true,
                        "message": "User login success",
                        "token": token,
                        "user": user
                    });
                }
            }).catch((error) => {
                return res.status(502).json({
                    "status": false,
                    "message": "Database error..."
                });
            });
    }
);

router.post("/testJWT", verifyToken, (req, res) => {
    return res.status(200).json({
        "status": true,
        "message": "JSON Web Token Working"
    });
})


module.exports = router;