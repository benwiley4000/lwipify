"use strict";

const isRemote = require("url-remote")
    , path = require('path')
    , lwip = require("lwip2")
    , request = require("tinyreq")
    , noop = require("noop6")
    ;

/**
 * lwipify
 * Converts the image (located at given path/url or the image buffer) into a lwip
 *
 * @name lwipify
 * @function
 * @param {String|Buffer} source The image path/url or the a `Buffer` object.
 * @param {Object} options An object containing the following fields:
 *
 *  - `image_type` (String): An optional field representing the image type (default: taken from the url/path).
 *  - `lwip` (Object): The `lwip` module object. By default it uses
 *    [`lwip2`](https://github.com/IonicaBizau/lwip2) which doesn't
 *    compile the `lwip` library if GraphicsMagick is available.
 *
 * @param {Function} callback The callback function.
 */
module.exports = function lwipify (source, options, callback) {

    if (typeof options === "function") {
        callback = options;
        options = {
            image_type: undefined
        };
    }

    callback = callback || noop;
    options = options || {};
    options.source = source;

    // Online images
    if (isRemote(source)) {
        request({
            url: source
          , encoding: null
        }, (err, body) => {
            if (err) { return callback(err, null, options); }
            debugger
            options.image_type = path.extname(source).substring(1);
            lwipify(body, options, callback);
        });
        return;
    }

    if (source && source.__lwip) {
        return callback(null, source, options);
    }

    // Convert the buffer/file into image
    let args = [source];
    options.image_type && args.push(options.image_type);
    args.push((err, data) => {
        callback(err, data, options);
    });

    let _lwip = options.lwip || lwip;

    try {
        _lwip.open.apply(_lwip, args);
    } catch (err) {
        callback(err, null, options);
    }
};
