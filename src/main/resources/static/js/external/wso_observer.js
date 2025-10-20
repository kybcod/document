//##############################################################################
//
//          wso_observer.js
//
//                                          BridgeW Observer
//                                          for CTIBridge 3.7x
//                                          Edit by Lee eon woo
//
//                                          Hansol Inticube Co., Ltd.
//                                          All rights reserved.
//
//##############################################################################


//==============================================================================
//  wso_observer
//==============================================================================
function wso_observer(target)
{
    this._listeners = {};
    this.target = target;
}


//==============================================================================
//  wso_observer
//==============================================================================
wso_observer.prototype = {
    constructor: wso_observer,

    add_event:
        function (type, listener) {
            if (typeof this._listeners[type] === "undefined") {
                //WS_LOG("[wso_observer] add_event, type=[" + type + "]");
                this._listeners[type] = listener;
            }
        },

    remove_event:
        function (type) {
            if (typeof this._listeners[type] === 'function') {
                //WS_LOG("[wso_observer] remove_event, type=[" + type + "]");
                this._listeners[type] = undefined;
            }
        },

    fire_event:
        function (event, data) {
            if (typeof event === "string") {
                event = { type: event };
                //WS_LOG("[wso_observer] fire_event, type=[" + event.type + "]");
            }
            if (typeof this._listeners[event.type] === 'function') {
                this._listeners[event.type].call(this.target, data);
                this._listeners[event.type] = undefined;
            }
        }
};