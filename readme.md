# HandsLine Workshop

09.03.2015

1 week workshop @ ECAL with 2nd year Media and Interaction Design

![image](https://raw.githubusercontent.com/kikko/ecal_handline_workshop/master/screens/default.png)

----

*« Le chemin le plus court d'un point à un autre est la ligne droite,
à condition que les deux points soient bien en face l'un de l'autre. »*

Pierre Dac

----

## Brief

```
Imagine and create an interactive application based on the body tracking technology
that stages the virtual line linking our 2 hands
```


Examples of geometrical properties of this line that you can use :

- spacial properties
	* position
	* length
	* angle

- temporal properties
	* velocity
	* acceleration

- shared properties
	* parallelism
	* spreading
	* similitude


----


## Framework

The microsized javascript framework available in this repository aims at getting you started quickly with your ideas.

It integrates :

- [kinect2-socket-client](https://github.com/kikko/kinect2-socket-client) to use **kinect 2** streams and playback files
- [paperJS](http://paperjs.org) for smooth and easy **vector graphics**
- [gsap](http://greensock.com/gsap) for advanced & fast **general purpose animations**
- [matter.js](http://brm.io/matter-js) for fast rigid-body **physics** computations
- [howler.js](https://github.com/goldfire/howler.js) for simple cross-platform **audio playback**
- [jquery](https://jquery.com) for **general purpose** js tools and dom manipulation

### Getting Started

First clone the repository using your favorite terminal application (I highly recommend the free [iTerm2](http://iterm2.com) on mac) 
```
git clone *this repo*
```

Then enter this directory with `cd *folder name*`

And launch a local webserver using the provided command file (you can also double click on the file):
```
./launch.command
```

This should start the server and open a web page with the default application.

To load a different default application you can use the url parameter `?app` for example if you want to load the Balls app :
```
http://localhost:8080?app=balls_app
```

This should load this demo (press TAB to show the debug view) :
![image](https://raw.githubusercontent.com/kikko/ecal_handline_workshop/master/screens/balls_app.png)

Look at the `js/apps` directory to see the list of available apps.

### Make your own application

To make your own, the easiest way is to navigate to the folder `js/apps` and duplicate the file `js/apps/default.js` in the same folder

You can then use the name you give to that file as a url parameter to load it.

The default app defines 5 functions that are called automatically by the framework :

- `setup()` is called once when the application is loaded
- `resize(width, height)` is called when the window is resized
- `update()` is called at ~60hz when the window has the focus
- `onUserIn(id, leftHand, rightHand)` is called when a user starts being tracked
- `onUserIn(id)` is called when a user stops being tracked

### Available features

The best way for now to get the full list of available features from the framework is to look at the examples and the source file `js/handline.vXX.js` 

You can also easily extend the functionalities with exteral libraris using the `include` util. The example `js/apps/gui.js` provides an example for loading an external lib directly from a CDN.

### Publish your app

To publish your app, you must follow the following rules :

- fork this repository
- add your `yourappname.js` file in the `js/apps` folder
- if you have to load some external files (sounds, svg..etc), put them in the `assets/yourappname` folder
- commit and push your changes
- ask for a pull request on the main fork

In order to publish your app easily, you ** shouldn't modify**  any other file than your `js/apps/yourappname.js` file (for example files like `index.html`, `css/main.css`...etc)