KonnectedPay JavaScript SDK
===========================

Installation
------------

1. Check the [latest release](https://github.com/Nexstream/KonnectedPayJS/releases).
2. Download the `konnectedpay.js` or `konnectedpay.min.js` file from the latest release.
3. Add this file to your project.
4. Add this file to your HTML pages:

    ```html
        <script src="konnectedpay.js"></script>
    ```
5. Start using the [API](#api)


<a name="api"></a>
API
---

### requestPayment

```javascript
KonnectedPay.requestPayment({
    merchantId: "your konnectedpay merchant id",     // From your KonnectedPay account.
    clientSecret: "your konnectedpay client secret", // From your KonnectedPay account.
    amount: 1234.56,
    transId: "your unique transaction id",
    currencyCode: "MYR",
    fullName: "payer's full name",
    email: "payer's email address",
    userId: "your internal user ID",
    returnUrl: "http://return-to-this-url/when/payment/done/or/failed",
    responseMethod: "GET" | "POST" | "HASH" | undefined,
    rememberCard: true, // OPTIONAL. Set to false if you do NOT want to
        // remember the user's card (see Retrieving Tokenised Payment Method).
}, "_blank")
```

If `returnUrl` is not provided, the payment page will close itself after payment
completion (useful if the 2nd argument is "_blank").

If the 2nd argument is not provided, the user will be sent to the payment page
in the same window/tab. If it is set to "_blank", a new window/tab will be
opened.

Response methods (if `responseMethod` is not provided, we default to "GET"):

- GET: Payment status will be returned to your returnUrl via GET parameters.
- POST: Payment status will be POST'ed to your returnUrl.
- HASH: Payment status will be returned to your returnUrl via Hash parameters.
    e,g, "http://my-return-url/payment-received#PAYMENT_RESULTS"

Any GET/HASH parameters which already exists in your returnUrl will be
maintained - KonnectedPay's response fields are added after any existing
parameters.

**Errors:**

- This function throws JS Error objects if there are any missing/invalid fields.

**Returns:**

This function does not return anything.


### getPaymentResults

Check and retrieve KonnectedPay payment results.

```javascript
KonnectedPay.getPaymentResults("GET")
KonnectedPay.getPaymentResults("HASH")
```

**Errors:**

If a result parameter is found but the value is invalid, a JS Error object is
thrown.

**Returns:**

Returns null if there are no payment results available, the results object if a
valid result is found.
