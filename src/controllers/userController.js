const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const { isValid, isValidEmail, checkPassword } = require('../validations/validations')
const { createConnection } = require('mysql')
const DB = createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootPassword',
    database: 'login_sql'
})

exports.register = (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body;
    for (let field in req.body) {
        if (!isValid(req.body[field])) {
            return res.send({
                message: `${field} must be in string formate and must contain some characters`
            })
        }
    }
    if (email) {
        if (!isValidEmail(email)) {
            return res.send({
                message: `invalid email`
            })
        }
    }
    if (password) {
        if (!checkPassword(password)) {
            return res.send({
                message: "password should contain at least (1 lowercase, uppercase ,numeric alphabetical character and at least one special character and also The string must be  between 8 characters to 16 characters)"
            })
        }
    }
    DB.query('SELECT email from USER_DETAILS WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.send({
                    message: 'The email is already in use'
                })
            }
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        DB.query('INSERT INTO USER_DETAILS SET ?', { name: name, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.send({
                    message: 'User registered'
                });
            }
        })
    })
}
function counter() {
    let counter = 0;
    return function incrementCounter() {
        counter++
        return counter
    }
}
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({
                message: "Please Provide an email and password"
            })
        }
        DB.query('SELECT * FROM USER_DETAILS WHERE email = ?', [email], async (err, results) => {
            console.log(results);
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                let count = counter()
                console.log(count())
                if (count() >= 5) {
                    setTimeout(counter = 0, 2000);
                    return res.status(401).send({
                        message: 'your account has been blocked for 2mins'
                    })
                }
                return res.status(401).send({
                    message: 'Email or Password is incorrect'
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ userId: id, exp: Math.floor(Date.now() / 1000) + 60 * 60 }, "my_user");

                return res.status(401).send({ message: "logined successfully", token: `${token}` });
            }
        })
    } catch (err) {
        return res.status(401).send(err.message);
    }
}