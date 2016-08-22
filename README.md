#Ikeora Back-end
---

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 
[back-end Repo git](https://github.com/releafgroup/ikeora-back-end.git)

---

## Prerequisites

Install [nodeJs][1] and [npm][2] on your system


1. [MacOs][3]
2. [Ubuntu 16.04 LTS][4]
3. [Windows][5]

### Recommended Modules

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


## Configuration

### Setting up facebook login ###

* Go to the [facebook developer console](https://developers.facebook.com/apps) and create a test app.

* Under `products->Facebook Login`, Add the following urls to the list of `Valid OAuth redirect URIs`. ${url} is the host name
	* `${url}/users/auth/facebook/login`
	* `${url}/users/auth/facebook/login/callback`

To run the `volunteer_fb_login.test.js` test, make sure you have `secret.facebook.[fbEmail|fbPassword]` point to your email and password for facebook.

## Database Creation

## How to run the test Suite

## Services 

## Deployment Instructions 




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
