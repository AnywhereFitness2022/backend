const db = require('../data/db-config')

function addReservations(client_id) {
    // insert into reservations (class_id, client_id) values ('2', '3');
    return db('reservations').insert('class_id', client_id)
}

function getAllReservations(client_id){
    return db('reservations as r')
        .join('classes as c', 'r.class_id', 'c.class_id')
        .join('clients as cl', 'r.client_id', 'cl.client_id')
        .select(
            'reservations_id',
            'cl.username',
            'class_name',
            'class_type',
            'class_start_time',
            'class_duration',
            'class_intensity_level',
            'class_location'
        )
        .where('cl.client_id ', client_id)
}

module.exports = {
    addReservations,
    getAllReservations
}