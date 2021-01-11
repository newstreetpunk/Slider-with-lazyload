$(function(){

	var slideWrapper = $(".main-slider"),
	iframes = slideWrapper.find('.embed-player'),
	lazyImages = slideWrapper.find('.slide-image'),
	lazyCounter = 0;

	// POST commands to YouTube or Vimeo API
	function postMessageToPlayer(player, command){
		if (player == null || command == null) return;
		player.contentWindow.postMessage(JSON.stringify(command), "*");
	}

	// When the slide is changing
	function playPauseVideo(slick, control){
		var currentSlide, slideType, startTime, player, video;

		currentSlide = slick.find(".slick-current");
		slideType = currentSlide.attr("class").split(" ")[1];
		player = currentSlide.find("iframe").get(0);
		startTime = currentSlide.data("video-start");

		if (slideType === "vimeo") {
			switch (control) {
				case "play":
				if ((startTime != null && startTime > 0 ) && !currentSlide.hasClass('started')) {
					currentSlide.addClass('started');
					postMessageToPlayer(player, {
						"method": "setCurrentTime",
						"value" : startTime
					});
				}
				postMessageToPlayer(player, {
					"method": "play",
					"value" : 1
				});
				break;
				case "pause":
				postMessageToPlayer(player, {
					"method": "pause",
					"value": 1
				});
				break;
			}
		} else if (slideType === "youtube") {
			switch (control) {
				case "play":
				postMessageToPlayer(player, {
					"event": "command",
					"func": "mute"
				});
				postMessageToPlayer(player, {
					"event": "command",
					"func": "playVideo"
				});
				break;
				case "pause":
				postMessageToPlayer(player, {
					"event": "command",
					"func": "pauseVideo"
				});
				break;
			}
		} else if (slideType === "video") {
			video = currentSlide.children("video").get(0);
			if (video != null) {
				if (control === "play"){
					video.play();
				} else {
					video.pause();
				}
			}
		}
	}

	// Resize player
	function resizePlayer(iframes, ratio) {
		if (!iframes[0]) return;
		var win = $(".main-slider"),
		width = win.width(),
		playerWidth,
		height = win.height(),
		playerHeight,
		ratio = ratio || 16/9;

		iframes.each(function(){
			var current = $(this);
			if (width / ratio < height) {
				playerWidth = Math.ceil(height * ratio);
				current.width(playerWidth).height(height).css({
					left: (width - playerWidth) / 2,
					top: 0
				});
			} else {
				playerHeight = Math.ceil(width / ratio);
				current.width(width).height(playerHeight).css({
					left: 0,
					top: (height - playerHeight) / 2
				});
			}
		});
	}

	// DOM Ready
	$(function() {
		// Initialize
		slideWrapper.on("init", function(slick){
			slick = $(slick.currentTarget);
			setTimeout(function(){
				playPauseVideo(slick,"play");
			}, 1000);
			resizePlayer(iframes, 16/9);
			// if(window.innerWidth>window.innerHeight)
			// else 
					// resizePlayer(iframes, 9/16);
			// resizePlayer(iframes, window.innerWidth/window.innerHeight);
		});
		slideWrapper.on("beforeChange", function(event, slick) {
			slick = $(slick.$slider);
			playPauseVideo(slick,"pause");
		});
		slideWrapper.on("afterChange", function(event, slick) {
			slick = $(slick.$slider);
			playPauseVideo(slick,"play");
		});
		slideWrapper.on("lazyLoaded", function(event, slick, image, imageSource) {
			console.log([event, slick, image, imageSource]);
			image.closest('.slide-image').css('background-image', 'url("' + imageSource + '")'); 
			image.hide();
			image.closest('.slide-image').addClass('show');
			lazyCounter++;
			if (lazyCounter === lazyImages.length){
				lazyImages.addClass('show');
				// slideWrapper.slick("slickPlay");
			}
		});


		var arrow = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225 c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></svg>';

		//start the slider
		slideWrapper.slick({
			rows: 0,
			// fade:true,
			autoplaySpeed: 4000,
			//lazyLoad: "progressive",
			lazyLoad: "ondemand",
			speed: 600,
			arrows: true,
			dots: true,
			cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
			prevArrow: '<button class="arrow prev-arrow">'+arrow+'</button>',
			nextArrow: '<button class="arrow next-arrow">'+arrow+'</button>',
		});
	});

	// Resize event
	$(window).on("resize.slickVideoPlayer", function(){  
		resizePlayer(iframes, 16/9);
		// if(window.innerWidth>window.innerHeight)
		// else 
		// resizePlayer(iframes, 9/16);
		// resizePlayer(iframes, window.innerWidth/window.innerHeight);
	});

	lazyload();

});