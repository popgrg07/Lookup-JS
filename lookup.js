var lookupConfig = {
 searchOnQueryLength: 3,
 width: 163,
 lookUpRef: 'data-lookup-id',
 lookUpClass: 'lookup-lists',
 lookUpListClass: 'selectedLookUp'
};


var origin=null;
var lookUpId = 0;
var lookUpCallback = null;

// initializaion
$(document).off('focusin click', '*[data-lookup]').on('focusin click', '*[data-lookup]', function(e) {
 lookUpCallback = $(this).attr('data-lookup-callback') || null;

 if($(this).val().length) {
 return $(this).trigger('keyup');
 }

 e.preventDefault();
 var self = $(this),
 lookup_url = self.attr('data-lookup'),
 lookup_code = self.attr('data-lookup-code') ? self.attr('data-lookup-code') : null,
 lookup_update = self.attr('data-lookup-update') ? self.attr('data-lookup-update') : null;

 origin=self;
 // Increment Lookup id
 lookUpId++;
 // Lookup Ajax Request
 var ajaxOptions = {
 cancelPrevious: true,
 url: lookup_url
 };

 $('.' + lookupConfig.lookUpClass).remove();
 showLoader(self);

 ajaxRequest(ajaxOptions, function(response) {
 if(self.is(':focus') && response && response.data) {
 self.attr(lookupConfig.lookUpRef, lookUpId);
 $('.lookupParent').removeClass('lookupParent');
 $('.' + lookupConfig.lookUpClass).remove();

 self.addClass('lookupParent');
 self.after(getLookUpDom(response, false));

 $('*[' + lookupConfig.lookUpRef + '=' + lookUpId + '][class=' + lookupConfig.lookUpClass + ']').width(self.outerWidth());
 } else {
 $('.lookup-lists').remove();
 }
 });
});


// Search on Lookup
$(document).off('keyup', '*[data-lookup]').on('keyup', '*[data-lookup]', function (e) {

 if (e.which == 37 || e.which == 38 || e.which == 39 || e.which == 40 || e.which == 13) {
 return;
 }

 var self = $(this),
 lookup_url = self.attr('data-lookup') + '/' + self.val(),
 lookup_code = self.attr('data-lookup-code') ? self.attr('data-lookup-code') : null,
 lookup_update = self.attr('data-lookup-update') ? self.attr('data-lookup-update') : null;


 /**
 * If it is mouse event
 */
 if(typeof e.which == 'undefined')
 lookup_url = self.attr('data-lookup');

 /**
 * If Query Exist Process Search
 */
 if(self.val().length) {

 // Increment Lookup id
 lookUpId++;

 // Lookup Ajax Request
 var ajaxOptions = {
 cancelPrevious: true,
 url: lookup_url,
 };

 $('.' + lookupConfig.lookUpClass).remove();
 showLoader(self);

 ajaxRequest(ajaxOptions, function(response) {
 if(self.is(':focus') && response && response.data) {
 self.attr(lookupConfig.lookUpRef, lookUpId);
 $('.lookupParent').removeClass('lookupParent');
 $('.' + lookupConfig.lookUpClass).remove();
 self.addClass('lookupParent');
 self.after(getLookUpDom(response, false));
 $('*[' + lookupConfig.lookUpRef + '=' + lookUpId + '][class=' + lookupConfig.lookUpClass + ']').width(self.outerWidth());

 initCallback();
 } else {
 $('.lookup-lists').remove();
 }
 });

 } else {
 self.trigger('click');
 }
});



/**
 * Up Down Key Event
 */
var select_list = 0;
$(document).off('keydown', '*[data-lookup]').on('keydown', '*[data-lookup]', function(e) {

 if (e.which && (e.which == 38 || e.which == 40)) {
 var self = $(this),
 lookUpId = self.attr(lookupConfig.lookUpRef) ? self.attr(lookupConfig.lookUpRef) : null;

 if (lookUpId) {
 var parentList = $('*[' + lookupConfig.lookUpRef + '=' + lookUpId + '][class=' + lookupConfig.lookUpClass + ']'),
 listLength = parentList.find('li').length;

 if (listLength && (select_list <= listLength)) {

 // 38 : up
 // 40 : down
 switch (e.which) {
 case 38:
 if (select_list == 0) {
 select_list++;
 }
 if (select_list && select_list > 1) {
 select_list--;
 }
 break;
 case 40:
 if (select_list == listLength) {
 select_list = 0;
 }
 select_list++;
 break;
 default:
 break;
 }

 parentList.find('li').removeClass(lookupConfig.lookUpListClass);
 parentList.find('li:nth-child(' + select_list + ')').addClass(lookupConfig.lookUpListClass);

 } else {
 select_list = 0;
 }
 }
 }
});

