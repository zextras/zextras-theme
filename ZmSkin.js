/*
 * ***** BEGIN LICENSE BLOCK *****
 * <Zextras Theme is a open source theme for Zimbra>
 * Copyright (C) 2020  Zextras
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
 */

function ZmSkin(hints) {
    this.hints = this.mergeObjects(ZmSkin.hints, hints);

    if(typeof DwtListView != 'undefined') {
        DwtListView.HEADERITEM_HEIGHT = 36;

        // @TODO change these in core files
        // 5px added as padding to make it 35px
        DwtListView.MIN_COLUMN_WIDTH = 30;
        ZmListView.COL_WIDTH_ICON = 30;
        ZmListView.COL_WIDTH_NARROW_ICON = 30;

        DwtListView.HEADERSASH_STYLE = 1;
    }
}


// default hints for all skins
ZmSkin.hints = {
    // info
    name:           "@SkinName@",
    version:        "@SkinVersion@",

    // skin regions
    skin:           { containers: "skin_outer" },
    banner:         { position:"static", url: "@LogoURL@"},     // == "logo"
    userInfo:       { position:"static"},
    search:         { position:"static" },
    quota:          { position:"static" },
    presence:       { width:"40px", height: "24px" },
    appView:        { position:"static" },

    searchResultsToolbar:   { containers: ["skin_tr_search_results_toolbar"] },

    newButton:      { containers: ["skin_td_new_button"] },
    tree:           { minWidth: "@TreeMinWidth@", maxWidth: "@TreeMaxWidth@",
                      containers: ["skin_td_tree","skin_td_tree_app_sash"],
                      resizeContainers : ["skin_td_tree", "skin_td_new_button", "skin_container_app_new_button"]
                    },

    topToolbar:     { containers: "skin_spacing_app_top_toolbar" },

    treeFooter:     { containers: "skin_tr_tree_footer" },

    topAd:          { containers: "skin_tr_top_ad" },
    sidebarAd:      { containers: "skin_td_sidebar_ad" },
    bottomAd:       { containers: "skin_tr_bottom_ad" },
    treeTopAd:      { containers: "skin_tr_tree_top_ad" },
    treeBottomAd:   { containers: "skin_tr_tree_bottom_ad" },

    // specific components
    helpButton:     { style: "link", container: "quota", url: "@HelpAdvancedURL@" },
    logoutButton:   { style: "link", container: "quota" },
    appChooser:     { position:"static", direction: "LR" },
    toast:          { location: "SE",
                      transitions: [
                            { type: "fade-in", step: 5, duration: 50 },
                            { type: "pause", duration: 5000 },
                            { type: "fade-out", step: -10, duration: 500 }
                        ]
                    },
    fullScreen:     { containers : ["!skin_td_tree", "!skin_td_tree_app_sash"] },

    allAds :        { containers: ["skin_tr_top_ad", "skin_td_sidebar_ad", "skin_tr_bottom_ad", "skin_tr_tree_top_ad", "skin_tr_tree_bottom_ad"] },

    hideSearchInCompose:    false,

    notificationBanner:     "@NotificationBanner@",

    socialfox:  {
        iconURL:        "@SocialfoxIconURL@",
        icon32URL:      "@SocialfoxIcon32URL@",
        icon64URL:      "@SocialfoxIcon64URL@",
        mailIconURL:    "@SocialfoxMailIconURL@"
    }

};


// create "BaseSkin" as an alias to ZmSkin (for backwards compatibility)
window.BaseSkin = ZmSkin;


