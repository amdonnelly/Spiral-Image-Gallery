/*
* jQuery spiral image gallery plugin
*
* url		http://www.amdonnelly.co.uk/experiments/spiral-gallery-plugin
* author	Alan Donnelly 2012
* version	0.5
* license	MIT and GPL licenses
*/

(function ($) {
    $.fn.SpiralImages = function (args) {
        var defaults = {
            options: { rotateImages: false, useModal: false },
            images: { list: new Object(), count: 0, current: 0, openCurrent: false },
            animation: { animate: false, fps: 30, speed: 0, target: 0 },
            imageMod: { space: 8, opacity: 0.005, scale: 0.005, position: 0, move: 0.9 },
            spiral: { centerX: 0, centerY: 0, radius: 0, sides: 225, coils: 3, rotation: 0, shrinkRadius: 60 },
            borders: { normal: { color: "#596269", width: 5 }, hover: { color: "#006699", width: 10 }, selected: { color: "#000000", width: 10 } }
        };


        return this.each(function () {
            var obj = $(this);
            var body = obj.html();

            var _container = obj.parent();                  //Containing element
            var _containerChildren = 0;                     //Number of elements in original list
            var _stage;                                     //Kinetic stage (canvas element)
            var _layer;                                     //Kenetic layers

            _options = defaults["options"]
            _images = defaults["images"];
            _animation = defaults["animation"];
            _imageMod = defaults["imageMod"];
            _spiral = defaults["spiral"];
            _borders = defaults["borders"];
            _mouse = { x: 0, y: 0 };


            //_images["list"]                               //Array of image objects
            //_images["count"];                             //number of images            
            //_images["current"];                           //Selected image index
            //_images["openCurrent"]                        //Open selected image once the animation has finished

            //_animation["animate"];                        //Toggle animation on/off
            //_animation["speed"];                          //Frames per second
            //_animation["target"];                         //target _positionModifier value

            //_imageMod["space"] var _spacingModifier = 7;                       //modify the space between items
            //_imageMod["opacity"] var _opacityModifier = 0.005;                   //Opacity increment
            //_imageMod["scale"] var _scaleModifier = 0.005;                     //Scale increment
            //_imageMod["position"] var _positionModifier =0;                       
            //_imageMod["move"] var _animateModifer = 1;

            //_spiral["centerX"]
            //_spiral["centerY"]
            //_spiral["radius"]
            //_spiral["sides"]
            //_spiral["coils"]
            //_spiral["rotation"]
            //_spiral["shrinkRadius"]



            var awayStep;           // How far to step away from center for each side.
            var aroundStep;         // How far to rotate around center for each side. // 0 to 1 based.
            var aroundRadians;      // Convert aroundStep to radians.
            //_spiral["rotation"] *= 2 * Math.PI;                         // Convert rotation to radians.



            //=====================================================================================================
            //setup images
            //=====================================================================================================


            obj.hide(); //Hide the original list

            //Once all thumbnails have been loaded, setup all the images
            if ($.browser.msie) {
                $(window).load(SpiralImages_Init(obj));
            } else {
                $(window).load(function () { SpiralImages_Init(obj); });
            }

            function SpiralImages_Init(_obj) {
                Extend_Args();

                _containerChildren = _obj.find("img").length;

                Calculate_Radius();

                Setup_Spiral();

                //Set frames per second
                _animation["speed"] = 1000 / _animation["fps"];


                $(window).mousemove(function (event) {
                    _mouse["x"] = event.pageX;
                    _mouse["y"] = event.pageY;
                });

                _stage = new Kinetic.Stage({ container: _container.attr("id"), width: _container.width(), height: _container.height() });
                _layer = new Kinetic.Layer();



                //Setup images
                _obj.find("img").each(function () {
                    _images["list"][_images["count"]] = new ImageEntry({ "parent": _container, "layer": _layer, "image": $(this), "index": _images["count"], "containerChildren": _containerChildren });

                    _images["count"]++;
                });

                _stage.add(_layer);
            }


            function Calculate_Radius() {
                if (_spiral["radius"] == 0) {
                    if (_container.width() < _container.height()) {
                        _spiral["radius"] = _container.width() / 2;
                    }
                    else {
                        _spiral["radius"] = _container.height() / 2;
                    }
                }

                if (_spiral["shrinkRadius"]) {
                    _spiral["radius"] -= _spiral["shrinkRadius"];
                }
            }

            function Setup_Spiral() {
                //Set center point
                if (_spiral["centerX"] == 0) _spiral["centerX"] = _container.width() / 2;
                if (_spiral["centerY"] == 0) _spiral["centerY"] = _container.height() / 2;

                awayStep = _spiral["radius"] / _spiral["sides"];          // How far to step away from center for each side.
                aroundStep = _spiral["coils"] / _spiral["sides"];         // How far to rotate around center for each side. // 0 to 1 based.
                aroundRadians = aroundStep * 2 * Math.PI;               // Convert aroundStep to radians.
                _spiral["rotation"] *= 2 * Math.PI;                         // Convert rotation to radians.


            }


            //Update defaults with any matching arguments
            function Extend_Args() {
                var obj = jQuery.parseJSON(args);

                for (var _group in args) {
                    for (var _option in args[_group]) {

                        //Check argument exists in defaults
                        if (defaults[_group][_option] != null) {
                            //$("html").append("<br />_option:" + _group + " " + _option + " " + args[_group][_option])
                            switch ($.type(defaults[_group][_option])) {
                                case "string":
                                    defaults[_group][_option] = args[_group][_option];
                                    break;
                                case "boolean":

                                    defaults[_group][_option] = (String(args[_group][_option]).toLowerCase() == "true") ? true : false;
                                    break;
                                case "number":
                                    defaults[_group][_option] = parseFloat(args[_group][_option]);
                                    break;
                            }
                        }
                    }

                }
            }

            //=====================================================================================================
            //=====================================================================================================
            function ImageEntry(ImageEntryArgs) {
                this._x = 0;
                this._y = 0;
                this._z = 0;
                this._width = 0;
                this._height = 0;
                this._scale = 1;
                this._position = 0;
                this._index;
                this._opacity = 0;
                this._rotation = 0;

                this._image;            //Loaded image
                this._element;          //Kinetic object
                this._top = false;

                this.spiral_content;    //Identifier of content for pop-up
                this.spiral_media;      //URL of main image for pop-up             
                this.media              //Actual media image/video 

                this.start = { "width": 0, "height": 0, "z": 0 }; //Initial image values


                this.SetImagePosition = function () {
                    this._position = (this._index * _imageMod["space"]) - _imageMod["position"];

                    if (this._position == 0) {
                        this._top = true;
                    }
                    else {
                        this._top = false;
                    }

                    return false;
                }
                this.SetImageCoords = function () {
                    var away = _spiral["radius"] - (this._position * awayStep);              // How far away from center
                    var around = this._position * aroundRadians + _spiral["rotation"];     // How far around the center.
                    this._x = _spiral["centerX"] + Math.cos(around) * away;                // Convert 'around' and 'away' to X and Y.
                    this._y = _spiral["centerY"] + Math.sin(around) * away;

                    this._element.setX(this._x);
                    this._element.setY(this._y);

                    return false;
                }
                this.SetImageScale = function () {//Set scale  depending on its point on the spiral
                    this._scale = (this._position > 0) ? 1 - GetDecimalSum(_imageMod["scale"], this._position) : 1;
                    if (this._scale < 0) this._scale = 0;

                    this._element.setScale(this._scale);

                    return false;
                }
                this.SetImageOpacity = function () {
                    var _decimalSum = GetDecimalSum(_imageMod["opacity"], this._position);

                    if (_decimalSum < 0) _decimalSum = 0;
                    if (_decimalSum > 1) _decimalSum = 1;

                    this._opacity = (this._position > 0) ? 1 - _decimalSum : 1;



                    if (this._opacity < 0) this._opacity = 0;


                    //If position < 0 ( above selected image), add opacity to image holder
                    if (this._position < 0) {
                        this._opacity = 1 - (-1 * this._position) / 10;
                        if (this._opacity > 1) {
                            this._opacity = 1
                        }
                        else if (this._opacity < 0) {
                            this._opacity = 0;
                        }

                    }


                    this._element.setOpacity(this._opacity);

                    if (this._opacity <= 0) {
                        this._element.hide();
                    }
                    else {
                        this._element.show();
                    }

                    return false;
                }
                this.SetImageRotation = function () {
                    if (_options["rotateImages"]) {
                        this._rotation = this._position * aroundRadians + _spiral["rotation"];
                        this._element.setRotation(this._rotation);
                    }
                }

                this.ResetImageOpacity = function () {
                    this._opacity = 1;

                    return false;
                }

                this.SetStroke = function (_type) {
                    if (!_type) {
                        _type = "normal";
                    }

                    if (_type == "hover" && this._position == 0) return false;
                    if (_type == "normal" && this._position == 0) _type = "selected";

                    if (_borders[_type]) {
                        this._element.setStroke(_borders[_type]["color"]);
                        this._element.setStrokeWidth(_borders[_type]["width"]);
                    }
                }
                this.SetZIndex = function () {
                    if (this._position == 0) {
                        this._element.moveToTop();
                    }
                    else if (this._position < 0) {
                        this._element.setZIndex(this._z);
                    }
                    else {
                        this._element.setZIndex(this._z);
                    }
                }

                this.RefreshImage = function () {
                    this.SetImagePosition();
                    this.SetImageCoords();
                    this.SetImageScale();
                    this.SetImageOpacity();
                    this.SetImageRotation();
                    this.SetStroke();
                    this.SetZIndex();
                    return false;
                }

                this.MouseOverDo = function () {
                    this._element.setScale(1);
                    this._element.setOpacity(1);
                    this._element.moveToTop();
                    this._element.setRotation(0);
                    this.SetStroke("hover");

                    document.body.style.cursor = "pointer";

                    _stage.draw();
                }
                this.MouseOutDo = function () {
                    this._element.setScale(this._scale);
                    this._element.setOpacity(this._opacity);
                    //this._element.setZIndex(this._z);
                    this.SetZIndex();
                    this.SetImageRotation();
                    this.SetStroke();

                    document.body.style.cursor = "default";

                    _stage.draw();
                }
                this.MouseClickDo = function () {

                }


                this.Init = function () {
                    this._width = this._image.width;
                    this._height = this._image.height;
                    this._position = 0;
                    this._index = ImageEntryArgs["index"];
                    this._z = -this._index - 2;

                    this.SetImagePosition();



                    this._element = new Kinetic.Image({ id: this._index, image: this._image, x: this._x, y: this._y, width: this._width, height: this._height });

                    this._element.setOffset(this._image.width / 2, this._image.height / 2);

                    this.SetImageCoords();
                    this.SetImageScale();
                    this.SetImageOpacity();
                    this.SetStroke();


                    this._element.on("mouseover", function () {
                        var tmp = this["attrs"]["id"];
                        ImageEntryMouseOver(tmp);

                    });
                    this._element.on("mouseout", function () {
                        var tmp = this["attrs"]["id"];
                        ImageEntryMouseOut(tmp);
                    });
                    this._element.on("click", function () {
                        var tmp = this["attrs"]["id"];
                        ImageEntryClick(tmp);
                    });

                    ImageEntryArgs["layer"].add(this._element);

                    this.SetZIndex();
                    this.SetImageRotation();

                }

                this.spiral_content = ImageEntryArgs["image"].attr("spiral-content");
                this.spiral_media = ImageEntryArgs["image"].attr("data-spiral-media");

                this._image = new Image();
                this._image.src = ImageEntryArgs["image"].attr("src");
                this._image.onload = this.Init();



                return this;
            }

            function ImageEntryMouseOver(_index) { _images["list"][_index].MouseOverDo() }
            function ImageEntryMouseOut(_index) { _images["list"][_index].MouseOutDo(); }
            function ImageEntryClick(_index) { MoveToAndOpen(_index); _images["list"][_index].MouseClickDo(); }


            //=====================================================================================================
            //Public methods
            //=====================================================================================================

            $.fn.SpiralImages.MoveBy = function (_val) { MoveBy(_val); };
            $.fn.SpiralImages.MoveNext = function () { MoveNext(); }
            $.fn.SpiralImages.MovePrev = function () { MovePrev(); }
            $.fn.SpiralImages.StopAnim = function () { StopAnimation(); }
            $.fn.SpiralImages.MoveFirst = function () { MoveFirst(); }
            $.fn.SpiralImages.MoveLast = function () { MoveLast(); }
            $.fn.SpiralImages.MoveTo = function (_imageID) { MoveTo(_imageID); }
            $.fn.SpiralImages.MoveToAndOpen = function (_imageID) { MoveToAndOpen(_imageID); }

            //=====================================================================================================
            //Private methods
            //=====================================================================================================

            function MoveBy(_val) {
                _imageMod["position"] += _val;

                RefreshImages();
            }

            function MovePrev() {
                _images["current"] = (_images["current"] >= 1) ? _images["current"] - 1 : 0;

                StartMove();
            }

            function MoveNext() {
                _images["current"] = (_images["current"] < _images["count"] - 1) ? _images["current"] + 1 : _images["count"] - 1;

                StartMove();
            }

            function MoveFirst() {
                _images["current"] = 0;
                StartMove();
            }

            function MoveLast() {
                _images["current"] = _images["count"] - 1;
                StartMove();
            }

            function MoveTo(_index) {

                _images["current"] = _index;
                StartMove();
            }
            function MoveToAndOpen(_imageID) {
                _images["openCurrent"] = true;
                _images["current"] = _imageID;


                StartMove();
            }

            //While rotating, find the image closest to the zero/selected position and make it the anim target
            function StopAnimation() {
                if (_animation["animate"]) {
                    var _distance = 10000; //distance from 0 position, find which image is closest
                    var _newImage;



                    if (_animation["target"] > _imageMod["position"]) { //rotating counter-clockwise
                        for (var _y = 0; _y < _images["count"]; _y++) {
                            var _tmpImage = _images["list"][_y];

                            if (_tmpImage._position > 0 && _tmpImage._position < _distance) {
                                _distance = _tmpImage._position;
                                _newImage = _tmpImage;
                            }
                        }
                    }
                    else {
                        _distance *= -1;

                        for (var _y = 0; _y < _images["count"]; _y++) {
                            var _tmpImage = _images["list"][_y];

                            if (_tmpImage._position < 0 && _tmpImage._position > _distance) {
                                _distance = _tmpImage._position;
                                _newImage = _tmpImage;
                            }
                        }
                    }

                    if (_newImage) {
                        _animation["target"] = _newImage._index * _imageMod["space"];
                        _images["current"] = _newImage._index;
                    }
                }
            }

            function StartMove() {
                _animation["target"] = _images["current"] * _imageMod["space"];

                _imageMod["step"] = _imageMod["move"] //Current animation step in use

                if (!_animation["animate"]) {
                    //Animate();
                    Animate();
                }
            }



            function Animate() {
                OutputSummary();
                _animation["animate"] = false;

                if (_animation["target"] != _imageMod["position"]) {
                    _animation["animate"] = true;

                    EaseIn(); //Add easing to _imageMod["step"]


                    if (_animation["target"] > _imageMod["position"]) {//rotating counter-clockwise
                        _imageMod["position"] += _imageMod["step"];

                        if (_imageMod["position"] > _animation["target"]) {
                            _imageMod["position"] = _animation["target"];
                        }
                    }
                    else {
                        _imageMod["position"] -= _imageMod["step"];

                        if (_imageMod["position"] < _animation["target"]) {
                            _imageMod["position"] = _animation["target"];
                        }
                    }

                    RefreshImages();

                    if (_animation["animate"]) {
                        var t = setTimeout(function () { Animate() }, _animation["speed"]);
                    }
                }
                else {//done!

                    if (_images["openCurrent"]) {
                        _images["openCurrent"] = false;
                        PopUp_OpenCurrent();

                    }

                    _animation["animate"] = false;
                }
            }



            function EaseIn() {
                var _min; //min distance to start applying easing
                var _distance = 0;

                if (_animation["target"] > _imageMod["position"]) {
                    _distance = _animation["target"] - _imageMod["position"];
                }
                else if (_imageMod["position"] > _animation["target"]) {
                    _distance = _imageMod["position"] - _animation["target"];
                }

                _min = _imageMod["move"] * 3;

                if (_distance <= _min) {
                    _imageMod["step"] = _imageMod["step"] * 0.75;
                }


                if (_imageMod["step"] < 0.2) {
                    _imageMod["step"] = 0.2;
                }


                return false;
            }

            function RefreshImages() {//repositions and redraw images
                for (var _y = 0; _y < _images["count"]; _y++) {
                    //_images["list"][_y].SetImagePosition();
                    _images["list"][_y].RefreshImage();

                }

                _stage.draw();
            }


            //=====================================================================================================
            //Modal pop-up
            //=====================================================================================================

            var _popUp;
            var _popUpInner;
            var _popUpContent;
            var _popUpClose;
            var _popUpNav;
            var _popUpNavPrev;
            var _popUpNavNext;
            var _popUpModal;

            function PopUp_OpenCurrent() {//open the current image/content
                var _image = _images["list"][_images["current"]];
                var _spiral_content = _image["spiral_content"];
                var _spiral_media = _image["spiral_media"];

                if (_popUpContent != null && _image.media == _popUpContent) {
                    return;
                }


                if (_spiral_content != null || _spiral_media != null) {
                    if (!_popUp) {//Add pop-up for the first time
                        _popUpInner = $(document.createElement('div')).addClass("inner");
                        _popUp = $(document.createElement('div')).addClass("spiral-pop-up").append(_popUpInner);;



                        $("body").prepend(_popUp);


                        //Add modal div if required
                        if (_options["useModal"] && _options["useModal"] == true) {
                            _popUpModal = $(document.createElement('div')).addClass("spiral-modal");
                            $("body").prepend(_popUpModal);
                            _popUpModal.hide();
                        }
                    }
                    else {//clear existing pop-up
                        _popUpInner.html("");
                    }

                    if (_options["useModal"] && _options["useModal"] == true) {
                        Modal_resize();
                        Modal_Toggle("on");
                    }

                    if (_popUpClose) _popUpClose.stop(true, false).hide();
                    if (_popUpNav) PopUp_Nav_ToggleMouseOver("off");
                    if (_popUpContent) _popUpContent.stop(true, false).hide();

                    //When opening from closed state, ensure pop-up expands from smallest size
                    if (!_popUp.is(":visible")) {
                        _popUpInner.remove();
                        _popUpInner = $(document.createElement('div')).addClass("inner");
                        _popUp.prepend(_popUpInner);
                    }

                    //Keep thepop-up in the  middle of the screen
                    $(window).unbind("resize", PopUp_Center).resize(PopUp_Center);

                    _popUp.stop(true, false);

                    PopUp_Center();

                    _popUp.fadeIn("fast", PopUp_Load(_image));
                }
                else {
                    PopUp_Close_Click();
                }
            }

            //Center the pop-up in the middle of the screen
            function PopUp_Center() {
                if (_popUp) {
                    _popUp.css({ "left": ($("html").outerWidth() / 2) - (_popUp.outerWidth() / 2), "top": ($("html").outerHeight() / 2) - (_popUp.outerHeight() / 2) });
                }

                return false;
            }


            //Start loading the image, but don't show
            function PopUp_Load(_image) {
                var _spiral_content = _image["spiral_content"];
                var _spiral_media = _image["spiral_media"];


                if (_popUpContent) _popUpContent.hide();

                if (_spiral_media != null && _spiral_media.length > 0) {
                    _popUpInner.addClass("loading");

                    if (_image.media == null) {//load image for the first time
                        _image.media = $("<img class='media'/>").attr('src', _spiral_media).load({ "image": _image }, PopUp_Load_Complete);
                        _popUpContent = _image.media;
                    }
                    else {
                        _popUpContent = _image.media;
                        PopUp_Load_Complete();
                    }
                }

                return false;
            }


            //Once the image is loaded, check the dimensions and resize the pop-up
            function PopUp_Load_Complete() {
                _popUpInner.removeClass("loading");
                var _maxWidth = parseInt(_popUpInner.css("max-width"));
                var _maxHeight = parseInt(_popUpInner.css("max-height"));


                _popUpContent.hide();
                _popUpInner.append(_popUpContent);


                //Fit image within max width/height of inner div
                var _width = _popUpContent.width();
                var _height = _popUpContent.height();
                var _aspect = _width / _height;



                if (_width > _maxWidth) {
                    _width = _maxWidth;
                    _height = _width / _aspect;
                }

                if (_height > _maxHeight) {
                    _height = _maxHeight;
                    _width = _height * _aspect;
                }

                _popUpContent.attr("width", _width + "px");
                _popUpContent.attr("height", _height + "px");


                PopUp_Resize(_width, _height);

                return false;
            }

            //Resize to the dimensions of the new image
            function PopUp_Resize(_width, _height) {
                _popUpInner.animate({ width: _width, height: _height }, { step: PopUp_Center, complete: PopUp_ShowContent });
            }

            //Show the image
            function PopUp_ShowContent() {
                _popUpContent.stop().hide().fadeIn("fast");

                PopUp_AddNav();
                PopUp_AddClose();
                _popUpClose.stop().fadeIn("fast");
            }


            //======================================= Nav buttons 
            function PopUp_AddNav() {

                if (!_popUpNav) {
                    _popUpNav = $(document.createElement('div')).addClass("control").addClass("nav").hide();
                    _popUp.append(_popUpNav);


                    _popUpNavPrev = $(document.createElement('div')).addClass("btn").addClass("prev").click(PopUp_Nav_Prev_Click);
                    _popUpNavNext = $(document.createElement('div')).addClass("btn").addClass("next").click(PopUp_Nav_Next_Click);
                    _popUpNav.append(_popUpNavPrev).append(_popUpNavNext);
                }

                PopUp_Nav_Position();

                PopUp_Nav_ToggleMouseOver("on");
            }
            function PopUp_Nav_Prev_Click() {
                var _prevImage = _images["current"] - 1;
                var _count = _images["count"] // avoid infinit loops
                var _found = false;

                PopUp_Nav_ToggleMouseOver("off");

                while (!_found && _count > -1) {
                    if (_prevImage < 0) _prevImage = _images["count"] - 1;


                    if (_images["list"][_prevImage]["spiral_media"] != null) {
                        _images["current"] = _prevImage;
                        _found = true;
                        break;
                    }

                    _prevImage--;
                    _count--;
                }

                PopUp_OpenCurrent();
                MoveTo(_images["current"]);
            }
            function PopUp_Nav_Next_Click() {
                var _nextImage = _images["current"] + 1;
                var _count = _images["count"] // avoid infinit loops
                var _found = false;

                PopUp_Nav_ToggleMouseOver("off");

                while (!_found && _count > -1) {
                    if (_nextImage >= _images["count"]) _nextImage = 0;

                    if (_images["list"][_nextImage]["spiral_media"] != null) {
                        _images["current"] = _nextImage;
                        _found = true;
                        break;
                    }

                    _nextImage++;
                    _count--;
                }

                PopUp_OpenCurrent();

                MoveTo(_images["current"]); //Select image in the spiral
            }
            function PopUp_Nav_Position() {
                if (_popUpNav) {
                    _popUpNav.css({ "top": _popUp.height() / 2 })
                }

                return false;
            }

            //Add mouseover events to show/hide nav
            function PopUp_Nav_ToggleMouseOver(_state) {
                if (_state == "on") {

                    //When the pop-up has just re-sized,check to see if mouse is already over it
                    if (PopUp_Hover()) {
                        _popUpNav.fadeIn("fast");
                    }


                    _popUp.hover(
                        function () {
                            _popUpNav.fadeIn("fast");
                        },
                        function () {
                            _popUpNav.hide();
                        });

                }
                else if (_state == "off") {
                    _popUp.unbind();
                    _popUpNav.hide();
                }

                return false;
            }

            //Check if mouse is inside the pop-up
            function PopUp_Hover() {
                var _return = false;


                if ((_mouse["x"] > _popUp.offset().left) && _mouse["x"] < (_popUp.offset().left + _popUp.outerWidth())) {
                    if ((_mouse["y"] > _popUp.offset().top) && _mouse["y"] < (_popUp.offset().top + _popUp.outerHeight())) {
                        _return = true
                    }
                }

                return _return;
            }


            //======================================= Close button
            function PopUp_AddClose() {
                if (!_popUpClose) {
                    _popUpClose = $(document.createElement('div')).addClass("control").addClass("close").click(PopUp_Close_Click);
                    _popUp.append(_popUpClose);
                }

                PopUp_Close_Position();

                return false;
            }
            function PopUp_Close_Position() {
                if (_popUpClose) {
                    _popUpClose.css({ "top": -_popUpClose.height() / 2, "left": _popUp.outerWidth() - (_popUpClose.width() / 2) })
                }

                return false;
            }
            function PopUp_Close_Click() {
                _popUp.fadeOut(PopUp_Close_Done);
                Modal_Toggle("off");
                _popUpContent = null;

                return false;
            }
            function PopUp_Close_Done() {
                _popUpClose.hide();

                $(window).unbind("resize", PopUp_Center);

                PopUp_Nav_ToggleMouseOver("off");

                return false;
            }

            //======================================= Modal background
            function Modal_resize() {
                if (_popUpModal) {
                    _popUpModal.width($(window).outerWidth());
                    _popUpModal.height($(window).outerHeight());
                }

                return false;
            }
            function Modal_Toggle(_state) {
                if (_popUpModal) {
                    if (_state == "on") {
                        _popUpModal.stop().fadeIn("fast");

                        $(window).resize(Modal_resize);
                    }
                    else if (_state == "off") {
                        _popUpModal.stop().fadeOut("fast");

                        $(window).unbind("resize", Modal_resize);
                    }
                }

                return false;
            }


            //=====================================================================================================
            //Helpers
            //=====================================================================================================
            function GetDecimalSum(_decimal, _n) {//add _decimal _n times
                var _total = 0;

                for (var _x = 0; _x <= _n; _x++) {

                    _total += _decimal;
                }



                return _total;
            }




            function OutputSummary() {

            }
        });
    };
})(jQuery);