// Lookup Click Event
$(document).off('click', '.' + lookupConfig.lookUpClass + ' > ul > li').on('click', '.' + lookupConfig.lookUpClass + ' > ul > li', function(e) {
 e.preventDefault();
 var self = $(this),
 lookUpId = self.closest('.' + lookupConfig.lookUpClass).attr('data-lookup-id'),
 value = self.text();

 if(value.length) {
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').val(value);
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').attr('data-value', self.attr('data-id'));
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').attr("data-ref",lookUpId);
 }
 initCallback(self.attr('data-id'));
 destroyLookUp(lookUpId);
});

// Lookup List Event
$(document).off('keyup', '.' + lookupConfig.lookUpClass + ' > ul > li').on('keyup', '.' + lookupConfig.lookUpClass + ' > ul > li', function(e) {

 e.preventDefault();
 // Event : 13
 if (e.which == 13) {
 var self = $(this),
 lookUpId = self.closest('.' + lookupConfig.lookUpClass).attr('data-lookup-id'),
 value = self.text();

 if(value.length) {
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').val(value);
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').attr('data-value', self.attr('data-id'));
 }
 initCallback(self.attr('data-id'));
 destroyLookUp(lookUpId);
 }
});

/**
 * Enter| event on lookup list
 */
$(document).off('keypress keydown', '.lookupParent').on('keypress keydown', '.lookupParent', function(e) {
 var self = $(this);
 var code = e.keyCode || e.which;

 if (code == 13 || code == 9) {
 e.stopPropagation();
 e.stopImmediatePropagation();

 var lookUpId = self.attr(lookupConfig.lookUpRef);

 var selectedList = $('.' + lookupConfig.lookUpClass + '[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').find('.' + lookupConfig.lookUpListClass);
 if(code == 9) {
 selectedList = $('.' + lookupConfig.lookUpClass + '[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').find('ul > li:first-child');
 }

 var value = selectedList.text();
 if(value.length){
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').val(value);
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').attr('data-value', self.attr('data-id'));
 }
 initCallback(selectedList.attr('data-id'));
 destroyLookUp(lookUpId);
 }
});

/**
 * Destroy Lookup modal if clicked except lookup input, not found message and lists
 */
$('body').on('click', function(e){

 if(e.target.nodeName == "LI" && e.target.className.indexOf('lookup-list-items') !== -1) {
 return;
 }

 if(!(e.target.nodeName == "INPUT" && e.target.className.indexOf('lookupParent') !== -1) ||
 !(e.target.nodeName == "SPAN" && e.target.parentNode.className.indexOf('lookup-lists') !== -1)) {

 $('*.lookupParent[' + lookupConfig.lookUpRef +']').removeClass('lookupParent').removeAttr(lookupConfig.lookUpRef);
 $('.' + lookupConfig.lookUpClass + '[' + lookupConfig.lookUpRef +']').remove();
 }
});

/**
 * Show Loader before load
 */
function showLoader(self) {
 self.after('<div class="' + lookupConfig.lookUpClass + ' has-loader"' + lookupConfig.lookUpRef + '="' + lookUpId + '">\
                                        <div class="m-loader m-loader--brand"></div></div>');
}

/**
 * Prepare list item dom for lookup
 */
function getLookUpDom(response, showInitialNotFound) {
 var lookUpDom = '';

 if (response && response.data && response.data.length) {
 lookUpDom += ' <div class="' + lookupConfig.lookUpClass + '"' + lookupConfig.lookUpRef + '="' + lookUpId + '"> <ul>';
 $.each(response.data, function(index, val) {
 // let has_lookup = val.has_lookup == 1 ? true : false;
 // let value_id = Number.isInteger(val.id) ? val.id : (val.id).toLowerCase().replace(' ', '_');
 lookUpDom += '<li data-id='+val.id+' class="lookup-list-items">' + val.value + '</li>';
 });
 lookUpDom += '</ul></div>';
 } else {
 if(showInitialNotFound) {
 lookUpDom += ' <div class="' + lookupConfig.lookUpClass + ' has-loader"' + lookupConfig.lookUpRef + '="' + lookUpId + '">';
 lookUpDom += '<span class="m--font-danger"><i class="la la-warning"></i> Result Not Found</span>';
 lookUpDom += '</div>';
 }
 }
 return lookUpDom;
}

/**
 * Initialize callback after list item select
 */
function initCallback(lookUpDataId) {
 // alert(lookUpCallback);
 if(lookUpCallback && window[lookUpCallback]) {
 return (lookUpDataId) ? window[lookUpCallback](lookUpDataId,origin) : window[lookUpCallback]();
 }
}


/**
 * Destroy Lookup
 */
function destroyLookUp(lookUpId) {
 $('*.lookupParent[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').removeClass('lookupParent').removeAttr(lookupConfig.lookUpRef);
 $('.' + lookupConfig.lookUpClass + '[' + lookupConfig.lookUpRef + '=' + lookUpId + ']').remove();
}
