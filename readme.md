#Jquery Spiral Image Plugin
A plugin for generating an animated gallery with thumbnails displayed as a spiral.

For an example visit [the demo page](http://www.amdonnelly.co.uk/experiments/spiral-gallery-plugin.aspx "Spiral Gallery Demo")

##Installation
The plugin script must be loaded after jquery and kinect.js.

```html
<script type="text/javascript" src="scripts/jquery.min.js" ></script>
<script type="text/javascript" src="scripts/kinetic.js" ></script>
<script type="text/javascript" src="scripts/jquery.spiralimages-0.5.min.js"></script>
```

##Example
A very basic example without any options. 


For each image entry in the list, src is the thumbnail displayed in the spiral, the "data-spiral-media" value is the url to the full image displayed in the pop-up.

###HTML
```html
<div id="container">
    <ul id="list">
        <li><img src="/images/200x300_thumb.jpg" data-spiral-media="/images/200x300.jpg"  /></li>
        <li><img src="/images/150x150_thumb.jpg" data-spiral-media="/images/150x150.jpg"  /></li>
        <li><img src="/images/200x200_thumb.jpg" data-spiral-media="/images/200x200.jpg"  /></li>
    </ul>
</div>
```

###Jquery
```javascript
$(function () {
   $("#list").SpiralImages();
});
```
The script replaces the contents of the containing object with a canvas element, be sure to set a width/height on the container.


##Paramaters
Optional paramaters with default values:
```javascript
$("#list").SpiralImages({  
	options: { rotateImages: false, useModal: false },
	imageMod: { space: 8, opacity: 0.005, scale: 0.005, move: 0.9 },
	spiral: { centerX: 0, centerY: 0, radius: 0, sides: 225, coils: 3, shrinkRadius: 60 },
	borders: { normal: { color: "#596269", width: 5 }, hover: { color: "#006699", width: 10 }, selected: { color: "#000000", width: 10 } }
}); 
```
###options
* __rotateImages__: rotate each thumbnail to align with the shape of the spiral
* __useModal__: enable modal pop up when viewing images

###imageMod    
Modify size/position of thumbnail images
* __space__: space between each thumbnail
* __opacity__: opacity increment 
* __scale__: scale increment
* __move__: amount to move images during animation (reduce value for slower animation)
 
###spiral 
Modify size/shape/position of the spiral
* __centerX__: horizontal offset for the center of the spiral
* __centerY__: vertical offset for the center of the spiral
* __radius__: specify the radius of the spiral, by default it's automatically determined to fit within the containing object.
* __sides__: 
* __coils__: 
* __shrinkRadius__:reduce the final spiral radius 
   
###borders 
Change the border size and color of thumbnail images
* __normal__: default border
* __hover__: mouseover border
* __selected__: currently selected thumbnail 
   
##Methods
```javascript
$("#list").SpiralImages.MoveNext();     //Animate to and highlight the next image in the list.

$("#list").SpiralImages.MovePrev();     //Animate to and highlight the previous image in the list.


$("#list").SpiralImages.StopAnim();     //Stop the current spiral animation and highlight the closest image.

$("#list").SpiralImages.MoveFirst();    //Animate to and highlight the first image in the list.

$("#list").SpiralImages.MoveLast();     //Animate to and highlight the last image in the list.

$("#list").SpiralImages.MoveTo(int _imageID);   //Animate to and highlight a specific image (pass in the list index of the required image).

$("#list").SpiralImages.MoveToAndOpen(int _imageID); //Animate to and highlight a specific image (pass in the list index of the required image). Once the image is highlighted, the full image will open in the pop-up.
```




[Alan Donnelly](http://www.amdonnelly.co.uk)