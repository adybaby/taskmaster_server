This is the server back-end to the taskmaster client. See the readme for taskmaster for more info.

It expects two environment variables to be declared:

process.env.PORT (if none, defaults to 3000)
process.env.MONGO_ATLAS_PWD (to access the mongodb taskmaster db)
