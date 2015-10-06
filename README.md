react-components
================

Searchable repository of React-components


## Installation

In order to build this project you need to have [node](https://nodejs.org/) and [redis](http://redis.io/) installed in your machine. Once you do, clone the repository and install it, using the following commands:

```
git clone git@github.com:vaffel/react-components.git
cd react-components
npm install
npm run fetch:database
```

To run the project in development mode, use:

```
gulp watch
```

### Importing modules

This project relies on a database of npm components. Before being able to run the project for the first time, you need to fetch the components. The command to do so can also be used any time you wish to update your database.

```
npm run fetch:database
```

### Possible sources of Installation problems For mac

#### Problems during npm install

The current version of the project is not yet fully compatible with node v4.0.0. One possible work around is to use Node Version Manager ([NVM](https://github.com/creationix/nvm)), and install node v0.12.7. This can be accomplished as follows:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.28.0/install.sh | bash 
nvm install v0
nvm use v0
```

#### [Problems during hiredis Installation](https://github.com/redis/hiredis-node/issues/102)

If while doing the <code>npm install</code> you run into the following error:
```
ld: library not found for -lgcc_s.10.5
make: *** [Release/hiredis.node] Error 1
```
You probably have a problem with your version of Xcode. The easiest way to solve it, is to update your Xcode and open it.

#### Using Macports

If you use macports to install your dependencies, then the issue might be that you are not using the [default gcc compiler](http://apple.stackexchange.com/questions/129608/switch-back-to-clang-after-installing-gcc-through-macports-on-mavericks). To verify that, do:
```
gcc --version
```
If what you get is not the default clang compiler from Xcode, edit your ~/.bash_profile as follows:
```
vim ~/.bash_profile
```
And comment out the line:
```
export PATH=/opt/local/bin:/opt/local/sbin:$PATH
```