//
//  set up the ZmSkin prototype with methods common to all skins
//
ZmSkin.prototype = {

    //
    // Public methods
    //
    show : function(name, state, noReflow) {
        var containers = this.hints[name] && this.hints[name].containers;
        if (containers) {
            if (typeof containers == "function") {
                containers.apply(this, [state != false]);
                skin._reflowApp();
                return;
            }
            if (typeof containers == "string") {
                containers = [ containers ];
            }
            var changed = false;
            for (var i = 0; i < containers.length; i++) {
                var ocontainer = containers[i];
                var ncontainer = ocontainer.replace(/^!/,"");
                var inverse = ocontainer != ncontainer;
                if (this._showEl(ncontainer, inverse ? !state : state)) {
                    changed = true;
                }
            }
            if (changed && !noReflow) {
                skin._reflowApp();
            }
        }
    },

    hide : function(name, noReflow) {
        this.show(name, false, noReflow);
    },

    gotoApp : function(appId, callback) {
        appCtxt.getAppController().activateApp(appId, null, callback);
    },

    gotoPrefs : function(prefPageId) {
        if (appCtxt.getCurrentAppName() != ZmApp.PREFERENCES) {
            var callback = new AjxCallback(this, this._gotoPrefPage, [prefPageId]);
            this.gotoApp(ZmApp.PREFERENCES, callback);
        }
        else {
            this._gotoPrefPage(prefPageId);
        }
    },

    mergeObjects : function(dest, src1 /*, ..., srcN */) {
        if (dest == null) dest = {};

        // merge all source properties into destination object
        for (var i = 1; i < arguments.length; i++) {
            var src = arguments[i];
            for (var pname in src) {
                // recurse through properties
                var prop = dest[pname];
                if (typeof prop == "object" && !(prop instanceof Array)) {
                    this.mergeObjects(dest[pname], src[pname]);
                    continue;
                }

                // insert missing property
                if (!dest[pname]) {
                    dest[pname] = src[pname];
                }
            }
        }

        return dest;
    },

    getTreeWidth : function() {
        return Dwt.getSize(this._getEl(this.hints.tree.containers[0])).x;
    },

    setTreeWidth : function(width) {
        this._setContainerSizes("tree", width, null);
    },



    showTopAd : function(state) {
        if (skin._showEl("skin_tr_top_ad", state)) {
            skin._reflowApp();
        }
    },
    hideTopAd : function() {
        skin.showTopAd(false);
    },
    getTopAdContainer : function() {
        return skin._getEl("skin_container_top_ad");
    },

    showSidebarAd : function(width) {
        var id = "skin_td_sidebar_ad";
        if (width != null) Dwt.setSize(id, width);
        if (skin._showEl(id)) {
            skin._reflowApp();
        }
    },
    hideSidebarAd : function() {
        var id = "skin_td_sidebar_ad";
        if (skin._hideEl(id)) {
            skin._reflowApp();
        }
    },
    getSidebarAdContainer : function() {
        return this._getEl("skin_container_sidebar_ad");
    },

    handleNotification : function(event, args) {
        /*
            Override me in individual skins
            @param [String] event       The event type, e.g. "onAction", "onSelectApp", "initializeToolbar", ...
                                        basically anything that would get passed into appCtxt.notifyZimlets()
            @param [Array]  args        Array of the arguments that get passed to appCtxt.notifyZimlets()
        */
    },


    //
    // Protected methods
    //

    _getEl : function(id) {
        return (typeof id == "string" ? document.getElementById(id) : id);
    },

    _showEl : function(id, state) {
        var el = this._getEl(id);
        if (!el) return;

        var value;
        if (state == false) {
            value = "none";
        }
        else {
            var tagName = el.tagName;
            if (tagName == "TD")        value = "table-cell";
            else if (tagName == "TR")   value = "table-row";
            else value = "block";
        }
        if (value != el.style.display) {
            el.style.display = value;
            return true;
        }
        else {
            return false;
        }
    },

    _hideEl : function(id) {
        return this._showEl(id, false);
    },

    _reparentEl : function(id, containerId) {
        var containerEl = this._getEl(containerId);
        var el = containerEl && this._getEl(id);
        if (el) {
            containerEl.appendChild(el);
        }
    },

    _setContainerSizes : function(containerName, width, height) {
        var containers = this.hints[containerName].resizeContainers || this.hints[containerName].containers;
        for (var i = 0; i < containers.length; i++) {
            Dwt.setSize(containers[i], width, null);
        }
    },

    _reflowApp : function() {
        if (window._zimbraMail) {
            window._zimbraMail.getAppViewMgr().fitAll();
        }
    },

    _gotoPrefPage : function(pageId) {
        if (pageId == null) { return; }

        var app = appCtxt.getApp(ZmApp.PREFERENCES);
        var controller = app.getPrefController();
        var view = controller.getPrefsView();
        view.selectSection(pageId);
    },

    shortcutFormatter : function(key) {
        return key.toUpperCase()
    }
};


