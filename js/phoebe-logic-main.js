(function() {
// f has signature f(val, callback)
function promisify(f) {
    return function(val) {
        return new Promise(function(resolve, reject) {
           f(val, function (data) {
               resolve(data);
           });
        });
    };
}

var get = promisify($.get);
var getJSON = promisify($.getJSON);

function animationEnd(elem) {
    return new Promise(function(resolve, reject) {
        elem.addEventListener('animationend', resolve);
        elem.addEventListener('webkitAnimationEnd', resolve); 
    });
}

var menu_table = new Array(5);
for( var i = 0; i < 5; i++) menu_table[i] = new Array(5);

menu_table[0][0] = null;
menu_table[0][1] = 'A2';
menu_table[0][2] = 'A3:B1';
menu_table[0][3] = 'B2';
menu_table[1][0] = 'A1:F3';
menu_table[1][1] = 'A';
menu_table[1][2] = 'B';
menu_table[1][3] = 'B3:C1';
menu_table[2][0] = 'F2';
menu_table[2][1] = 'F';
menu_table[2][2] = 'G';
menu_table[2][3] = 'C';
menu_table[2][4] = 'C2';
menu_table[3][0] = 'E3:F1';
menu_table[3][1] = 'E';
menu_table[3][2] = 'D';
menu_table[3][3] = 'C3:D1';
menu_table[4][0] = null;
menu_table[4][1] = 'E2';
menu_table[4][2] = 'D3:E1';
menu_table[4][3] = 'D2';

var menu_item = new Array(20);
menu_item['A1'] = 'Продажа';

var selectedMenu = null;
var selectedMainMenu = null;

/*
    Load info section at startup
*/
$(document).ready(function() {
    loadMenuContent('g');
});

/*
    Selection of menu item
    After execution selectedMainMenu contains main menu letter, selectedMenu contains submenu letters
*/
$('.menu-item').click( function () {
	// Get menu type description from array
	var menuValue = menu_table[$(this.parentElement).prevAll().length][$(this).prevAll().length];

	if(menuValue) {
		// Current selected menu value for menu
		selectedMenu = menuValue;

		// Check if Main menu was clicked (only one letter)
		if(menuValue.length == 1){
			selectedMainMenu = menuValue; 
			for(var i = 0; i <= 4; i++) 
				for(var j = 0; j <= 4; j++){
					var menu_item = menu_table[i][j];
					if( menu_item && menu_item.length > 1){
					  if(menu_item.indexOf(selectedMenu) >= 0){
					  	showMenuItem(i, j, selectedMenu); 
					  	var item = $("#menu-container .hexagon-row")[i].children[j];
					  	var selMenu =  menu_item.substr(menu_item.indexOf(selectedMainMenu), 2);

                        selMenu = selMenu.toLowerCase();
					  }
					  else 
					  	hideMenuItem(i, j);
					}
				}
		}	else selectedMenu = selectedMenu.substr(selectedMenu.indexOf(selectedMainMenu), 2);

        loadMenuContent(selectedMenu.toLowerCase());
	}
});

/* 
    Load menu content to #info-section and chenge color of #info-title
    params: 
        menu - menu designation
*/
function loadMenuContent(menu) {
    var infoSection = $('#info-section')[0];
    var preloaderHtml = '<div class="sk-spinner sk-spinner-three-bounce"> \
                            <div class="sk-bounce1"></div> \
                            <div class="sk-bounce2"></div> \
                            <div class="sk-bounce3"></div> \
                         </div>';

    function insertHtml(ajaxData){
        $('#info-section').html(ajaxData).ready(function() { 
            var menuColor = $('.hexagon.menu-' + menu[0]).css('fill');
            $('#info-title').css('background-color', menuColor); 
            $('#info-description').css('background-color', menuColor); 
            $('#info-section').css('animation-name', 'info-show');
        });
    }
    
    function showPreloader() {
        $('#info-section').html(preloaderHtml);
        infoSection.removeEventListener('animationend', showPreloader);
        infoSection.removeEventListener('webkitAnimationEnd', showPreloader);
        $('#info-section').css('animation-name', '');
        return infoSection;
    }

    $('#info-section').css('animation-name', 'info-hide');

    pHide = animationEnd(infoSection).then(showPreloader);

    pData = getJSON('content/menu/menu-' + menu + '.json')
    .then(function(data) {
        return get(data.content);
    });
    
    Promise.all([pHide,pData]).then(function(vals) {
        insertHtml(vals[1]);
    });
}

/*
	Makes Raw Cal item hide or show
*/
function hideMenuItem (raw, col){
	var item = $("#menu-container .hexagon-row")[raw].children[col];
	$(item).addClass("transparent");
}

/*
	Makes raw,col hexmenu visible
*/
function showMenuItem (raw, col, menuItem){
	var item = $("#menu-container .hexagon-row")[raw].children[col];

	item.style.animationName =       "show";
	item.style.webkitAnimationName = "show";
	item.addEventListener('animationend',       function(){ this.style.animationName = ''; },       false);
	item.addEventListener('webkitAnimationEnd', function(){ this.style.webkitAnimationName = ''; }, false);

    var anim = item.querySelectorAll('.anim');
        for (var i=0; i < anim.length; i++)
            anim[i].beginElement();

	//Set class for selected hexmenu item
    'abcdefg'.split('').forEach(function(letter) {
        $(item).removeClass("menu-"+letter); 
    });
	$(item).addClass("menu-"+menuItem.toLowerCase());
	$(item).removeClass("transparent"); 

	// Selcet active hexmenu inner text and then hide or show accordingly
	var items = item.id.substr(-4);
	if(items.length > 3) {
		var menu1 = items.substr(0,2);
		var menu2 = items.substr(2);
		var menuTextId1 = 'menu-item-text-' + menu1;	
		var menuTextId2 = 'menu-item-text-' + menu2;	

		if(menu1.indexOf(menuItem.toLowerCase()) >= 0){
			$('#' + menuTextId1).css({display:'block'});
			$('#' + menuTextId2).css({display:'none'});
		}else{
			$('#' + menuTextId1).css({display:'none'});
			$('#' + menuTextId2).css({display:'block'});
		}

	}
}

/*
    Set up creeping line at the bottom
*/
$(function(){
    var hours = (new Date()).getHours();
    var greeting = "";
    var farewell = "";
    switch (true) {
        case hours > 23 && hours < 5:
            greeting = "Доброй ночи!";
            farewell = "Доброй ночи";
            break;
        case hours >= 5 && hours < 10:
            greeting = "Доброе утро!";
            farewell = "Хорошего дня!";
            break;
        case hours >= 10 && hours < 18: 
            greeting = "Добрый день!";
            farewell = "Хорошего дня!";
            break;
        case hours >= 18 && hours < 23:
            greeting = "Добрый вечер!";
            farewell = "Хорошего вечера!";
            break;
            
    }

    function hide_typed_string() {
        window.setTimeout(function(){
                $('#typing-line').css('animation-name', 'typing-line-hide');
            }, 
            5000);
    }

    function show_typed_string() {
        $('#typing-line').css('animation-name', 'typing-line-show');

        $("#typing-line span").typed({
            strings: [greeting, 
                      "Рады видеть Вас на сайте компании ФибиЛоджик.", 
                      "Надеемся Вы найдёте здесь что-нибудь интересное.", 
                      "Будем рады ответить на любые Ваши вопросы!",
                      farewell],
            startDelay: 2000,
            typeSpeed: 30,
            backDelay: 1000,
            callback: hide_typed_string 
        });
    }

    window.setTimeout(show_typed_string, 3000);
});

/*
    Set up menu arrows animation
*/
(function() {
    var arrows = document.querySelectorAll("#arrows > path");

    function removeAnimationName() {
        for (var i = 0; i < arrows.length; i++) {
            arrows[i].style.animationName = "";
            arrows[i].style.webkitAnimationName = "";
        }
    }

    function addAnimationNameDelayed() {
        window.setTimeout(function() {
            for (var i = 0; i < arrows.length; i++) {
                arrows[i].style.animationName = "arrows-blink";
                arrows[i].style.webkitAnimationName = "arrows-blink";
            }
        }, 100);
    }

    window.setInterval(function() {
        removeAnimationName();
        addAnimationNameDelayed();
    }, 15000);
    
})();
})(); //whole file wrapper
