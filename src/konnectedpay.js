"use strict"

window.KonnectedPay = window.KonnectedPay || {}
;(function () { // file-local scope...

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

KonnectedPay.requestPayment = function (config, blank)
{
    validateConfig(config)

    var url = "https://pay.appxtream.com/payment"
            + "?tranId="+encodeURIComponent(config.transId)
            + "&amount="+encodeURIComponent(config.amount)
            + "&currencyCode="+encodeURIComponent(config.currencyCode)
            + "&merchantId="+encodeURIComponent(config.merchantId)
            + "&device="+encodeURIComponent()
            + "&os="+encodeURIComponent()
            + "&returnMethod="+encodeURIComponent(config.responseMethod)
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

})(); // end file-local scope