//
//  create an instance as "skin" -- some skins may create another one that overrides this
//
window.skin = new ZmSkin();

if (typeof ZmOrganizer !== 'undefined') {
    ZmOrganizer.COLOR_VALUES[8] = '#747474';

    var uiLoadedPolling = setInterval(function () {
        if (document.querySelector('#CHECK_MAIL')) {
            clearInterval(uiLoadedPolling);
            UiLoaded();
        }
    }, 1000);
    var calLoadingPolling = setInterval(function () {
        if (typeof ZmCalColView !== "undefined") {
            clearInterval(calLoadingPolling);
            CalLoaded();
        }
    }, 1000);
    // var zmDoublePaneViewPolling = setInterval(function () {
    //     if (typeof ZmDoublePaneView !== "undefined") {
    //         clearInterval(zmDoublePaneViewPolling);
    //         ZmDoublePaneViewLoaded();
    //     }
    // }, 1000);

    var svgImages = {
        'Inbox': '<svg viewBox="0 0 24 24" fill="currentColor"><g data-name="Layer 2"><path d="M20.79 11.34l-3.34-6.68A3 3 0 0014.76 3H9.24a3 3 0 00-2.69 1.66l-3.34 6.68a2 2 0 00-.21.9V18a3 3 0 003 3h12a3 3 0 003-3v-5.76a2 2 0 00-.21-.9zM8.34 5.55a1 1 0 01.9-.55h5.52a1 1 0 01.9.55L18.38 11H16a1 1 0 00-1 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2a1 1 0 00-1-1H5.62z"></path></g></svg>',
        'Folder': '<svg viewBox="0 0 24 24" fill="currentColor"><g data-name="Layer 2"><path d="M19.5 20.5h-15A2.47 2.47 0 012 18.07V5.93A2.47 2.47 0 014.5 3.5h4.6a1 1 0 01.77.37l2.6 3.18h7A2.47 2.47 0 0122 9.48v8.59a2.47 2.47 0 01-2.5 2.43z"></path></g></svg>',
        'MailFolder': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M99.84 104.96h-76.8c-6.919.085-12.688-5.523-12.8-12.442V30.362c.112-6.919 5.881-12.527 12.8-12.442h23.552c1.53.01 2.978.706 3.942 1.894l13.312 16.282h35.84c.103-.003.206-.004.309-.004 6.862 0 12.536 5.585 12.645 12.446v43.98c-.112 6.919-5.881 12.527-12.8 12.442zm2.56-52.286L64.473 81.077a5.049 5.049 0 01-6.046.016L20.48 52.801v39.717a2.365 2.365 0 002.56 2.202h76.8a2.365 2.365 0 002.56-2.202V52.674zm-8.361-6.338H61.44a5.123 5.123 0 01-3.942-1.894L44.186 28.16H23.04a2.365 2.365 0 00-2.56 2.202v9.82l40.944 30.554 32.615-24.4z" fill-rule="nonzero" fill="currentColor" /></svg>',
        'SentFolder': '<svg viewBox="0 0 24 24" fill="currentColor"><g><path d="M21 4a1.31 1.31 0 00-.06-.27v-.09a1 1 0 00-.2-.3 1 1 0 00-.29-.19h-.09a.86.86 0 00-.31-.15H20a1 1 0 00-.3 0l-18 6a1 1 0 000 1.9l8.53 2.84 2.84 8.53a1 1 0 001.9 0l6-18A1 1 0 0021 4zm-4.7 2.29l-5.57 5.57L5.16 10zM14 18.84l-1.86-5.57 5.57-5.57z"></path></g></svg>',
        'EmailedContacts': '<svg viewBox="0 0 24 24" fill="currentColor"><g><path d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm-.67 2L12 10.75 5.67 6zM19 18H5a1 1 0 01-1-1V7.25l7.4 5.55a1 1 0 00.6.2 1 1 0 00.6-.2L20 7.25V17a1 1 0 01-1 1z"></path></g></svg>',
        'SharedMailFolder': '<svg viewBox="0 0 123 123" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M99.84 36.096c6.919-.085 12.688 5.523 12.8 12.442v43.98c-.112 6.919-5.881 12.527-12.8 12.442h-76.8c-6.919.085-12.688-5.523-12.8-12.442V30.362c.112-6.919 5.881-12.527 12.8-12.442h23.552c1.53.01 2.978.706 3.942 1.894L61 32.468a15.436 15.436 0 00-5.464 9.575L44.186 28.16H23.04a2.365 2.365 0 00-2.56 2.202v62.054a2.365 2.365 0 002.56 2.202h76.8a2.365 2.365 0 002.56-2.202V48.538a2.365 2.365 0 00-2.56-2.202H86.123c.079-.635.12-1.281.12-1.936 0-3.056-.889-5.905-2.423-8.304h16.02zM61.087 46.688a10.089 10.089 0 01-.187-1.94c0-5.564 4.516-10.08 10.08-10.08 5.563 0 10.08 4.516 10.08 10.08 0 5.563-4.517 10.08-10.08 10.08a10.07 10.07 0 01-3.246-.535l-5.941 5.193a10.174 10.174 0 01-.001 3.89l5.949 5.209a10.063 10.063 0 013.239-.533c5.563 0 10.08 4.517 10.08 10.08 0 5.564-4.517 10.08-10.08 10.08-5.564 0-10.08-4.516-10.08-10.08 0-.666.065-1.317.188-1.948l-5.949-5.209a10.063 10.063 0 01-3.239.532c-5.563 0-10.08-4.517-10.08-10.08s4.517-10.08 10.08-10.08c1.136 0 2.228.188 3.246.535l5.941-5.194z" fill="currentColor" /></svg>',
        'CalendarFolder': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123" fill="currentColor"><path fill="none" d="M0 0h122.88v122.88H0z"></path><path d="M122.88 122.88V0H0v122.88h122.88z" fill="none"></path><path fill="none" d="M0 0h122.88v122.88H0z"></path><path d="M107.52 56.24H15.36v41.04c0 8.426 6.934 15.36 15.36 15.36h61.44c8.426 0 15.36-6.934 15.36-15.36V56.24zm-66.56 30.8c-2.809 0-5.12-2.311-5.12-5.12s2.311-5.12 5.12-5.12 5.12 2.311 5.12 5.12-2.311 5.12-5.12 5.12zm40.96 0H61.44c-2.809 0-5.12-2.311-5.12-5.12s2.311-5.12 5.12-5.12h20.48c2.809 0 5.12 2.311 5.12 5.12s-2.311 5.12-5.12 5.12zM76.8 20.48v-5.12c0-2.809 2.311-5.12 5.12-5.12s5.12 2.311 5.12 5.12v5.12h5.12c8.426 0 15.36 6.934 15.36 15.36V46H15.36V35.84c0-8.426 6.934-15.36 15.36-15.36h5.12v-5.12a5.11 5.11 0 01.302-1.723 5.162 5.162 0 013.514-3.227 5.083 5.083 0 014.873 1.293 5.175 5.175 0 011.31 2.112c.16.498.241 1.021.241 1.545v5.12H76.8z" fill-rule="nonzero"></path></svg>',
        'SharedCalendarFolder': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M107.52 97.28c0 8.426-6.934 15.36-15.36 15.36H30.72c-8.426 0-15.36-6.934-15.36-15.36V35.84c0-8.426 6.934-15.36 15.36-15.36h5.12v-5.12c0-2.809 2.311-5.12 5.12-5.12s5.12 2.311 5.12 5.12v5.12H76.8v-5.12c0-2.809 2.311-5.12 5.12-5.12s5.12 2.311 5.12 5.12v5.12h5.12c8.426 0 15.36 6.934 15.36 15.36v61.44zM61.087 55.568a10.089 10.089 0 01-.187-1.94c0-5.564 4.516-10.08 10.08-10.08 5.563 0 10.08 4.516 10.08 10.08 0 5.563-4.517 10.08-10.08 10.08a10.07 10.07 0 01-3.246-.535l-5.941 5.193a10.174 10.174 0 01-.001 3.89l5.949 5.209a10.063 10.063 0 013.239-.533c5.563 0 10.08 4.517 10.08 10.08 0 5.564-4.517 10.08-10.08 10.08-5.564 0-10.08-4.516-10.08-10.08 0-.666.065-1.317.188-1.948l-5.949-5.209a10.063 10.063 0 01-3.239.532c-5.563 0-10.08-4.517-10.08-10.08s4.517-10.08 10.08-10.08c1.136 0 2.228.188 3.246.535l5.941-5.194z" fill="currentColor" /></svg>',
        'ContactsFolder': '<svg viewBox="0 0 123 123" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="none" d="M0 0h122.88v122.88H0z" /><clipPath id="contacts-folder_svg__a"><path d="M0 0h122.88v122.88H0z" /></clipPath><g clipPath="url(#contacts-folder_svg__a)"><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M99.84 104.96h-76.8c-6.919.085-12.688-5.523-12.8-12.442V30.362c.112-6.919 5.881-12.527 12.8-12.442h23.552c1.53.01 2.978.706 3.942 1.894l13.312 16.282h35.84c.103-.003.206-.004.309-.004 6.862 0 12.536 5.585 12.645 12.446v43.98c-.112 6.919-5.881 12.527-12.8 12.442zM77.952 84.437a1.844 1.844 0 001.835-1.834c-.005-5.03-4.144-9.166-9.174-9.166a9.174 9.174 0 00-5.614 1.919 12.845 12.845 0 00-9.063-3.744c-7.039 0-12.833 5.787-12.843 12.825 0 1.007.829 1.835 1.835 1.835h22.016a1.844 1.844 0 001.835-1.835h9.173zm-7.339-12.842c3.02 0 5.504-2.485 5.504-5.504 0-3.02-2.484-5.504-5.504-5.504-3.019 0-5.504 2.484-5.504 5.504 0 3.019 2.485 5.504 5.504 5.504zm-14.677-3.67c4.026 0 7.339-3.312 7.339-7.338s-3.313-7.339-7.339-7.339-7.339 3.313-7.339 7.339 3.313 7.338 7.339 7.338z" fillRule="nonzero" fill="currentColor" /></g></svg>',
        'SharedContactsFolder': '<svg viewBox="0 0 123 123" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M99.84 36.096c6.919-.085 12.688 5.523 12.8 12.442v43.98c-.112 6.919-5.881 12.527-12.8 12.442h-76.8c-6.919.085-12.688-5.523-12.8-12.442V30.362c.112-6.919 5.881-12.527 12.8-12.442h23.552c1.53.01 2.978.706 3.942 1.894L61 32.468a15.436 15.436 0 00-5.464 9.575L44.186 28.16H23.04a2.365 2.365 0 00-2.56 2.202v62.054a2.365 2.365 0 002.56 2.202h76.8a2.365 2.365 0 002.56-2.202V48.538a2.365 2.365 0 00-2.56-2.202H86.123c.079-.635.12-1.281.12-1.936 0-3.056-.889-5.905-2.423-8.304h16.02zM61.087 46.688a10.089 10.089 0 01-.187-1.94c0-5.564 4.516-10.08 10.08-10.08 5.563 0 10.08 4.516 10.08 10.08 0 5.563-4.517 10.08-10.08 10.08a10.07 10.07 0 01-3.246-.535l-5.941 5.193a10.174 10.174 0 01-.001 3.89l5.949 5.209a10.063 10.063 0 013.239-.533c5.563 0 10.08 4.517 10.08 10.08 0 5.564-4.517 10.08-10.08 10.08-5.564 0-10.08-4.516-10.08-10.08 0-.666.065-1.317.188-1.948l-5.949-5.209a10.063 10.063 0 01-3.239.532c-5.563 0-10.08-4.517-10.08-10.08s4.517-10.08 10.08-10.08c1.136 0 2.228.188 3.246.535l5.941-5.194z" fill="currentColor" /></svg>',
        'TaskList': '<svg viewBox="0 0 24 24" fill="currentColor"><g><g><path d="M18 3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3zm1 15a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h12a1 1 0 011 1z"></path><path d="M14.7 8.39l-3.78 5-1.63-2.11a1 1 0 00-1.58 1.23l2.43 3.11a1 1 0 00.79.38 1 1 0 00.79-.39l4.57-6a1 1 0 10-1.6-1.22z"></path></g></g></svg>',
        'SharedTaskList': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M92.16 107.52H30.72c-8.426 0-15.36-6.934-15.36-15.36V30.72c0-8.426 6.934-15.36 15.36-15.36h61.44c8.426 0 15.36 6.934 15.36 15.36v61.44c0 8.426-6.934 15.36-15.36 15.36zM30.72 25.6c-2.809 0-5.12 2.311-5.12 5.12v61.44c0 2.809 2.311 5.12 5.12 5.12h61.44c2.809 0 5.12-2.311 5.12-5.12V30.72c0-2.809-2.311-5.12-5.12-5.12H30.72zm30.367 21.088a10.089 10.089 0 01-.187-1.94c0-5.564 4.516-10.08 10.08-10.08 5.563 0 10.08 4.516 10.08 10.08 0 5.563-4.517 10.08-10.08 10.08a10.07 10.07 0 01-3.246-.535l-5.941 5.193a10.174 10.174 0 01-.001 3.89l5.949 5.209a10.063 10.063 0 013.239-.533c5.563 0 10.08 4.517 10.08 10.08 0 5.564-4.517 10.08-10.08 10.08-5.564 0-10.08-4.516-10.08-10.08 0-.666.065-1.317.188-1.948l-5.949-5.209a10.063 10.063 0 01-3.239.532c-5.563 0-10.08-4.517-10.08-10.08s4.517-10.08 10.08-10.08c1.136 0 2.228.188 3.246.535l5.941-5.194z" fill-rule="nonzero" fill="currentColor" /></svg>',
        'Tag': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123" fill="currentColor"><path fill="none" d="M0 0h122.88v122.88H0z"></path><path d="M74.895 16.453c-.37 0-.732.032-1.085.092a8.843 8.843 0 00-6.047 2.595L19.051 67.851c-3.464 3.464-3.464 9.088 0 12.552l23.426 23.426c3.464 3.464 9.088 3.464 12.552 0l48.711-48.712a8.843 8.843 0 002.595-6.047c.06-.353.092-.715.092-1.085V22.883a6.434 6.434 0 00-6.43-6.43H74.895zm9.501 16.991a5.043 5.043 0 00-5.04 5.04 5.043 5.043 0 005.04 5.04 5.043 5.043 0 005.04-5.04 5.042 5.042 0 00-5.04-5.04z"></path></svg>',
        'RSS': '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 123 123"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M92.16 107.52H30.72c-8.426 0-15.36-6.934-15.36-15.36V30.72c0-8.426 6.934-15.36 15.36-15.36h61.44c8.426 0 15.36 6.934 15.36 15.36v61.44c0 8.426-6.934 15.36-15.36 15.36zM30.72 25.6c-2.809 0-5.12 2.311-5.12 5.12v61.44c0 2.809 2.311 5.12 5.12 5.12h61.44c2.809 0 5.12-2.311 5.12-5.12V30.72c0-2.809-2.311-5.12-5.12-5.12H30.72z" fill-rule="nonzero" fill="currentColor" /><path d="M40.149 33.671a5.187 5.187 0 00-4.453 5.12c0 2.836 2.333 5.169 5.17 5.169a5.2 5.2 0 00.716-.049 30.737 30.737 0 0126.061 8.755 30.758 30.758 0 017.834 30.464 5.101 5.101 0 00-.234 1.527 5.133 5.133 0 003.715 4.924c.475.075.959.075 1.434 0a5.135 5.135 0 005.12-3.686 40.969 40.969 0 001.704-11.692c0-22.47-18.49-40.96-40.96-40.96-1.975 0-3.948.143-5.902.428h-.205zm0 20.07a23.192 23.192 0 013.225-.226c12.696 0 23.143 10.447 23.143 23.142 0 3.406-.752 6.77-2.202 9.852a5.128 5.128 0 01-4.659 2.97 5.448 5.448 0 01-2.15-.461c-2.542-1.194-3.651-4.268-2.458-6.81a12.927 12.927 0 00-2.611-14.541 12.76 12.76 0 00-10.855-3.686c-2.765.427-5.394-1.487-5.836-4.25a5.05 5.05 0 01-.082-.91 5.139 5.139 0 014.485-5.08zm.717 20.48c2.825 0 5.12 2.294 5.12 5.12s-2.295 5.12-5.12 5.12c-2.826 0-5.12-2.294-5.12-5.12s2.294-5.12 5.12-5.12z" fill-rule="nonzero" fill="currentColor" /></svg>',
        'SearchFolder': '<svg viewBox="0 0 123 123" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path fill="none" d="M0 0h122.88v122.88H0z" /><path fill="none" d="M0 0h122.88v122.88H0z" /><path d="M99.84 104.96h-76.8c-7.168 0-12.8-5.632-12.8-12.288V30.208c0-7.168 5.632-12.288 12.8-12.288h23.552c1.536 0 3.072.512 4.096 2.048L64 36.352h35.84c7.168 0 12.8 5.12 12.8 12.288v44.032c0 6.656-5.632 12.288-12.8 12.288zM65.657 80.763a15.288 15.288 0 01-6.742 1.557c-8.477 0-15.36-6.883-15.36-15.36s6.883-15.36 15.36-15.36c8.478 0 15.36 6.883 15.36 15.36 0 2.375-.54 4.626-1.504 6.634l5.075 5.075a5.052 5.052 0 010 7.142 5.051 5.051 0 01-7.141 0l-5.048-5.048zM58.915 61.87c2.81 0 5.09 2.281 5.09 5.09 0 2.809-2.28 5.09-5.09 5.09a5.092 5.092 0 01-5.089-5.09c0-2.809 2.28-5.09 5.089-5.09z" fill="currentColor" /></svg>'
    };

    var refGetImageHtml = AjxImg.getImageHtml;
    AjxImg.getImageHtml = function () {
        var imgDef;
        if (typeof arguments[0] === 'object' && arguments[0] !== null) {
            imgDef = arguments[0].imageName.split(',');
        } else if (typeof arguments[0] === 'string') {
            imgDef = arguments[0].split(',');
        }
        if (imgDef && imgDef.length === 2) {
            var imgName = imgDef[0];
            var imgColor = imgDef[1].replace('color=', '');
            if (imgName && svgImages[imgName]) {
                return getSvgImage(imgName, imgColor);
            }
        }
        return refGetImageHtml.apply(this, arguments);
    };

    Dwt.createLinearGradientCss = function (to, from, direction) {
        var css = '';
        var bgColor = AjxColor.lighten(from, 0.5);
        css += 'background-color:';
        css += bgColor + ';';
        return css;
    };

    ZmListView.prototype._getEventTarget = function (a) {
        var b = a && a.target;
        var closestSvg = b.closest(".sni-svg");
        if (b && closestSvg) {
            return closestSvg.parentNode;
        }
        if (b && (b.nodeName === "IMG" || (b.className && b.className.match(/\bImg/)))) {
            return b.parentNode
        }
        return b;
    };

    function UiLoaded() {
        document.querySelector('#CHECK_MAIL').addEventListener('click', function (e) {
            var target = this;
            target.classList.add("refreshing");
            setTimeout(function () {
                target.classList.remove("refreshing");
            }, 3000);
        });

        /* Hide sidebar resizer in Apps without sidebar */
        var styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerText = '#z_sash[style*="left: 0px; top: 0px; width: 0px; height: 0px;"]{ left: -10px !important; top: -10px !important;; }';
        document.getElementsByTagName("head")[0].appendChild(styleElement);

        /* Show/hide search bar */
        document.querySelector('#skin_spacing_search .search-trigger').addEventListener('click', function (e) {
            document.activeElement.blur();
            this.parentElement.classList.add('active');
            var searchInput = this.parentElement.querySelector('.search_input');
            if (searchInput) {
                searchInput.addEventListener('focus', function(e) {
                    //fix zimbra bug
                    if (typeof this.value !== 'undefined') {
                        if (this.value !== '' &&  !/(.*)\s+$/.test(this.value) ) {
                            this.value += ' ';
                        }
                    }
                });

                searchInput.focus();
                setTimeout(function() {
                    searchInput.click();
                }, 1);
            }
        });
        document.querySelector('#skin_spacing_search .search-close').addEventListener('click', function (e) {
            this.parentElement.parentElement.classList.remove('active');
            document.activeElement.blur();
        });
        ZmInviteMsgView.prototype.updatePtstMsg = function(ptst) {
            var ptstMsgBannerDiv = document.getElementById(this._ptstMsgBannerId);
            if (!ptstMsgBannerDiv) {
                return;
            }
            ptstMsgBannerDiv.className = ZmInviteMsgView.PTST_MSG[ptst].className;
            ptstMsgBannerDiv.style.display = "block"; // since it might be display none if there's no message to begin with (this is the first time ptst is set by buttons)

            var ptstMsgElement = document.getElementById(this._ptstMsgId);
            if (ptstMsgElement) {
                ptstMsgElement.innerHTML = ZmInviteMsgView.PTST_MSG[ptst].msg;
            }

            var ptstIconImg = document.getElementById(this._ptstMsgIconId);
            if (ptstIconImg) {
                var icon = ZmCalItem.getParticipationStatusIcon(ptst);
                ptstIconImg.innerHTML = AjxImg.getImageHtml(icon);
            }
        };
    }

    function CalLoaded() {
        ZmCalColView._OPACITY_APPT_TENTATIVE = 70;
    }

     // function ZmDoublePaneViewLoaded() {
     //     ZmDoublePaneView.prototype.setBounds = function (c, e, d, b) {
     //         DwtComposite.prototype.setBounds.call(this, c, e, d, b);
     //          this._resetSize(d,b)
     //     };
     // }

    function getSvgImage(icon, color) {
        return '<div class="sni-svg" data-name="sni-svg" style="color: ' + (ZmOrganizer.COLOR_VALUES[color] || (color !== '0' ? color : '#747474')) + '">' + svgImages[icon] + '</div>';
    }
}
