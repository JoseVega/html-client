//var liveChat = liveChat || {};
liveChat.api = {
	toggleFloatingBoxVisibility: function ($floatingBox) {

		$floatingBox.find(".newMessageChatBox").toggle();
		$floatingBox.find(".chatBoxMessages").toggle();
		$floatingBox.find(".sndBtn").toggle();
	},
	getContactFromCache: function (searchTerm) {

		for (var i = 0; i < liveChat.contactsList.length; i++) {
			if (liveChat.contactsList[i].id == searchTerm || liveChat.contactsList[i].display_name == searchTerm) {
				return liveChat.contactsList[i];
			}
		}
		return false;
	},
	resetFloatingBoxPointers: function (id) {

		liveChat.filesNumCB[ id ] = 0;
		liveChat.lastSenderBox[ id ] = 0;
		liveChat.lastTimeBox[ id ] = 0;
		liveChat.pages[ id ] = 1;
		liveChat.scrollsHeightBefore[ id ] = 0;
	},
	noUserFound: function () {
		var template = '<center><b>{{text_no_user_found}}</b></center>';

		Mustache.parse(template); // optional, speeds up future uses
		var rendered = Mustache.render(template, {
			text_no_user_found: liveChat.settings.texts.noContactsFound,
		});

		$(".contacts-list").append(rendered);
	},
	setOpenedBox: function (contactData) {
		localStorage.setItem("id", contactData["id"]);
		localStorage.setItem("display_name", contactData["display_name"]);
		localStorage.setItem("image", contactData["image"]);
		localStorage.setItem("openedBox", 1);
		liveChat.helpers.setCookie("window", 1, 10);
	},
	getOpenedBoxData: function () {
		if (!liveChat.api.isOpenedBoxSet()) {
			return false;
		}
		var out = {
			id: localStorage.getItem("id"),
			display_name: localStorage.getItem("display_name"),
			image: localStorage.getItem("image"),
			openedBox: localStorage.getItem("openedBox"),
		};
		return out;
	},
	isOpenedBoxSet: function () {
		var value = localStorage.getItem("openedBox");
		if (!value || !$.trim(value)) {
			return false;
		} else {
			return true;
		}
	},
	renderMessages: function (contact, isFloatingChat, $target, autoScrollToPreviousPosition ) {
		liveChat.helpers.setDateNow();
		console.log(contact);
		
		if( $target.hasClass('jspScrollable')){
			$target = $target.find('.jspPane');
		}
		liveChat.api.data.getMessagesWith(contact.id, false).done(function (result) {
			console.log(result);
			console.log(contact.id);
			console.log($target.parent());
			console.log($target.parent().find("#spinner" + contact.id));
			// hide loading icon
			if ($target.length > 1) {
				$target = $target.first();
			}
			$target.parent().find("#spinner" + contact.id).remove();

			if( result.length ){
			for (var i = 0; i < result.length; i++) {
				if (result[i]["user_sender"] == contact.id) {
					liveChat.api.renderMessage($target, contact.display_name, contact.image, result[i]["message"], result[i]["m_time"], contact.id, isFloatingChat, false);
				} else {
					liveChat.api.renderMessage($target, null, null, result[i]["message"], result[i]["m_time"], null, isFloatingChat, false);
				}
			}
			if( autoScrollToPreviousPosition ){
				console.log($target[0].scrollHeight);
				console.log(liveChat.scrollHeightBefore);
			$( $target ).scrollTop( $target[0].scrollHeight - liveChat.scrollHeightBefore );
		}
		
		if( isFloatingChat ){			
			liveChat.pages[contact.id]++;
		} else {
					liveChat.page++;
				}
			} else {
				$( $target ).off();
			}
		liveChat.$body.trigger( "liveChat.messagesRendered", [ contact, result, isFloatingChat, $target, autoScrollToPreviousPosition ] );
		}.bind(this));
		
	},
	isUserOnline: function (id) {
		if ($("#round" + id).length) {
			return  !$("#round" + id).hasClass("grayRound");
		} else {
			return false;
		}
	},
	resetNewMessagesCountFromUser: function (id) {

		var $newMessages = $('body').find("#newMessagesNum" + id + ", #newMessagesNumChatBox" + id);

		$('body').find("#newMessagesNum" + id).hide();
		liveChat.api.stopTittleAlert();

		// set new messages count to 0 and hide it
		if ($newMessages.length) {
			$newMessages.empty().html(0).css("visibility", "hidden");
		}
		// mark messages as read		
		liveChat.api.data.markAllMessagesAsReadFrom(id).done(function (result) {
			liveChat.api.stopTittleAlert();
		});
		
		liveChat.$body.trigger( "liveChat.newMessagesCountReset", [ id ] );
	},
	// replaces addAllMessages()
	renderMasterChat: function (contact) {
		console.log(contact);
		liveChat.helpers.setDateNow();

		liveChat.page = 1;
		
		var template = liveChat.settings.templates.chat_box_content;
		var data = {
			other_user: {
				display_name: contact.display_name,
				last_online_full_date: '', // default: "2000/20/20 00:00:00", we set it later
				last_online_friendly_date: '', // we set it later
				user_id: contact.id
			},
			messages: '', // we set it later
			chat_title: Mustache.render(liveChat.settings.texts.chattingWith, {
				display_name: contact.display_name,
			}), // Chat con {{other_user.display_name}}
			text_search_messages: liveChat.settings.texts.searchMessagesInConversation,
			text_user_is_writing: Mustache.render(liveChat.settings.texts.userIsWriting, {
				display_name: contact.display_name,
			}),
			text_file_being_uploaded: liveChat.settings.texts.fileBeingUploaded,
		};

		Mustache.parse(template); // optional, speeds up future uses
		var rendered = Mustache.render(template, data);

		var $masterChat = $('.vg-chat_chat_box').first();

		// remove existing content, and render new chat
		$masterChat.empty().append(rendered);

		// create messages container
		var messages = $masterChat.find("#messages" + contact.id).first();
		messages.user_id = contact.id;
		messages.display_name = contact.display_name;
		messages.image = contact.image;

		// add messages
		console.log('add messages');
		liveChat.api.renderMessages(contact, false, messages);

		// load more messages when the user scrolls up
		$(messages).on('scroll', function(){
			liveChat.api.initInfiniteScrollOnMainChat( contact, messages );
		});

		// get last online time if user is not online
		if (!liveChat.api.isUserOnline(contact.id)) {
			liveChat.api.data.getUserLastOnline(contact.id, function (lastOnlineTime) {
				console.log(lastOnlineTime);
				console.log($masterChat);
				$masterChat.find('.lastOnline').empty().text(lastOnlineTime.friendly_time).attr('title', lastOnlineTime.full_time);
			});
		} else {
			$masterChat.find('.lastOnline').empty().text('now').attr('title', new Date());
		}

		// click down arrow
		$masterChat.find("#downArrow").click(function () {
			if (liveChat.searchMax > 0 && liveChat.searchNum < liveChat.searchMax) {
				var mb = $(".messageBox");
				var messageBoxes = $(mb[0]).find(".oneMessage");
				mb[0].scrollTop += parseInt($(messageBoxes[liveChat.searchNum - 1]).height()) + 15;
				var messageDiv = $(messageBoxes[liveChat.searchNum - 1]).find("div");
				$(messageDiv[1]).removeClass("searchDivYellow");
				var messageDiv = $(messageBoxes[liveChat.searchNum]).find("div");
				$(messageDiv[1]).addClass("searchDivYellow");
				liveChat.searchNum++;
			}
		});

		// up arrow for browsing search results
		$masterChat.find("#upArrow").first().click(function () {
			if (liveChat.searchMax > 0 && liveChat.searchNum > 1) {
				var mb = $(".messageBox");
				var messageBoxes = $(mb[0]).find(".oneMessage");
				mb[0].scrollTop -= parseInt($(messageBoxes[liveChat.searchNum - 2]).height()) + 15;
				var messageDiv = $(messageBoxes[liveChat.searchNum - 1]).find("div");
				$(messageDiv[1]).removeClass("searchDivYellow");
				var messageDiv = $(messageBoxes[liveChat.searchNum - 2]).find("div");
				$(messageDiv[1]).addClass("searchDivYellow");
				liveChat.searchNum--;
			}
		});

		// reset new messages count
		liveChat.api.resetNewMessagesCountFromUser(contact.id);

		// search input
		var input = $masterChat.find("#rightSearch").first();
		input.user_id = contact.id;
		input.display_name = contact.display_name;
		input.image = contact.image;
		input.on('keyup', function () {
			var value = $(this).val();
			var userData = {
				id: input.user_id,
				display_name: input.display_name,
				image: input.image
			};

			liveChat.delay(function () {
				if (value.trim() == "") {
					$("#upArrow").hide();
					$("#downArrow").hide();
					liveChat.helpers.setDateNow();
					console.log(userData);
					liveChat.page = 1;
					$(messages).empty();				
					
		
					liveChat.api.renderMessages(userData, false, $(messages));
		$(messages).on('scroll', function(){
			liveChat.api.initInfiniteScrollOnMainChat( contact, messages );
		});
				} else {
					$("#upArrow").show();
					$("#downArrow").show();
					liveChat.helpers.setDateNow();
					console.log(userData);
					console.log(userData.id);
					liveChat.page = 1;
					$(messages).empty();
					liveChat.api.searchMessages(value, userData.id, userData.display_name, userData.image);
				}
			}, 800);
		});



		// create textarea
		liveChat.textareaHandler(contact.id, liveChat.settings.current_user_id, $masterChat, false);

		var button = $masterChat.find('.send-message-trigger').first();
		button.to = contact.id;
		$(button).click(function () {
			liveChat.api.startSendingMessage($masterChat, false);
		});

		liveChat.api.stopTittleAlert();		
		liveChat.api.setOpenedBox( contact );
		
		liveChat.$body.trigger( "liveChat.masterChatRendered", [ contact ] );
		
	},
	
	initInfiniteScrollOnMainChat: function( contact, messages ){
			if ($(messages).scrollTop() == 0) {
	console.log(contact);
	console.log(messages);
				var loaderAnimation = '<div class="spinner" id="spinner' + contact.id + '"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
				$(messages).prepend(loaderAnimation);
				liveChat.scrollHeightBefore = messages[0].scrollHeight;
				console.log(liveChat.scrollHeightBefore);
				console.log(messages);
				liveChat.api.renderMessages({
					id: contact.id,
					display_name: contact.display_name,
					image: contact.image
				}, false, $(messages), true );
			}	
	},
// replaces sendMessageOld() y sendMessageChatBox()
	sendMessage: function (message, to) {
		liveChat.sockets.sendMessage(message, to);

		// move contact to the top of the contacts list
		$(".contact-" + to).each(function () {
			var $contact = jQuery(this);
			$contact.parent().prepend($contact);
		});

		// set last online to now
		$("#time" + to).empty().html("now");

		var span = $("#time" + to);
		var timeDateNow = new Date();
		var string = [
			[timeDateNow.getFullYear(), liveChat.helpers.AddZero(timeDateNow.getMonth() + 1), liveChat.helpers.AddZero(timeDateNow.getDate())].join("-"), [liveChat.helpers.AddZero(timeDateNow.getHours()), liveChat.helpers.AddZero(timeDateNow.getMinutes()), liveChat.helpers.AddZero(timeDateNow.getSeconds())].join(":")
		].join(" ");

		if (span.length) {
			span[0].last_msg_time = string;
		}

		// add message to master chat
		console.log($("#messages" + to));
		if ($("#messages" + to).length) {
			liveChat.api.renderMessage($("#messages" + to), null, null, message, string, null, false, true);
		}
		// add message to floating chat
		if ($("#chatBox" + to).find(".chatBoxMessages").length) {
			console.log('send msg for upload');
			liveChat.api.renderMessage($("#chatBox" + to).find(".chatBoxMessages"), null, null, message, string, null, true, true);
		}

		liveChat.api.data.saveMessage(to, message);
		liveChat.$body.trigger( "liveChat.messageSaved", [ to, message ] );
	},
	// replacing addOtherMessage() , addOtherMessageToChatBox() , addMyMessageToChatBox() , addMyMessage()
	renderMessage: function (messages, display_name, image_url, message, time, id, isFloatingChat, incoming) {

		if (!display_name) {
			display_name = liveChat.settings.current_user_display_name;
		}
		if (!image_url) {
			image_url = liveChat.settings.current_user_avatar;
		}
		if (!id) {
			id = liveChat.settings.current_user_id;
		}
		console.log(id);
		console.log(liveChat.settings.current_user_id);
		var classPrefix = (id == liveChat.settings.current_user_id) ? 'my' : 'other';
		var messageBoxClass = (isFloatingChat) ? "." + classPrefix + "MessageTextChatBox" : "." + classPrefix + "MsgDiv";
//		if (isFloatingChat) {
			var messageBoxTextClass = "." + classPrefix + "Text";
//		}

		// replace emoticons
		var message = $.emoticons.replace(message);
//        console.log(message);
		var message = liveChat.helpers.replaceImageShortcode(message);

		var lastSenderId = (isFloatingChat) ? liveChat.lastSenderBox[id] : liveChat.lastSender;
		var lastSenderTime = (isFloatingChat) ? liveChat.lastTimeBox[id] : liveChat.lastTime;
//        console.log(message);

// if message was sent the same minute then the previous message.
		if (lastSenderId == id && liveChat.lastTime && time.slice(0, 16) === lastSenderTime.slice(0, 16)) {

console.log('msg on same min.');
			// all messages
			var om = $(messages).find((isFloatingChat) ? '.masterMsgDiv' : '.oneMessage');			
			// message content box 
			var mb = $(om[ (!incoming) ? 0 : om.length - 1]).find(messageBoxClass);

			var target = (isFloatingChat) ? mb[0] : $(mb[0]).find(messageBoxTextClass);

console.log(om);
console.log($(mb[0]));
console.log(messageBoxTextClass);
console.log(target);
			if (!incoming) {
				$(target).prepend(message + '<br/>');
			} else {
				$(target).append(message + '<br/>');
			}

		} else {
			// update global pointers for last message
			if (isFloatingChat) {
				liveChat.lastSenderBox[id] = id;
				liveChat.lastTimeBox[id] = time;
			} else {
				liveChat.lastSender = id;
				liveChat.lastTime = time;

			}

			if (isFloatingChat) {
				var template = '<div class="masterMsgDiv"><div class="nameTimeChatBox ' + classPrefix + 'nameTimeChatBox"><span class="nameChatBoxO">{{display_name}}</span><span title="{{full_date}}" class="timeChatBoxO">{{friendly_date}}</span></div><div class="' + classPrefix + 'MessageTextChatBox">{{{message}}}</div></div>';
			} else {
				var firstImageTag = ( classPrefix === 'my' ) ? '' : '<img src="{{image_url}}" class="' + classPrefix + 'Image">';
				var secondImageTag = ( classPrefix === 'my' ) ? '<img src="{{image_url}}" class="' + classPrefix + 'Image">' : '';
				
				var template = '<div class="oneMessage">' + firstImageTag + '<div class="' + classPrefix + 'MsgDiv"><span class="' + classPrefix + 'SpanName">{{display_name}}</span><span class="' + classPrefix + 'SpanTime" title="{{friendly_date}}">{{full_date}}</span><div class="' + classPrefix + 'Text">{{{message}}}</div></div>' + secondImageTag + '</div>';
			}
			var data = {
				image_url: (image_url) ? image_url : liveChat.settings.defaultAvatarUrl,
				display_name: display_name,
				full_date: time.slice(0, 4) + "/" + time.slice(5, 7) + "/" + time.slice(8, 10) + " | " + time.slice(11, 16),
				friendly_date: liveChat.helpers.findDifBig(time),
				message: message,
			};
			Mustache.parse(template); // optional, speeds up future uses
			var rendered = Mustache.render(template, data);

			if (!incoming) {
				$(messages).prepend(rendered);
			} else {
				$(messages).append(rendered);
			}
		}
//		console.log($(messages).first()[0]);
		$(messages).first()[0].scrollTop = $(messages).first()[0].scrollHeight;
	},
	// replacing addUser()
	
	renderContacts: function (contacts, target, autoOpen) {
		var template = liveChat.settings.templates.contacts;
		Mustache.parse(template); // optional, speeds up future uses

		console.log(contacts);
		//        var friendly_time = liveChat.helpers.findDif(m_time);
		//        var title_time = m_time.slice(0, 4) + "/" + m_time.slice(5, 7) + "/" + m_time.slice(8, 10) + " | " + m_time.slice(11, 16);

		$.each(contacts, function (key, value) {
			contacts[key].image = (contacts[key].image) ? contacts[key].image : liveChat.settings.defaultAvatarUrl;
			contacts[key].friendly_m_time = (contacts[key].m_time) ? liveChat.helpers.findDif(contacts[key].m_time) : '';
			contacts[key].show_new_msg_label = function () {
				return (contacts[key].new_messages > 0) ? '' : 'hidden';
			};
		});
		var rendered = Mustache.render(template, {
			contacts: contacts
		});
		$(target).html(rendered);

		$(target).each(function () {
			var $contactsList = jQuery(this);
			var open = $contactsList.data('open');

			console.log(open);
			if (!open) {
				return true;
			}
			if (autoOpen) {
				if (open === 'master_chat') {
					var queryString = $.trim(liveChat.helpers.getQueryStringValue('chat_with'));
					if (queryString) {
						console.log(true);
						var openContact = liveChat.api.getContactFromCache(queryString);
					} else {
						console.log(false);
						var openContact = contacts[0];
					}

					// mark first user as active
					$('#left' + openContact.id).first().active = true;

					console.log(contacts);
					console.log(openContact);
					console.log(liveChat.api.isOpenedBoxSet());
					console.log(queryString);
					// open chat with first user
					if (!liveChat.api.isOpenedBoxSet()) {
						liveChat.api.renderMasterChat(openContact);
					}
				} else {
					liveChat.api.openPreviouslyOpenedFloatingBoxes();
				}
			}
			$contactsList.children().each(function () {
				jQuery(this).click(function () {
					if (open === 'master_chat') {
						liveChat.api.renderMasterChat( jQuery(this).data() );

					} else {
						liveChat.api.resetFloatingBoxPointers(jQuery(this).data('id'));
						liveChat.api.openFloatingBox(jQuery(this).data() );
					}
				});

			});
		});
		liveChat.sockets.emit("con", liveChat.settings.current_user_id);
		
		liveChat.$body.trigger( "liveChat.contactsListRendered", [ contacts, target, autoOpen ] );
	},
	openFloatingBox: function ( contact ) {

		var availablePosition = liveChat.api.getFloatingBoxPosition();
		var neededWidth = ( availablePosition + ( ( liveChat.settings.floatingChatBoxWidth + 10 )  * 2 ) );
		console.log(neededWidth);
		if(  neededWidth > jQuery( window ).width() ){
			alert( liveChat.settings.texts.tooManyFloatingBoxesOpened );
			return false;
		}
		
		var data = contact;
		var $contact = liveChat.$floatingChatContainer.find('.contact-' + data.id );
		
		console.log(data);

		// mark new messages count as read
		$contact.find('.newMessagesNum').empty().html(0).css("visibility", "hidden");

		// get floating chat box
		var $box = $("#chatBox" + data.user_id);
		console.log($box);

		// create chat box and open it if not exists
		if (!$box.length) {
			liveChat.api.renderFloatingBox(data.id, data.display_name, data.image);
		} else {
			// open minimized box
			if (liveChat.api.isFloatingBoxMinized($box)) {
				liveChat.api.toggleFloatingBoxVisibility($box);
			}
		}
	},
	isFloatingBoxMinimized: function ($box) {
		return !$box.find('.chatBoxMessages').is('visible');
	},
	closeChatBox: function (id) {
		liveChat.numOfOpenedBoxes--;
		$("#chatBox" + id).remove();
		liveChat.api.changeChatBoxPosition();
		var cookie = liveChat.helpers.getCookie("chatBoxes");
		var cookies = cookie.split("&**&");
		if (cookies.length < 2) {
			liveChat.helpers.setCookie("chatBoxes", "", 0.00001);
		} else {
			var newCookie = "";
			var first = 0;
			for (var i = 0; i < cookies.length; i++) {
				var box = cookies[i].split("&*&");
				if (parseInt(box[0]) == parseInt(id)) {
					continue;
				}
				var newBox = box[0] + "&*&" + box[1] + "&*&" + box[2];
				if (first == 0) {
					first = 1;
					newCookie += newBox;
				} else {
					newCookie += "&**&" + newBox;
				}
			}
			liveChat.helpers.setCookie("chatBoxes", newCookie, 3000000);
		}
	},
	getFloatingBoxPosition: function () {
		return (liveChat.numOfOpenedBoxes - 1) * liveChat.settings.floatingChatBoxWidth + 10;
	},
	startSendingMessage: function ($parent, isFloatingChat) {
		var $textarea = $parent.find('textarea');

		var message = $.trim($textarea.val());
		var filesNames = (isFloatingChat) ? $.trim($parent.find('.filesNames').html()) : $.trim($parent.find("#filesDiv").html());
		// exit if we have no message or files
		if (!message && !filesNames) {
			return;
		}
		// replace characters and words
		var message = message.replaceAll("\n", "<br>").replaceAll("'", "&#39;").replaceAll('"', "&#34;");
		// send message
		liveChat.api.sendMessage(message, $textarea.data('toUser'));
		// clear textarea
		$textarea.val('');
	},
	// replacing openChatBox()
	renderFloatingBox: function (id, display_name, image) {

		liveChat.numOfOpenedBoxes++;
		liveChat.pages[ id ] = 1;

		var template = '<div class="vg-chat-widget-wrapper"><div class="chatBox hidden" id="chatBox{{user_id}}" style="right: {{box_position}}px;"><div class="floating-box-header firstLineChatBox lineColorGray"><div class="newMessagesNum-chatBox" id="newMessagesNumChatBox{{user_id}}"  style="visibility: {{new_messages_count_visibility}};">{{new_messages_count}}</div><div class="chatBoxName">{{display_name}}</div><div class="remove glyphicon glyphicon-remove glyphicon-remove-chatBox"></div><div class="spanLine"></div></div>' +
				'<div class="chatBoxMessages"></div><div id="indicatorChatBox{{user_id}}" class="indicator user-typing-indicator">{{text_user_is_writing}}</div><textarea class="newMessageChatBox" id="newMessageChatBox" rows="2" placeholder="{{text_write_message_here}}"></textarea><img class="sndBtn send-message-trigger" src="{{send_button_url}}"><div class="filesNames"></div><div class="loadingDivChatBox" id="loadingDivChatBox{{user_id}}"><center>{{text_file_being_uploaded}}</center><center><div class="modalChatBox"></div></center></div></div></div>';

		Mustache.parse(template); // optional, speeds up future uses
		var data = {
			user_id: id,
			new_messages_count: 0,
			display_name: display_name,
			new_messages_count_visibility: 'hidden',
			send_button_url: liveChat.settings.floatingChatSendButtonUrl,
			box_position: liveChat.api.getFloatingBoxPosition(),
			text_user_is_writing: Mustache.render(liveChat.settings.texts.userIsWriting, {
				display_name: display_name
			}),
			text_write_message_here: liveChat.settings.texts.writeMessageHer,
			text_file_being_uploaded: liveChat.settings.fileBeingUploaded,
			image: (image) ? image : liveChat.settings.defaultAvatarUrl,
		};

		var rendered = Mustache.render(template, data);

		$('body').append(rendered);

		console.log(liveChat.maxLeft);
		console.log(liveChat.numOfOpenedBoxes);

		$floatingBox = $("#chatBox" + id).first();
		console.log($floatingBox);

		// update position to avoid showing box on top of the floating contacts list
		liveChat.api.changeChatBoxPosition();
		$floatingBox.removeClass('hidden');

		$($floatingBox).data(data);
		$($floatingBox).find('.remove').data('user-id', id).click(function () {
			liveChat.api.closeChatBox(jQuery(this).data('user-id'));
		});

		$($floatingBox).find('.floating-box-header').first().data('other-user-id', id).click(function () {
			var $boxHeader = jQuery(this);
			var $floatingBox = $boxHeader.parent();
			// hide / show box elements for minimization effect
			liveChat.api.toggleFloatingBoxVisibility($floatingBox);

			// messages container
			var $messagesContainer = $floatingBox.find(".chatBoxMessages").first();
			console.log($messagesContainer);
			console.log('clicked');
			console.log($messagesContainer.scrollHeight);

//            mb[0].scrollTop = mb[0].scrollHeight;

// move scroll to the bottom if messages container is found
			if ($messagesContainer.length) {
				$messagesContainer.scrollTop($messagesContainer.scrollHeight);
			}

			// remove "new message" color notification
			$floatingBox.removeClass("lineColorNewMessage");

			// reset new messages count 
			liveChat.api.resetNewMessagesCountFromUser($floatingBox.data('other-user-id'));
		});

		var $messagesContainer = $($floatingBox).find('.chatBoxMessages').first();
		liveChat.api.addMessagesToBox($messagesContainer, id, display_name, image, true);

		// move scroll to bottom every 200ms * 7
		liveChat.helpers.scrollToBottom($messagesContainer);
		for (var i = 0; i < 7; i++) {
			setTimeout(function () {
				liveChat.helpers.scrollToBottom($messagesContainer);
			}, 200 * i);
		}

		// add data to element for using in events
		$messagesContainer.data({
			user_id: id,
			display_name: display_name,
			image: image,
		})
				// when we scroll over the box
				.on('scroll', function () {
					var $messagesContainer = jQuery(this);
					var data = $messagesContainer.data();

					if ($messagesContainer.scrollTop() === 0) {
						var loaderAnimation = '<div class="spinner" id="spinnerBox' + data.user_id + '"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>';
						$messagesContainer.prepend(loaderAnimation);
						liveChat.scrollsHeightBefore[data.user_id] = this.scrollHeight;
						liveChat.api.addMessagesToBox(this, data.user_id, data.display_name, data.image);
					}

				});

		console.log($($floatingBox).find('textarea').first());

		liveChat.textareaHandler(id, liveChat.settings.current_user_id, $floatingBox, true);

		$($floatingBox).find('.send-message-trigger').first().click(function () {
			liveChat.api.startSendingMessage(jQuery(this).parent());
		});

		liveChat.api.addFloatingBoxToCookie(id, display_name, image);

		liveChat.$body.trigger( "liveChat.floatingChatRendered", [ data ] );
	},
	displayNewMessagesNotification: function () {
		liveChat.api.data.getUnreadMessagesCount().done(function (result) {
			if (parseInt(result) > 0) {
				$.titleAlert((result > 1) ? '(' + result + ') Nuevos mensajes' : '(' + result + ') Nuevo mensaje');
			}
		});
	},
	addFloatingBoxToCookie: function (id, display_name, image) {

		var cookie = liveChat.helpers.getCookie("chatBoxes");
		var newCB = id + "&*&" + display_name + "&*&" + image;
		if (cookie === "" || cookie === " " || cookie === undefined) {
			liveChat.helpers.setCookie("chatBoxes", newCB, 3000000);
		} else {
			var exist = 0;
			var cookies = cookie.split("&**&");
			for (var i = 0; i < cookies.length; i++) {
				var box = cookies[i].split("&*&");
				if (parseInt(box[0]) == id) {
					exist = 1;
					break;
				}
			}
			if (exist == 0) {
				liveChat.helpers.setCookie("chatBoxes", liveChat.helpers.getCookie("chatBoxes") + "&**&" + newCB, 3000000);
			}
		}
	},
	getPreviouslyOpenedFloatingBoxes: function () {
		out = [];
		var cookie = liveChat.helpers.getCookie("chatBoxes");
		if (!cookie || !$.trim(cookie)) {
			return out;
		}
		var cookies = cookie.split("&**&");
		for (var i = 0; i < cookies.length; i++) {
			out.push(cookies[i].split("&*&"));
		}
		return out;
	},
	openPreviouslyOpenedFloatingBoxes: function () {
		console.log('previous floating boxes');
		var queryString = liveChat.helpers.getQueryStringValue('chat_with');
		if (queryString) {
			var boxes = [liveChat.api.getContactFromCache(queryString)];
		} else {
			var boxesArray = liveChat.api.getPreviouslyOpenedFloatingBoxes();
			console.log(boxesArray);
			var boxes = [];
			$.each(boxesArray, function (i, box) {
				boxes.push({
					"id": box[0],
					"display_name": box[1],
					"image": box[2],
				});
			});
		}
		console.log(boxes);

		$.each(boxes, function (i, box) {
			liveChat.api.openFloatingBox( box );
//			liveChat.api.renderFloatingBox(box.id, box.display_name, box.image);
		});

	},
	changeChatBoxPosition: function () {
		var chatBoxes = $(".chatBox");
		for (var i = 0; i < chatBoxes.length; i++) {
//            $(chatBoxes[i]).css("margin-left", liveChat.maxLeft - (i + 1) * 18 + "%");
			var rightPosition = i * liveChat.settings.floatingChatBoxWidth + 10;
			$(chatBoxes[i]).css("right", (liveChat.$body.find("#chatOpen").css("right") === "0px") ? rightPosition : rightPosition + 205 + "px");
		}
		
		liveChat.$body.trigger( "liveChat.floatingBoxesPositionsUpdated", [ chatBoxes ] );
	},
	acceptNewUserConnection: function (userId) {
		liveChat.api.data.isConnectedWith(userId).done(function (result) {
			if (parseInt(result) > 0) {
				liveChat.acceptedConnection(result);

				var data = {
					"my": liveChat.settings.current_user_id,
					"to": result
				}
				liveChat.sockets.emit("okNewCon", data);
				
				liveChat.$body.trigger( "liveChat.newUserConnectionAccepted", [ userId ] );
			}
		});
	},
	searchContacts: function (searchTerm, searchType, isFloatingChat) {
		if (searchType === 'first_letter') {
			var results = liveChat.api.data.searchContactsByFirstLetter(searchTerm, isFloatingChat);
		} else {
			var results = liveChat.api.data.searchContacts(searchTerm, isFloatingChat);
		}
		results.done(function (results) {
			liveChat.api.renderContactsSearchResults(results, isFloatingChat);
		});
	},
	renderContactsSearchResults: function (result, isFloatingChat) {
		console.log(result);
		$(".contacts-list").empty();
		if (result.length < 1) {
			liveChat.api.noUserFound();
		} else {
			liveChat.api.renderContacts(result, liveChat.$body.find(".contacts-list"));

		}
		liveChat.$body.trigger( "liveChat.contactsSearchResultsRendered", [ result ] );
	},
	searchMessages: function (search_term, id, display_name, image) {
		liveChat.helpers.setDateNow();	
			$(".messageBox").off();
		liveChat.api.data.searchMessages(search_term, id, display_name, image).done(function (result) {

			$(".messageBox").empty();		
			
			console.log($(".messageBox").html());
			liveChat.searchMax = 0;
			liveChat.searchNum = 1;
			for (var i = 0; i < result.length; i++) {
				liveChat.searchMax++;
				if (result[i]["user_sender"] == id) {
					liveChat.api.renderMessage($(".messageBox"), display_name, image, result[i]["message"], result[i]["m_time"], id, false, false);
				} else {
					liveChat.api.renderMessage($(".messageBox"), null, null, result[i]["message"], result[i]["m_time"], null, false, false);
				}
			}
			if (liveChat.searchMax > 0) {
				var messageBoxes = $(".messageBox").find(".oneMessage");
				var messageDiv = $(messageBoxes[0]).find("div");
				$(messageDiv[1]).addClass("searchDivYellow");
			}
			var mb = $(".messageBox");
			mb[0].scrollTop = 0;
		});

	},
	addMessagesToBox: function (box, id, display_name, image, autoScroll) {
		liveChat.helpers.setDateNow();
		console.log('adding msgs');	
		console.log(id);
		liveChat.api.data.getMessagesWith(id, true).done(function (result) {
			console.log(id);
			console.log($("#spinnerBox" + id).length);
			if ($("#spinnerBox" + id).length) {
				$("#spinnerBox" + id).remove();
			}
			for (var i = 0; i < result.length; i++) {
				if (result[i]["user_sender"] == id) {
					liveChat.api.renderMessage(box, display_name, image, result[i]["message"], result[i]["m_time"], id, true, false);
				} else {
					liveChat.api.renderMessage(box, null, null, result[i]["message"], result[i]["m_time"], id, true, false);
				}
			}
			console.log('autoscroll');
			if (autoScroll) {
				console.log(box);
				console.log($(box).height());
//				box.scrollTop = box.scrollHeight - liveChat.scrollsHeightBefore[id];
//				box.scrollTop = box.scrollHeight;
				$(box).scrollTop($(box).height());

			}
			
			
		// update page number
			liveChat.pages[id]++;

		});

	},
	stopTittleAlert: function () {
		liveChat.api.data.getUnreadMessagesCount().done(function (result) {
			if (parseInt(result) == 0) {
				$.titleAlert('New message', {
					duration: 1,
					stopOnFocus: false
				});
			}
		});
	},
};
