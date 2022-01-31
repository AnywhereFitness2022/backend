const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs/index');

function clientTokenBuilder(client){
    const payload = {
        subject: client.client_id,
        name: client.client_name,
        role: client.role,
    }
    const options = {
        expiresIn: '1h'
    }
    const token = jwt.sign(payload, JWT_SECRET, options)

    return token
}

module.exports = clientTokenBuilder;