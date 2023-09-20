# Express Application
This Express application provides the back end for the movie lookup web application. 

# Purpose
This application provides the front end of the movie lookup application a back end API. This application provides API endpoints that when called perform various tasks, such as querying the (local) movie database, creating users and generating/validating JWT. 

# Querying local database
This application uses knex to query the local database.

# Creating users
User information is stored inside a MySQL (local) server. Users are created after it has been determined the email the user has provded does not already exist, and the passwords are stored in the database after being salted and hashed. 

# Generating and Validating JWT
JWT tokens are used in the front end of this application and are generated and validated on the back end. This application uses the 'jsonwebtoken' library to generate and validate JWT.