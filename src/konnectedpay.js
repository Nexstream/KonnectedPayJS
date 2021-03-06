/*** @license
 * Copyright 2016 Nexstream Sdn Bhd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
***/


"use strict"

window.KonnectedPay = window.KonnectedPay || {}
;(function () { // file-local scope...

// Config ----------------------------------------------------------------------

var SERVER = "https://pay.appxtream.com"


// Helpers ---------------------------------------------------------------------

var validateConfig = function (config)
{
    var required = function (name)
    {
        if(config[name] == null) throw new Error(name+" is required!")
    }

    var numeric = function (name)
    {
        // Note: numbers which have exponents after .toString() are also invalid
        if(!/^[0-9]+(\.?[0-9]+)$/.test(config[name])) {
            throw new Error(name+" must be a valid number!")
        }
    }

    required("merchantId")
    required("clientSecret")
    required("amount")
    required("transId")
    required("currencyCode")
    required("fullName")
    required("email")
    required("userId")

    numeric("amount")
}

var keyValStr2Object = function (s)
{
    var pairs = s.split("&")
    var values = {}
    for(var i=0; i<pairs.length; i++) {
        var keyVal = pairs[i].split("=")
        var key = decodeURIComponent(keyVal[0])
        if(keyVal.length > 1) values[key] = decodeURIComponent(keyVal[1])
        else values[key] = true
    }
    return values
}

var getParams = function ()
{
    var getMatches = location.href.match(/^[^?]+\?([^#]+)/)
    if(!getMatches) return {}
    else return keyValStr2Object(getMatches[1])
}

var hashParams = function ()
{
    var hash = location.hash
    if(!hash) return {}
    else return keyValStr2Object(hash.substr(1))
}

// Public API ------------------------------------------------------------------

KonnectedPay.VERSION = "1.2.0"

KonnectedPay.requestPayment = function (config, blank)
{
    validateConfig(config)

    var amount = config.amount
    if(typeof amount == "string") amount = parseFloat(amount)

    var url = "https://pay.appxtream.com/payment"
            + "?tranId="+encodeURIComponent(config.transId)
            + "&amount="+encodeURIComponent(amount.toFixed(2))
            + "&currencyCode="+encodeURIComponent(config.currencyCode)
            + "&merchantId="+encodeURIComponent(config.merchantId)
            + "&device="+encodeURIComponent(navigator.userAgent)
            + "&os=browser"
            + "&fullname="+encodeURIComponent(config.fullName)
            + "&email="+encodeURIComponent(config.email)
            + "&userId="+encodeURIComponent(config.userId)

    if(config.rememberCard != null) {
        url += "&rememberCard=" + (config.rememberCard ? "true" : "false")
    }
    if(config.returnUrl != null) {
        url += "&return="+encodeURIComponent(config.returnUrl)
    }
    if(config.responseMethod != null) {
        url += "&returnMethod="+encodeURIComponent(config.responseMethod)
    }
    if(config.token != null) {
        url += "&token="+encodeURIComponent(config.token)
    }

    if(blank != "_blank") {
        location.assign(url)
    } else {
        window.open(
            url,
            "_blank",
            "menubar=no,toolbar=no,location=no,personalbar=no,directories=no"
        )
    }
}

KonnectedPay.getPaymentResults = function (method)
{
    var results
    switch(method.toLowerCase()) {
        case "get":
            results = getParams().KonnectedPayResp
            break
        case "hash":
            results = hashParams().KonnectedPayResp
            break
        case "post":
            throw new Error("Please retrieve POST results on your server")
        default:
            throw new Error("Invalid method")
    }

    if(!results) return null
    else {
        try { return JSON.parse(results) }
        catch (e) { throw new Error("Invalid results: "+results) }
    }
}

KonnectedPay.getTokens = function (clientSecret, userId, callback)
{
    var url = SERVER + "/payment/token/" + encodeURIComponent(userId) + "?clientSecret=" + encodeURIComponent(clientSecret)

    var req = new XMLHttpRequest()
    req.onreadystatechange = function () {
        switch(req.readyState) {
            case 4: // DONE
                if(req.status < 200 || req.status >= 300) {
                    callback(false, "Failed to retrieve tokens")
                } else {
                    try {
                        var obj = JSON.parse(this.responseText)
                        if(obj === null) obj = []
                        if(typeof obj != "object" || !(obj instanceof Array)) {
                            throw new Error("Response should be an array")
                        }
                    } catch (e) {
                        callback(false, (e && e.message) || "Invalid response from server")
                        return
                    }

                    callback(
                        true,
                        obj.map(function (card) {
                            return {
                                token: card.token,
                                maskCard: card.maskCard,
                                maskCardType: card.maskCardType,
                            };
                        })
                    )
                }

                break
        }
    };
    req.open("GET", url)
    req.send()
}

KonnectedPay.deleteToken = function (clientSecret, userId, token, callback)
{
    var url = SERVER
            + "/payment/token/" + encodeURIComponent(userId)
            + "/" + encodeURIComponent(token)
            + "?clientSecret=" + encodeURIComponent(clientSecret);

    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        switch(req.readyState) {
            case 4: // DONE
                if(req.status >= 200 && req.status < 300) {
                    callback(true);
                } else {
                    var obj;
                    try { obj = JSON.parse(this.responseText) }
                    catch (e) {}
                    callback(false, (obj && obj.error) || "Failed to delete token");
                }

                break;
        }
    };
    req.open("DELETE", url);
    req.send();
}

})(); // end file-local scope
