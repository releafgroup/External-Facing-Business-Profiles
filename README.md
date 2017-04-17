#Ikeora Back-end

## Introduction
This is where the API for the Ikeora Project sits. 

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


### Database Creation
1. Clone the application
2. Change directory to the root of the application
3. Run `npm install`
4. Install `mongodb`. If you use `homebrew` or `linuxbrew`, run `brew install mongodb`. You can follow up with this [documentation](https://docs.mongodb.com/manual/installation/)
5. Create a directory on your computer where you want to store the local database and run `mongod --dbpath <path_to_store_data>`

### Environment Variables
1. Create a copy of `env/.env.sample` as `env/.env`
2. Change variables to appropriate values

## Running the application
Run the command

        $  npm start

## Deployment

### Configuration
1. Create a copy of `env/.env.sample` for each environment. So for example for staging environment, create `env/.env.staging`.
2. Create a copy of `deploy/servers_sample.yml` as `deploy/servers.yml` and replace values appropriately.
2. Create a copy of `deploy/pm2-sample.json` as `deploy/pm2.json` and replace values appropriately.

### Running the deploy command
Run the command show below:

        dep deploy <environment>

So to deploy the staging environment run `dep deploy staging`

## Testing
        $  npm test

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

[1]: https://nodejs.org/en/  "Node.js Official Site"
[2]: https://www.npmjs.com/ "NPM Official Site"
[3]: http://blog.teamtreehouse.com/install-node-js-npm-mac "teamtreehouse Blog"
[4]: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-16-04 "Digital Ocean"
[5]: http://blog.teamtreehouse.com/install-node-js-npm-windows "team teamtreehouse blog"

## API Documentation
[Ikeora V3 API Documentation](https://docs.google.com/document/d/14pLvADTtZq051Ox9g0z6qh1JI7I9xKoAfrFBhMa4Gvs/edit#)