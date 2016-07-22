const connect = {
  client: 'mysql',
  connection: {
    host: process.env.host,
    user: process.env.tbn_user,
    password: process.env.tbn_password,
    database : process.env.db_name
  }
}
exports.connect = connect