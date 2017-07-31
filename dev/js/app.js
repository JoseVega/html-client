var liveChat = {
	widgetsKeys: ['contacts_list', 'chat_box', 'floating_chat'],
	filesNumCB: [],
	settings: {},
	pages: [],
	scrollsHeightBefore: [],
	numOfOpenedBoxes: 0,
	maxLeft: 100,
	searchMax: 0,
	searchNum: 1,
	filesNum: 0,
	page: 0,
	scrollHeightBefore: 0,
	lastSender: 0,
	lastTime: 0,
	lastSenderBox: [],
	lastTimeBox: [],
	now: null,
	strDateTime: null,
	yearNow: null,
	monthNow: null,
	dateNow: null,
	hoursNow: null,
	minutesNow: null,
	init: function (settings) {
		var defaultSettings = {
			socketServerUrl: '',
			siteId: '',
			clientUrl: '',
			backendUrl: '',
			current_user_id: 0,
			current_user_avatar: '',
			current_user_display_name: '',
			current_user_username: '',
			floatingChatBoxWidth: 245,
			texts: {
				fileBeingUploaded: 'El archivo se está subiendo...',
				contactsMobileDropdownTitle: 'Contactos',
				noContactsFound: 'No se encontraron usuarios',
				chattingWith: 'Chat con {{display_name}}',
				writeMessageHere: "Escribe aqui el mensaje",
				searchContacts: 'Buscar contactos',
				searchMessagesInConversation: "Buscar en conversacion",
				userIsWriting: "{{display_name}} está escribiendo...",
				tooManyFloatingBoxesOpened: 'Tienes muchas ventanas de chats abiertas, por favor cierra alguna para poder abrir otras.',
				hoursAgo: 'Hace {{unit}} horas',
				hourAgo: 'Hace {{unit}} hora',
				minutesAgo: 'Hace {{unit}} minutos',
				minuteAgo: 'Hace {{unit}} minuto',
				daysAgo: 'Hace {{unit}} días',
				monthsAgo: 'Hace {{unit}} meses',
				yesterday: 'Ayer',
				today: 'Ahora',
				now: 'En este momento',
				nonExistentContacts: 'Tu lista de contactos se encuentra vacía.',
			},
			defaultAvatarUrl: '', // if empty: this.settings.clientUrl + 'imgs/default_avatar.png'
			env: 'prod', // dev | prod
			avFiles: ['.doc', '.dot', '.docx', '.dotx', '.xls', '.xlsx', '.xlsm', '.ppt', '.pot', '.pps', '.pptx', '.pptm', '.potx', '.potm', '.pub', '.rar', '.zip', '.7zip', '.html', '.css', '.js', '.json', '.gz', '.tz', '.7z', '.tar', '.jpeg', '.jpg', '.tiff', '.gif', '.bmp', '.png', '.webp', '.psd', '.psp', '.cpt', '.svg', '.ai', '.pdf', '.txt', '.csv', '.php', '.mp4', '.mp3', '.avi', '.flv', '.wmv', '.mov', '.rmvb', '.mpg', '.mpeg', '.m4v', '.3gp', '.wma', '.m4a', '.mp2', '.aac', '.htm', '.log'],
		};
		defaultSettings.templates = {
			floating_chat: '<img src="{{clientUrl}}imgs/chatOpen.png" class="chatOpen" id="chatOpen">' +
					'<div class="vg-chat vg-chat_floating_chat">' +
					'<div class="contacts-list" data-open="floating_box"></div>' +
					'<input type="text" id="search-chat" class="form-control contacts-search" placeholder="' + defaultSettings.texts.searchContacts + '">' +
					'<div class="glyphicon glyphicon-search" id="glyphiconSearch-fixed"></div>' +
					'</div>',
			required_elements: '<audio id="chatSound" src="{{clientUrl}}sound/chat_sound.mp3"></audio>' +
					' <a class="image-popup-no-margins" style="display: none;">' +
					'<img id="image-popup" width="0" height="0">' +
					'</a>',
			contacts_list:
					' <h3 class="mobile-contacts-toggle down-triangle">' + defaultSettings.texts.contactsMobileDropdownTitle + '</h3>' +
					'<div class="vg-chat vg-chat_contacts_list">' +
					'<input type="text" class="form-control leftSearch contacts-search" placeholder="' + defaultSettings.texts.searchContacts + '" id="usersSearch">' +
					' <span class="glyphicon glyphicon-search" id="searchGlyphicon"></span>' +
					' <div class="contacts-list" data-open="master_chat"></div>' +
					' </div>',
			chat_box: '<div class="vg-chat vg-chat_chat_box"></div>',
			chat_box_content: '    <b>{{chat_title}}</b>' +
					'    <input class="rightSearch form-control" id="rightSearch" placeholder="{{text_search_messages}}" type="text">' +
					'        <span class="glyphicon glyphicon-search" id="glyphiconSearchRight"></span>' +
					'        <span class="glyphicon glyphicon-arrow-down" id="downArrow"></span>' +
					'        <span class="glyphicon glyphicon-arrow-up" id="upArrow"></span>' +
					'        <span class="lastOnline" id="lastOnline{{other_user.user_id}}" title="{{other_user.last_online_full_date}}">{{other_user.last_online_friendly_date}}</span>' +
					'        <div id="messages{{other_user.user_id}}" class="messageBox">{{messages}}</div>' +
					'		<div id="indicator{{other_user.user_id}}" class="indicator">{{text_user_is_writing}}</div>' +
					'		<textarea class="newMessage" id="newMessage" rows="5"></textarea>' +
					'		<div class="loadingDiv">' +
					'			<center>{{text_file_being_uploaded}}</center>' +
					'			<center>' +
					'				<div class="modal"></div>' +
					'			</center>' +
					'		</div>' +
					'		<button class="btn btn-green send-message-trigger">Enviar</button>' +
					'		<div class="filesDiv" id="filesDiv"></div>',
			contacts: '{{#contacts}}' +
					'<div class="master contact-{{id}}" id="left{{id}}" data-user-id="{{id}}" data-id="{{id}}" data-display_name="{{display_name}}" data-image="{{image}}"><img class="leftImage" src="{{image}}"><div class="grayRound" id="round{{id}}"></div><div class="nameTime"><span class="name">{{display_name}}</span><br><span class="time" id="time{{id}}" title="{{m_time}}">{{friendly_m_time}}</span><div class="newMessagesNum {{show_new_msg_label}}" id="newMessagesNum{{id}}">{{new_messages}}</div></div></div>{{/contacts}}',
			my_message: '<div class="oneMessage"><div class="myMsgDiv"><span class="mySpanTime" title="{{m_time}}">{{friendly_m_time}}</span><span class="mySpanName">{{user_name}}</span><div class="myText">{{message}}</div></div><img src="{{user_avatar}}" class="myImage"></div>',
			other_message: '<img src="{{user_avatar}}" class="otherImage">' +
					'<div class="otherMsgDiv"><span class="otherSpanName">{{user_name}}</span><span class="otherSpanTime" title="{{m_time}}">{{friendly_m_time}}</span><div class="otherText">{{message}}</div></div>'
		};
		this.settings = jQuery.extend({}, defaultSettings, settings);

		if (!this.settings.defaultAvatarUrl) {
			this.settings.defaultAvatarUrl = this.settings.clientUrl + 'imgs/default_avatar.png';
		}
		if (!this.settings.floatingChatSendButtonUrl) {
			this.settings.floatingChatSendButtonUrl = this.settings.clientUrl + 'imgs/sendbtn.png';
		}

		if (!this.areRequiredSettingsSet()) {
			return false;
		}


		// load Stylesheets
		this.loadStylesheet();

		// render widgets
		this.renderWidgets();

		// cache elements
		this.cacheElements();

// no funcionaron 2 plugins de custom scroll bars, incompatibilidad con el scroll infinito
		/*liveChat.$body.find('.contacts-list, .messageBox').each( function(){
		 var $el = jQuery(this);
		 jQuery($el).mCustomScrollbar({
		 theme:"inset-3-dark",
		 scrollbarPosition: 'outside',
		 scrollInertia: 0,
		 mouseWheel: true,
		 live: true,
		 callbacks:{
		 whileScrolling :function(){
		 $el.scrollTop(this.mcs.top);
		 }
		 }
		 });
		 });*/

		// clear Storage
		this.clearStorage();

		// set current time
		liveChat.helpers.setDateNow();

		// register replaceAll
		this.registerReplaceAll();

		// init sockets
		this.sockets.initIo();

		console.log(this.findWidget('floating_chat'));
		console.log(this.findWidget('chat_box'));

		if (this.findWidget('contacts_list')) {
			this.initContactsList(true);
		}
		if (this.findWidget('chat_box')) {
			this.initMasterChat();
		}
		// bind events
		this.bindEvents();

		// init emoticons
		this.initEmoticons();

		// show unread messages notification on page title
		liveChat.api.displayNewMessagesNotification();

		// init popup
		this.initImagePopup();

		// update messages time on floating chats
		this.updateMessagesTimesFloatingChat();


	},
	initMasterChat: function () {
		if (liveChat.api.isOpenedBoxSet()) {
			var data = liveChat.api.getOpenedBoxData();
			liveChat.api.renderMasterChat(data);
		}
	},
	removeLastDirectoryPartOf: function (the_url) {
		var the_arr = the_url.split('/');
		the_arr.pop();
		return(the_arr.join('/'));
	},
	loadStylesheet: function () {
		if ($('link#livechat-css').length) {
			return true;
		}
		if (this.settings.env === 'dev') {
			var clientUrl = (this.settings.clientUrl.lastIndexOf("/") === (this.settings.clientUrl.length - 1)) ? this.settings.clientUrl.substring(0, this.settings.clientUrl.lastIndexOf("/")) : this.settings.clientUrl;
			var vendorsUrl = this.removeLastDirectoryPartOf(clientUrl);
			$('head').append('<link rel="stylesheet" href="' + vendorsUrl + '/vendor/magnific-popup/dist/magnific-popup.css"/>' +
					'<link rel="stylesheet" href="' + this.settings.clientUrl + 'css/bootstrap-glyphicons.css"/>' +
					'<link rel="stylesheet" href="' + this.settings.clientUrl + 'css/emotions.css"/>' +
//					'<link rel="stylesheet" href="' + vendorsUrl + '/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css"/>' +
					'<link rel="stylesheet" id="livechat-css" href="' + this.settings.clientUrl + 'css/chat.css"/>');
		} else {
			$('head').append('<link rel="stylesheet" href="' + this.settings.clientUrl + 'vendor/libraries.min.css"/>' +
					'<link rel="stylesheet" id="livechat-css" href="' + this.settings.clientUrl + 'css/livechat.min.css"/>');
		}
	},
	areRequiredSettingsSet: function () {

		if (this.settings.current_user_id && this.settings.current_user_display_name && this.settings.current_user_username && this.settings.socketServerUrl && this.settings.clientUrl && this.settings.backendUrl) {
			return true;
		} else {
			return false;
		}
	},
	renderWidgets: function () {

		$widgetsHolders = $('.vg-chat-widget-holder');

		if ($widgetsHolders.length) {

			if (!jQuery( 'body' ).hasClass('vg-live-chat-wrapper')) {
				jQuery( 'body' ).addClass('vg-live-chat-wrapper'); 
			} 
			$widgetsHolders.each(function () {
				$widget = jQuery(this);
				console.log($widget);
				console.log($widget.data('widget'));
				var template = '<div class="vg-chat-widget-wrapper">' + liveChat.settings.templates[$widget.data('widget')] + '</div>';
				console.log(template);
				Mustache.parse(template); // optional, speeds up future uses

				var rendered = Mustache.render(template, {clientUrl: liveChat.settings.clientUrl});
				$widget.replaceWith(rendered);
			});
			jQuery('body').trigger("liveChat.widgetsRendered");
		}
	},
	openPopUp: function (image) {
		if (jQuery.fn.magnificPopup !== undefined) {
			$(".image-popup-no-margins").attr("href", $(image).attr("src"));
			$("#image-popup").attr("src", $(image).attr("src"));
			$(".image-popup-no-margins").magnificPopup("open");
		}
	},
	updateMessagesTimesFloatingChat: function () {
		setInterval(function () {
			liveChat.helpers.setDateNow();
			var masters = $(".timeChatBox");
			var mastersO = $(".timeChatBoxO");
			if (masters.length) {
				for (var i = 0; i < masters.length; i++) {
					$(masters[i]).empty().html(liveChat.helpers.findDifBig(masters[i].last_msg_time, ' '));
				}
			}
			if (mastersO.length) {
				for (var i = 0; i < mastersO.length; i++) {
					$(mastersO[i]).empty().html(liveChat.helpers.findDifBig(mastersO[i].last_msg_time, ' '));
				}
			}
		}, 60000);
	},
	bindEvents: function () {
		// setup events callbacks
		this.$body.on('keyup', ".contacts-search", this.initUsersSearch);
		this.$body.on('click', '.open-image-lightbox', function (e) {
			e.preventDefault();
			liveChat.openPopUp(jQuery(this).find('img'));
		});

		liveChat.sockets.on("write" + liveChat.settings.current_user_id, this.userStartedWriting.bind(this));
		liveChat.sockets.on("stopWrite" + liveChat.settings.current_user_id, this.userStoppedWriting.bind(this));
		liveChat.sockets.on("dis", this.userWasDisconnected.bind(this));
		liveChat.sockets.on("newCon", this.newUserConnected.bind(this));
		liveChat.sockets.on("acceptCon" + liveChat.settings.current_user_id, this.acceptedConnection.bind(this));
		liveChat.sockets.on(liveChat.settings.current_user_id, this.messageReceived.bind(this));

		this.$body.on('click', "#contactList", this.floatingChatToggle);
		this.$body.on('click', "#chatOpen", this.floatingChatBarToggle);

		this.$body.on('click', '.mobile-contacts-toggle', function (e) {
			e.preventDefault();
			var $toggle = jQuery(this);
			var $widget = $toggle.next('.vg-chat_contacts_list');

			jQuery($widget).slideToggle();

			if (jQuery($toggle).hasClass('up-triangle')) {
				jQuery($toggle).removeClass('up-triangle').addClass('down-triangle');
			} else {
				jQuery($toggle).removeClass('down-triangle').addClass('up-triangle');
			}
		});

		$(window).on('beforeunload', liveChat.api.updateLastOnline);
		$(document).ready(function () {
			setInterval(function () {
				liveChat.api.data.updateLastOnline();
				liveChat.updateLastOnline();
			}, 300000);
		});
		$(window).on('focus', function () {
			this.setActiveStatus(true);
		}.bind(this));
		$(window).on('blur', function () {
			this.setActiveStatus(false);
		}.bind(this));
	},
	setActiveStatus: function (status) {
		this.isActive = status;
	},
	// open / hide floating contacts
	floatingChatBarToggle: function () {
		console.log('Clicked');
		liveChat.$floatingChatContainer.toggle();
		if ($(this).css("right") === "0px") {
			$(this).css("right", "204px");
			liveChat.maxLeft = 85;
			liveChat.api.changeChatBoxPosition();
		} else {
			$(this).css("right", "0");
			liveChat.maxLeft = 100;
			liveChat.api.changeChatBoxPosition();
		}

	},
	// not sure about what it does
	floatingChatToggle: function () {

		this.$floatingChatContainer.show();
		$("#contactList").hide();
	},
	initFloatingChat: function () {
		liveChat.helpers.setDateNow();
		inicialize_master();

	},
	initImagePopup: function () {
		$('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: false,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300 // don't foget to change the duration also in CSS
			}
		});
	},
	messageReceived: function (data) {
		liveChat.helpers.setDateNow();
		console.log(data);
		if (liveChat.settings.current_user_id === data.from) {
			console.log('message from current user');
			return true;
		}
		$('#chatSound').get(0).play();
		if ($("#messages" + data.from).html() !== undefined) {
			var cb = $("#messages" + data.from);
			var scrollHeightTmp = cb[0].scrollHeight;
			var scrollPositionTmp = parseInt($(cb[0]).scrollTop()) + parseInt($(cb[0]).height()) + 100;
			liveChat.api.renderMessage($("#messages" + data.from), data.display_name, data.image_url, data.msg, this.strDateTime, data.from, false, true);
			if (scrollPositionTmp > scrollHeightTmp) {
				liveChat.helpers.scrollToBottom($("#messages" + data.from));
			}
			$.ajax({
				type: "POST",
				dataType: "json",
				url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_messages",
				data: {
					"id": data.from
				},
				error: function (jqXHR, textStatus, errorThrown) {
				},
				success: function (result) {
					console.log(result);

				}
			});
		}
		if ($("#messages" + data.from).html() === undefined && $("#chatBox" + data.from).html() !== undefined && $("#chatBox" + data.from).find(".chatBoxMessages").css("display") === 'none') {
			$.titleAlert('New message');
			var newMssagesNum = $("#newMessagesNum" + data.from);
			if (newMssagesNum !== undefined) {
				var num = $("#newMessagesNum" + data.from).html();
				num++;
				$("#newMessagesNum" + data.from).empty().html(num).show();
			}
			var newMssagesNum = $("#newMessagesNum-chat" + data.from);
			if (newMssagesNum !== undefined) {
				var num = $("#newMessagesNum-chat" + data.from).html();
				num++;
				$("#newMessagesNum-chat" + data.from).empty().html(num).css("visibility", "visible");
			}
			$("#chatBox" + data.from).find(".firstLineChatBox").addClass("lineColorNewMessage");

		}
		if ($("#chatBox" + data.from).html() !== undefined) {
			var cb = $("#chatBox" + data.from).find(".chatBoxMessages");
			var scrollHeightTmp = cb[0].scrollHeight;
			var scrollPositionTmp = parseInt($(cb[0]).scrollTop()) + parseInt($(cb[0]).height()) + 100;
			liveChat.api.renderMessage(cb[0], data.display_name, data.image_url, data.msg, this.strDateTime, data.from, true, true);
			if (scrollPositionTmp > scrollHeightTmp) {
				for (var i = 0; i < 4; i++) {
					setTimeout(liveChat.api.scrollToBottom, 200 * i, cb[0]);
				}
			}
			if ($("#chatBox" + data.from).find(".chatBoxMessages").css("display") !== 'none') {
				$.ajax({
					type: "POST",
					dataType: "json",
					url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_messages",
					data: {
						"id": data.from
					},
					error: function (jqXHR, textStatus, errorThrown) {
					},
					success: function (result) {
						console.log(result);

					}
				});
			}
		}
		if ($("#messages" + data.from).html() === undefined && $("#chatBox" + data.from).html() === undefined) {
			liveChat.api.renderFloatingBox(data.from, data.display_name, data.image_url);
		}
		if ($(".vg-chat_contacts_list").html() !== undefined) {
			$("#left" + data.from).parent().prepend($("#left" + data.from));
			$("#time" + data.from).empty().append("now");
			var timeDateNow = new Date();
			var string = [
				[timeDateNow.getFullYear(), liveChat.helpers.AddZero(timeDateNow.getMonth() + 1), liveChat.helpers.AddZero(timeDateNow.getDate())].join("-"), [liveChat.helpers.AddZero(timeDateNow.getHours()), liveChat.helpers.AddZero(timeDateNow.getMinutes()), liveChat.helpers.AddZero(timeDateNow.getSeconds())].join(":")
			].join(" ");
			var span = $("#time" + data.from);
			if (span[0] !== undefined) {
				span[0].last_msg_time = string;
			}
		}
		if (!this.isActive) {
			$.titleAlert('New message');
		}
	},
	acceptedConnection: function (data) {
		$("#round" + data).removeClass("grayRound").addClass("greenRound");
		$("#lastOnline" + data).css("visibility", "hidden");

	},
	initEmoticons: function () {

		var definition = {
			"smile": {
				"title": "Smile",
				"codes": [":)", ":=)", ":-)"]
			},
			"sad-smile": {
				"title": "Sad Smile",
				"codes": [":(", ":=(", ":-("]
			},
			"big-smile": {
				"title": "Big Smile",
				"codes": [":D", ":=D", ":-D", ":d", ":=d", ":-d"]
			}
		};
		$.emoticons.define(definition);
	},
	newUserConnected: function (data) {
		if (data !== liveChat.settings.current_user_id) {
			liveChat.api.acceptNewUserConnection(data);
		}
	},
	userStoppedWriting: function (data) {
		var item = $("#indicatorChatBox" + data);
		if (item[0] !== undefined) {
			$(item[0]).hide();
			var ms = $("#messages" + data);
			if (ms[0] !== undefined) {
				var height = parseInt($(ms[0]).css("height")) + 18;
				$(ms[0]).css("height", height);
			}
		}
		var item = $("#indicator" + data);
		if (item[0] !== undefined) {
			$(item[0]).hide();
		}
	},
	userStartedWriting: function (data) {
		var item = $("#indicator" + data);
		if (item[0] !== undefined) {
			$(item[0]).show();
			var ms = $("#messages" + data);
			if (ms[0] !== undefined) {
				var height = parseInt($(ms[0]).css("height")) - 18;
				$(ms[0]).css("height", height);
			}
		}
		var item = $("#indicatorChatBox" + data);
		if (item[0] !== undefined) {
			var ta = $(item[0]).parent().find('textarea');
			if ($(ta[0]).css("display") !== "none") {
				$(item[0]).show();
			}
		}
	},
	userWasDisconnected: function (data) {
		$("#round" + data).removeClass("greenRound").addClass("grayRound");
		$("#roundCB" + data).removeClass("greenRound").addClass("grayRound");
		liveChat.helpers.setDateNow();
		var lo = $("#lastOnline" + data);
		if (lo[0] !== undefined) {
			$(lo[0]).css("visibility", "visible").empty().append(liveChat.helpers.findDifLastOnline(this.strDateTime)).attr("title", this.strDateTime.slice(0, 4) + "/" + this.strDateTime.slice(5, 7) + "/" + this.strDateTime.slice(8, 10) + " " + this.strDateTime.slice(11, 16));
			lo[0].time = this.strDateTime;
		}
	},
	clearStorage: function () {
		if (liveChat.helpers.getCookie("window") === "" || liveChat.helpers.getCookie("window") === " ") {
			localStorage.clear();
		}
	},
	cacheElements: function () {
		this.$body = jQuery('body');
		this.$widgets = this.$body.find('.vg-chat');
		this.$floatingChatContainer = this.$body.find(".vg-chat_floating_chat");
		this.$masterChatContainer = this.$body.find('.vg-chat_chat_box');
	},
	findWidget: function (widget) {
		return (this.$body.find('.vg-chat_' + widget).length);
	},
	delay: (function () {
		var timer = 0;
		return function (callback, ms) {
			clearTimeout(timer);
			timer = setTimeout(callback, ms);
		};
	})(),
	initUsersSearch: function () {
		var value = $(this).val();
		liveChat.delay(function () {
			console.log(value);
			if (!value || !value.trim()) {
				liveChat.helpers.setDateNow()
				liveChat.initContactsList();
			} else {
				liveChat.helpers.setDateNow();
				if (value.length > 1) {
					liveChat.api.searchContacts(value, 'full', false);
				} else {
					liveChat.api.searchContacts(value, 'first_letter', false);
				}
			}
		}, 800);
	},
	setOpenedUser: function (userData) {
		if (!liveChat.api.isOpenedBoxSet()) {
			liveChat.api.renderMessages(userData);
		}
	},
	renderNonExistentContactsMsg: function(){
		if( liveChat.findWidget('chat_box')){
			liveChat.$masterChatContainer.empty().append('<p class="vg-chat-non-existent-contacts-message">'+ liveChat.settings.texts.nonExistentContacts+'</p>');
		}
		if( liveChat.$body.find('.vg-chat_contacts_list').length ){
			liveChat.$body.find('.vg-chat_contacts_list').append('<p class="vg-chat-non-existent-contacts-message">'+ liveChat.settings.texts.nonExistentContacts+'</p>');
		}
	},
	initContactsList: function (fullInit) {
		if (!fullInit) {
			fullInit = false;
		}
		liveChat.api.data.getContacts().done(function (contacts) {
			console.log(contacts);

			liveChat.contactsList = contacts;
			// exit if empty
			if (!contacts || $.isEmptyObject(contacts)) {
				
				liveChat.renderNonExistentContactsMsg();
				return true;
			}

			// empty current contacts list        
			$(".contacts-list").empty();

			// render contacts
			liveChat.api.renderContacts(this.contactsList, liveChat.$body.find(".contacts-list"), fullInit);
			liveChat.$body.find('.vg-chat_contacts_list').css('max-height', jQuery(window).height());

			// emit socket connection
			liveChat.sockets.emit("con", liveChat.settings.current_user_id);
		}.bind(this));
	},
	updateLastOnline: function () {

		liveChat.helpers.setDateNow();
		//        inicialize();
		// no es necesario usar interval si el método se ejecuta en onbeforeunload
//        setInterval(function () {
		console.log('executed');
		liveChat.helpers.setDateNow();
		var masters = $(".vg-chat_contacts_list").find(".master");
		if (masters.length) {
			for (var i = 0; i < masters.length; i++) {
				var times = $(masters[0]).find(".time");
				if (times && times[0].last_msg_time) {
					$(times[0]).empty().html(liveChat.helpers.findDif(times[0].last_msg_time));
				}
			}
		}
		var lo = $(".lastOnline");
		if (lo.length && lo[0] !== undefined) {
			$(lo[0]).empty().append(liveChat.helpers.findDifLastOnline(lo[0].time));
		}
		var times = $(".mySpanTime");
		if (times.length) {
			for (var i = 0; i < times.length; i++) {
				$(times[i]).empty().html(liveChat.helpers.findDifBig(times[i].time));
			}
		}
		var times = $(".otherSpanTime");
		if (times.length) {
			for (var i = 0; i < times.length; i++) {
				$(times[i]).empty().html(liveChat.helpers.findDifBig(times[i].time));
			}
		}
//        }, 60000);
	},
	scrolltoDown: function () {
		$(window).ready(function () {
			setTimeout(function () {
				liveChat.helpers.scrollToBottom();
			}, 200);
		});
	},
	registerReplaceAll: function () {
		String.prototype.replaceAll = function (str1, str2, ignore) {
			return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
		};
	},
	handleFileSelect: function (event, floatingChat) {
		event.stopPropagation();
		event.preventDefault();

		event = event.originalEvent;
		console.log($(event.target));
		console.log(event);
		console.log(floatingChat);

		var files = event.dataTransfer.files; // FileList object.

		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {
			if (floatingChat) {
				if ($(event.target).prop("disabled")) {
					break;
				}
				liveChat.filesNumCB[event.target.to]++;

			}
			var timestamp = Math.floor(Date.now() / 1000) + "" + liveChat.settings.current_user_id + "_" + i;
			var ex = f.name.split(".");
			if (liveChat.settings.avFiles.indexOf("." + ex[ex.length - 1]) == -1) {
				continue;
			}
			var template = '<span class="fileName" id="{{timestamp}}"><div class="fileLoad"><div class="sk-fading-circle">        <div class="sk-circle1 sk-circle"></div>        <div class="sk-circle2 sk-circle"></div>        <div class="sk-circle3 sk-circle"></div>        <div class="sk-circle4 sk-circle"></div>        <div class="sk-circle5 sk-circle"></div>        <div class="sk-circle6 sk-circle"></div>        <div class="sk-circle7 sk-circle"></div>        <div class="sk-circle8 sk-circle"></div>       <div class="sk-circle9 sk-circle"></div>       <div class="sk-circle10 sk-circle"></div>        <div class="sk-circle11 sk-circle"></div>        <div class="sk-circle12 sk-circle"></div>    </div></div></span>';
			var data = {
				timestamp: timestamp,
			};
			Mustache.parse(template); // optional, speeds up future uses
			var rendered = Mustache.render(template, data);
//			var span = document.createElement("span");
			if (floatingChat) {
				var $target = $(event.target).parent().find('.filesNames');
				$target.append(rendered);
				var $span = $target.find('.fileName').first();
			} else {
				var $target = $("#filesDiv");
				$target.append(rendered);
				var $span = $target.find('.fileName').first();
			}

			$span.newName = timestamp;
			$span.extension = ex[ex.length - 1];

			// prepare data for ajax request
			var fd = new FormData();
			fd.append("label", f.name);
			fd.append("to_user", $(event.target).data('to-user'));
			fd.append("newName", timestamp);
			fd.append("file", f);
//			console.log(fd);
			$.ajax({
				url: liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=upload",
				type: "POST",
				data: fd,
				enctype: 'multipart/form-data',
				processData: false, // tell jQuery not to process the data
				contentType: false // tell jQuery not to set contentType
			}).done(function (data) {
				console.log(data);
//                if( data === -1 ){                    
//                $("#" + infoLink).remove();
//                }
				var info = data.slice(1, data.length - 2).split(",");
				var infoLink = info[0].replaceAll('"', '');
				var infoEx = info[1].replaceAll('"', '');
				var infoTo = info[2].replaceAll('"', '');
				var infoOld = info[3].replaceAll('"', '');
				var nMessage = "";
				console.log(infoEx);
				if (infoEx === "png" || infoEx === "jpg" || infoEx === "jpeg" || infoEx === "gif" || infoEx === "bmp") {
					//nMessage = "<br><a href='#' class='open-image-lightbox'><img src=" + liveChat.settings.backendUrl + "?livechat_request=yes&endpoint=read_image&image=" + infoLink + " class=messageImage onclick=openPopUp(this)></a><br>";
					nMessage = '[linked_file="' + infoLink + '" type="image" filename="' + infoOld + '"]';
					liveChat.api.sendMessage(nMessage, infoTo);
				} else {
					//nMessage = "<a target='_blank' href='"+ liveChat.settings.backendUrl +"?livechat_request=yes&endpoint=download_proxy&file=" + infoLink + "'>" + infoOld + "</a><br>";
					nMessage = '[linked_file="' + infoLink + '" type="file" filename="' + infoOld + '"]';
					if (floatingChat) {
						liveChat.api.sendMessage(nMessage, infoTo, $("#" + infoLink).parent());
					} else {
						liveChat.api.sendMessage(nMessage, infoTo);
					}
				}
				console.log($("#" + infoLink));
				$("#" + infoLink).remove();
			});
		}
	},
	handleDragOver: function (evt) {
//		console.log(evt);
		evt.stopPropagation();
		evt.preventDefault();
		evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		console.log('dragover');
	},
	textareaHandler: function (to, from, $context, isFloatingChat) {
		if (!isFloatingChat) {
			isFloatingChat = false;
		}
		var $textarea = $context.find('textarea');
		$textarea
				.data('to-user', to)
				// emit event when user is typing
				.focusin(function () {
					data = {
						"my": from,
						"to": to,
					}
					liveChat.sockets.emit("write", data);
				})
				// emit event when user stopped typing
				.focusout(function () {
					data = {
						"my": from,
						"to": to,
					}
					liveChat.sockets.emit("stopWrite", data);
				})
				// prevent adding new lines when pressing enter without shift key
				.keydown(function (e) {
					if (e.keyCode == 13 && !e.shiftKey) {
						e.preventDefault();
					}
				})
// send message
				.keyup(function (e) {
					if (window.event) {
						var keyCode = window.event.keyCode;
					} else {
						var keyCode = e.keyCode || e.which;
					}
					if ((!e.shiftKey && (keyCode == 13))) {
						console.log(isFloatingChat);
						liveChat.api.startSendingMessage($context, isFloatingChat);
					}
				}.bind(isFloatingChat))

				// file uploads on drag and drop
				.on('dragover', liveChat.handleDragOver)
				.on('drop', function (event) {
					liveChat.handleFileSelect(event, isFloatingChat);
				});

	},
};