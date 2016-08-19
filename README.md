#Ikeora Back-end

## Introduction
This is where the API for the Ikeora Project sits. The infographics below explains the relationship between different components of the application.

![alt Site Map](http://imgur.com/lLdpVoP.png)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
[back-end Repo git](https://github.com/releafgroup/ikeora-back-end.git)

## Prerequisites

Install [nodejs][1] and [npm][2] on your system


1. [MacOs][3]
2. [Ubuntu 16.04 LTS][4]
3. [Windows][5]

### Dependencies

1.[express][6]

- `express` is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. 

2.[path][7]

- The `path` module provides utilities for working with file and directory paths. It can be accessed using.

3.[serve-favicon][8]

- A favicon visual cue that client software, like browsers, use to identify a site.This module provides an `ETag` based on the contents of the icon, rather than file system properties.

4.[morgan][9]

- `morgan` is used for logging request details

5.[cookie-parser][10]

- High quality middleware for nodejs

6.[body-parser][11]

- `body-parser` extracts the entire body portion of an incoming request stream and exposes it on `req.body` as something easier to interface with.

7.[mongoose][12]

- `mongoose` is a *Node.js* library that provides MongoDB object mapping similar to ORM with a familiar interface within Node.js.

8.[mongodb][13]
- `mongodb` is a NoSQL database that is very scalable.

## API Architecture
The API is found in the `server` directory of `Ikeora-back-end`

```
Ikeora Backend Server
│   
└───bin
|   └───www
|
|
└───mocha_test
|    └─── basic_mocha_test.js.wsp
|    └───admin_mocha_test.js
|    └───company_mocha_test.js
|    └───messenger_mocha_test.js
|    └───project_mocha_test.js
|    └───volunteer_mocha_test.js
|
|
└───models
|    └───admin.js
|    └───company.js
|    └───message.js
|    └───project.js
|    └───user.js
|    └───volunteer_assignment.js
|
|
└───node_modules (contains all modules and is usually ignored)
| 
└───routes
|    └───admin.js
|    └───authenticate.js
|    └───companies.js
|    └───index.js
|    └───messenger.js
|    └───projects.js
|    └───user.js
|
|
└───utils
|    └───authfunc.js
|    └───passport_user.js
|
└───app.js
└───config.js
└───package.json
└───.gitignore
└───README.md (that's me)
```


## Configuration

1. Clone the application
2. Change directory to the root of the application
3. Run `npm install`
4. Install `mongodb`. If you use `homebrew` or `linuxbrew`, run `brew install mongodb`. You can follow up with this [documentation](https://docs.mongodb.com/manual/installation/)
5. Run `npm test` to run the application. If you get any error about any dependency not being installed even when `npm install` was successful, you might try installing that dependency globally using `npm install -g some_module`.
6. Create a directory on your computer where you want to store the local database. Can be anywhere

## How to run the backend

1.) In one terminal, you always need to have the following running: `mongod --dbpath path_to_directory_created_above`
2.) If you just want to run the set of unit tests, in another terminal run the following: `npm run-script mocha_test`
  - Now, in another terminal, run: `mocha test_want_to_run`
3.) If you want to actually use the BE with the FE, then you need to the following instead: `npm test`
  - You need to have this running the whole time you are using the website
  - The reason the command is different from 2 is because every time we run a test script we delete and re-create the database

## Contributing

1. Clone the from https://github.com/releafgroup/ikeora-back-end

2. Create your feature branch

        $ git checkout -b new_feature
    
3. Contribute to code

4. Commit changes made

        $ git commit -a -m 'descriptive_message_about_change'
    
5. Push to branch created

        $ git push origin new_feature
    
6. Then, create a new Pull Request

## Services

Help needed here too.

## Deployment Instructions

Orry, Lady B, Daumie?


[1]: https://nodejs.org/en/  "Node.js Official Site"
[2]: https://www.npmjs.com/ "NPM Official Site"
[3]: http://blog.teamtreehouse.com/install-node-js-npm-mac "teamtreehouse Blog"
[4]: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04 "Digital Ocean"
[5]: http://blog.teamtreehouse.com/install-node-js-npm-windows "team teamtreehouse blog"
[6]: https://expressjs.com/ "Official express site"
[7]: https://nodejs.org/api/path.html "Nodejs Path"
[8]: https://github.com/expressjs/serve-favicon "Server-favicon repo"
[9]: https://github.com/expressjs/morgan "Morgan Repo"
[10]: https://github.com/expressjs/cookie-parser "cookie-parser repo"
[11]: https://github.com/expressjs/body-parser "body-parser repo"
[12]: http://mongoosejs.com/ "mongoose site"
[13]: https://www.mongodb.com/
