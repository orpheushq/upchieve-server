UPchieve web server
===================

> Web server providing endpoints for the UPchieve web client

[![CircleCI](https://circleci.com/gh/UPchieve/server.svg?style=svg)](https://circleci.com/gh/UPchieve/server)

**Table of Contents**

- [Local Development](#local-development)
    - [Dependencies](#dependencies)
    - [Setup](#setup)
    - [Test Users](#test-users)
- [Structure](#structure)
    - [config.js](#configjs)
    - [models](#models)
    - [router](#router)
    - [controllers](#controllers)
    - [services](#services)
- [Endpoints](#endpoints)
    - [POST /auth/login](#post-authlogin)
    - [GET /auth/logout](#get-authlogout)
    - [POST /auth/register/checkcred](#post-authregistercheckcred)
    - [POST /auth/register](#post-authregister)
    - [POST /auth/reset/send](#post-authresetsend)
    - [POST /auth/reset/confirm](#post-authresetconfirm)
    - [GET /auth/org-manifest](#get-authorg-manifest)
    - [POST /api/session/new](#post-apisessionnew)
    - [POST /api/session/check](#post-apisessioncheck)
    - [POST /api/training/questions](#post-apitrainingquestions)
    - [POST /api/training/score](#post-apitrainingscore)
    - [POST /api/calendar/save](#post-apicalendarsave)
    - [POST /api/feedback](#post-apifeedback)
    - [GET /api/user](#get-apiuser)
    - [PUT /api/user](#put-apiuser)
    - [GET /api/user/:id](#get-apiuserid)
    - [POST /api/volunteers](#post-apivolunteers)
    - [POST /api/volunteers/availability](#post-apivolunteersavailibility)
    - [POST /api/verify/send](#post-apiverifysend)
    - [POST /api/verify/confirm](#post-apiverifyconfirm)
    - [POST /moderate/message](#post-moderatemessage)
    - [POST /eligibility/check](#post-eligibilitycheck)
    - [GET /eligibility/school/search](#get-eligibilityschoolsearch)
    - [POST /eligibility/school/approvalnotify](#post-eligibilityschoolapprovalnotify)
    - [GET /eligibility/school/studentusers/:schoolUpchieveId](#get-eligibilityschoolstudentusersschoolupchieveid)

Local Development
-----------------
### Docker Use
Docker provides an alternative for local development. A Dockerfile and specific run script exist. Here's how to leverage them. With Docker installed, checkout this repository and navigate into its root directory.

1. Run `docker build -t local_upchieve_server/local_upchieve_server:0.1 . --rm` to create the image.
2. Run `docker run -p 127.0.0.1:3000:3000/tcp -p 127.0.0.1:3001:3001/tcp local_upchieve_server/local_upchieve_server:0.1 bash /bin/docker_run.sh` to launch the server
3. After any change: In the Dockerfile, change the line `ARG FOO=BAR` to something like `ARG FOO=BAR1`, changing "BAR" to anything different from the last run. Then, repeat steps 1 and 2, which should run much quicker.


### Dependencies

The recommended tool for runtime version managment is [`asdf`][asdf]. To use `asdf` on Windows, first install the appropriate Linux shell distribution using [`WSL`][wsl] (Windows Subsystem for Linux).

Install the following asdf plugins:

1. Node.js (see version listed in `.tool-versions`)
2. MongoDB (see version listed in `.tool-versions`)

- [`asdf-nodejs`][asdf-nodejs]

```shell-script
asdf plugin-add nodejs https://github.com/asdf-vm/asdf-nodejs.git
bash ~/.asdf/plugins/nodejs/bin/import-release-team-keyring
asdf install nodejs [VERSION]
```

- [`asdf-mongodb`][asdf-mongodb]

```shell-script
asdf plugin-add mongodb https://github.com/UPchieve/asdf-mongodb
asdf install mongodb [VERSION]
```

[wsl]: https://docs.microsoft.com/en-us/windows/wsl/install-win10
[asdf]: https://github.com/asdf-vm/asdf
[asdf-nodejs]: https://github.com/asdf-vm/asdf-nodejs
[asdf-mongodb]: https://github.com/UPchieve/asdf-mongodb

### Setup

1. Start a local MongoDB server by running `mongod`. In a separate terminal, you can try connecting to the database by running `mongo` (`mongod` to start the database vs. `mongo` to connect via command line!). Run `quit()` to exit the shell. You can also interface with the database using a free MongoDB GUI such as [MongoDB Compass Community](https://docs.mongodb.com/manual/administration/install-community/)
2. Run `bin/setup` to set up the database with test users and install dependencies.
   Run with `--verbose` to debug if needed.
3. Run `node init` to add "questions" collection to database
4. If you want to test Twilio voice calling functionality, set the `host` property to `[your public IP address]:3000` (minus the brackets), and configure your router/firewall to allow connections to port 3000 from the Internet. Twilio will need to connect to your system to obtain TwiML instructions.
5. Run `npm run dev` to start the dev server on `http://localhost:3000`. If you get a [`bcrypt`][bcrypt] compilement error, run `npm rebuild`.
6. See [the web client repo](https://github.com/UPchieve/web) for client
   installation

[bcrypt]: https://www.npmjs.com/package/bcrypt

## Stop Server
The server seems to keep running in the background, blocking port 3000. To end the service,
``` bash
lsof -i 3000
kill -9 <PID> #where <PID> is the process ID from the command above
```

## Run SSL Server
Edit main.js and set and change the line (3000 to 443)
``` js
app.set('port', process.env.PORT || 3000);
```

### Test Users

The database is populated with the following users for local development:

| email                     | password      |
|:--------------------------|:--------------|
| `student1@upchieve.org`   | `Password123` |
| `volunteer1@upchieve.org` | `Password123` |
| `volunteer2@upchieve.org` | `Password123` |
| `volunteer3@upchieve.org` | `Password123` |

By default, none of the test users have an `approvedHighschool` set. The volunteers are all admins by default, and `volunteer1@upchieve.org` and `volunteer2@upchieve.org` have also passed all of their certifications. `volunteer3@upchieve.org` has not passed any quizzes.

Structure
---------

The root folder of the repository provides the bootstrap file `main.js` and a
package definitions file.

### config.js

`config.js` contains a map of configuration keys for running the server. All
keys and sensitive information should be placed in this file.

### models

Model definitions that map to database models, along with related methods to act
on those models, such as parsing, validation, and data transformations.

### router

Directory structure mimics the endpoint structure exposed by the server. Each
file provides one or more endpoint routes, responsible for request
acceptance/rejection and error handling.

### controllers

Routes use controllers to perform the business logic of the server, providing
separation of concerns: the controllers have no need to be aware of how the
endpoints work. Instead, a controller provides ways to allow the routes to
trigger something (a user update, e.g.)

### services

A service is a step higher than a controller. Services provide abstract
functions to one or many controllers, often to interface with third party
services.

Endpoints
---------

### POST /auth/login

Expects the following request body:

```json
{
  "email": "String",
  "password": "String"
}
```

Authenticates the user with a session if credentials are correct.

### GET /auth/logout

Removes the user's current session.

### POST /auth/register/checkcred

Check whether the credential user entered is valid. (first step of registeration)
The server will check is there any duplications for email and validate the password.

```json
{
  "email": "String",
  "password": "String"
}
```

Possible errors:

- Email/password not provided
- Password does not meet requirements
- Email is not valid
- Email already exists

### POST /auth/register

Create a new account based on the information posted.

```json
{
  "email": "String",
  "password": "String",
  "code": "String",
  "highSchool": "String",
  "firstName": "String",
  "lastName": "String"
}
```

Possible errors:

- Email/password not provided
- Password does not meet requirements
- Email is not valid
- Email already exists
- Could not hash password
- Could not send verification email (for volunteers)

### POST /auth/reset/send

```json
{
  "email": "String"
}
```

### POST /auth/reset/confirm

```json
{
  "email": "String",
  "password": "String",
  "newpassword": "String",
  "token": "String"
}
```

### GET /auth/partner/volunteer

Expects the following query string:

```
?partnerId=PARTNER_ID
```

where `PARTNER_ID` is the key name of the volunteer partner organization defined in `config.js` under `volunteerPartnerManifests`.

### POST /api/session/new

```json
{
  "sessionType": "String",
  "sessionSubTopic": "String"
}
```

### POST /api/session/check

```json
{
  "sessionId": "String"
}
```

### POST /api/training/questions

```json
{
  "category": "String"
}
```

### POST /api/training/score

```json
{
  "idAnswerMap": "String",
  "category": "String"
}
```

### POST /api/calendar/save

```json
{
  "availability": {
    "Sunday": {
      "12a": "Boolean",
      "1a": "Boolean",
      ...
    },
    "Monday": {
      ...
    },
    ...
  },
  "tz": "String"
}
```

### POST /api/feedback

```json
{
  "sessionId": "String",
  "topic": "String",
  "subTopic": "String",
  "responseData": "String"
}
```

### GET /api/user

Returns a sanitized public user record for the currently authenticated user

### PUT /api/user

Accepts a request body with fields mapping to profile fields to update for the
currently authenticated user:

```json
{
  "picture": "String"
}
```

### GET /api/user/:id

Returns a sanitized public user record for a user with the given id. May perform
checks on the authorization level of the current user to strip out priveliged
information.

### POST /api/volunteers

Returns an object with all the users who are volunteers. All the keys are user ids.

### POST /api/volunteers/availability

Returns a map with the availability of all the volunteers. All the keys are user ids.

### POST /api/verify/send

Sends an email to verify the current user with unique hash. The email provided
will overwrite the user record's email, in the event that the two do not match.

```json
{
  "email": "String"
}
```

### POST /api/verify/confirm

Accepts a token used to verify the current user.

```json
{
  "token": "String"
}
```

### POST /moderate/message

Expects the following request body:

```json
{
  "content": "string with the content of a message"
}
```

Returns a boolean indicating whether or not the message is
clean.

The response body looks like this if no error occurred:

```javascript
{
  "isClean": true // or false
}
```

### POST /eligibility/check

Expects the following request body:

```json
{
  "schoolUpchieveId": "String",
  "zipCode": "String"
}
```

### GET /eligibility/school/search

Expects the following query string:

```
?q=SEARCH_STRING
```

where `SEARCH_STRING` is the string to be searched.

Searches the database of schools for a name or `upchieveId` matching the search string. The search string may match only part of the school's name, but if searching for an `upchieveId` the string must match exactly.

If there are no errors, the response body contains the list of schools matching the search string in the format:

```javascript
{
  "results": [
    {
      "upchieveId": "UPchieve ID",
      "name": "high school name",
      "districtName": "district name",
      "city": "city name",
      "state": "state postal code"
    },
    // ...
  ]
}
```

### POST /eligibility/school/approvalnotify

Expects the following request body:

```json
{
  "schoolUpchieveId": "String",
  "email": "String"
}
```

Adds an email address to the list of email addresses to notify when the school is approved by UPchieve. 

If no error occurred, the response body looks like:

```json
{
  "schoolId": "School's UPchieve ID"
}
```

Checks if a student is eligible for UPchieve based on their school and zip code. If no error occurs, the response looks like:

```javascript
{
  "isEligible": true // or false
}
```

### GET /eligibility/school/studentusers/:schoolUpchieveId

Lists all student users registered with a school. Restricted to admins only. If no error occurs, the response looks like:

```javascript
{
  "upchieveId": "8-digit identifier",
  "studentUsers": [
    {
      "email": "student@example.com",
      "firstname": "Firstname",
      "lastname": "Lastname",
      "userId": "user's ObjectID in MongoDB"
    },
    // ...
  ]
}
```
