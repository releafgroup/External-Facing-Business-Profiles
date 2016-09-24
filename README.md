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

The required packages are in the `package.json` file. 

After cloning the repo, Change directory in to the _root_  directory (*server*)
Use `npm install` to install all dependencies.



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
└───.eslintrc.yml
└───package.json
└───.gitignore
└───README.md (that's me)
```


## Configuration

### Setting up facebook login ###

* Go to the [facebook developer console](https://developers.facebook.com/apps) and login with the credentials found in `secret.js`.

* For production, make sure `App Review -> Make Releaf Ikeora public?` is set to `Yes`.

* Under `products -> Facebook Login`, Add the following urls to the list of `Valid OAuth redirect URIs`. ${url} is production host name
	* `${url}/users/auth/facebook/login`
	* `${url}/users/auth/facebook/login/callback`

##### NOTE: #####
For development purposes, there exists a second app named `Ikeora Dev` which already registers `${url}` as `http://localhost:3000`.

## Database Creation
1. Clone the application
2. Change directory to the root of the application
3. Run `npm install`
4. Install `mongodb`. If you use `homebrew` or `linuxbrew`, run `brew install mongodb`. You can follow up with this [documentation](https://docs.mongodb.com/manual/installation/)
5. Run `npm test` to run the application. If you get any error about any dependency not being installed even when `npm install` was successful, you might try installing that dependency globally using `npm install -g some_module`.
6. Create a directory on your computer where you want to store the local database. Can be anywhere

## How to run the backend

1. In one terminal, you always need to have the following running: `mongod --dbpath path_to_directory_created`
2. If you just want to run the set of unit tests, in another terminal run the following: `npm run-script mocha_test`
  - Now, in another terminal, run: `node node_modules/.bin/mocha test_want_to_run`. 
3. If you want to actually use the BE with the FE, then you need to the following instead: `npm test`
  - You need to have this running the whole time you are using the website
  - The reason the command is different from 2 is because every time we run a test script we delete and re-create the database
  - **NB - Windows users**: Instead of using `npm test`, run `SET NODE_ENV=development` and then `node bin/www`

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