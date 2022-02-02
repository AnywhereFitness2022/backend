const db = require('../data/db-config.js')

function getAllClasses() { 
  return db('classes')
    .select(
      'class_id', 
      'class_name', 
      'class_type', 
      'class_intensity_level', 
      'class_location', 
      'class_start_time', 
      'class_duration', 
      'max_class_size', 
      'total_clients' 
    )
}

function findClassById(class_id) {
  return db('classes').where('class_id', class_id)
}

function findBy(user){
  return db('clients')
    .select('client_id', 'username', 'role', 'password')
    .where('username', user)
    .first()
}

async function insertUser(user) {
  // WITH POSTGRES WE CAN PASS A "RETURNING ARRAY" AS 2ND ARGUMENT TO knex.insert/update
  // AND OBTAIN WHATEVER COLUMNS WE NEED FROM THE NEWLY CREATED/UPDATED RECORD
  const [newUserObject] = await db('clients').insert(user, ['client_id', 'username', 'password', 'role'])
  return newUserObject
}

async function getAllReservations(client_id){
  return await db('reservations as r')
      .join('classes as c', 'r.class_id', 'c.class_id')
      .join('clients as cl', 'r.client_id', 'cl.client_id')
      .select(
          'reservations_id',
          'cl.username',
          'class_name',
          'c.class_id',
          'class_type',
          'class_start_time',
          'class_duration',
          'class_intensity_level',
          'class_location'
      )
      .where('cl.client_id ', client_id)
      .orderBy('class_start_time')
}

async function addReservations(client_id, class_id) {
  //creating the reservation
  const newResv = { client_id, class_id }
  const [ newlyCreated ] = await db('reservations').insert(newResv, ['reservations_id', 'class_id'])

  //searching for class id in classes where class_id = class_id
  let reservClass = await db('classes')
      .where('class_id', newlyCreated.class_id)
      .first()

  // updating total_clients in classes where class_id = class_id to increment by 1
  await db('classes')
      .where('class_id', class_id)
      .update('total_clients', reservClass.total_clients + 1)

  //returning classes with selected columns with the updated total_clients
  return db('classes')
      .select(
          'class_id',
          'class_name',
          'class_type',
          'class_start_time',
          'class_duration',
          'total_clients'
      )
      .where('class_id', newlyCreated.class_id)
      .first()
}

async function getReservedClass(client_id, class_id){
  const allClasses = await getAllReservations(client_id)
  console.log('get all classes', allClasses);
  const oneClass = allClasses.filter(eachClass => {
    console.log('after filtering', eachClass);
    return eachClass.class_id === parseInt(class_id)

  })
  
  return oneClass[0];
  
}

async function removeReservation(client_id,class_id){
  const whatWeNeedToDelete = await getReservedClass(client_id, class_id)
  console.log('suppose to be what?', whatWeNeedToDelete);
    await db('classes')
      .where('class_id', class_id)
      .update('total_clients', whatWeNeedToDelete.total_clients -1)
      
    return db('reservations')
      .where('reservations_id', whatWeNeedToDelete.reservations_id)
      .del()
  
}

module.exports = {
  getAllClasses,
  findClassById,
  findBy,
  insertUser,
  getAllReservations,
  removeReservation,
  addReservations,
  getReservedClass
}
