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


User Flows
----------

### Same Window - Completed Transaction

```
Browser Window             | KonnectedPay Server      | Merchant's Server
---------------------------|--------------------------|-------------------------
Merchant's order           |                          |
summary page.              |                          |
                           |                          |
Click Pay button. Notify   |                          |
merchant server to create  |                          |
a transaction ID.          |                          |
                           |                          |
Receive transaction ID.    |                          | Generate merchant
                           |                          | transaction ID.
                           |                          |
.requestPayment()          |                          |
                           |                          |
KonnectedPay landing page. | KonnectedPay transaction |
                           | record created.          |
                           |                          |
User submits form.         |                          |
                           |                          |
... Bank pages, etc ...    |                          |
                           |                          |
                           | KonnectedPay transaction |
                           | record updated.          |
                           |                          |
                           | Send Backend POST        | Receive Backend POST.
                           |                          | Update transaction
                           |                          | status.
                           |                          |
KonnectedPay results page. |                          |
                           |                          |
Merchant's Return page.    |                          |
                           |                          |
.getPaymentResults()       |                          |
```

### Same Window - Incomplete Transaction (Back Button)

```
Browser Window             | KonnectedPay Server      | Merchant's Server
---------------------------|--------------------------|-------------------------
Merchant's order           |                          |
summary page.              |                          |
                           |                          |
Click Pay button. Notify   |                          |
merchant server to create  |                          |
a transaction ID.          |                          |
                           |                          |
Receive transaction ID.    |                          | Generate merchant
                           |                          | transaction ID.
                           |                          |
.requestPayment()          |                          |
                           |                          |
KonnectedPay landing page. | KonnectedPay transaction |
                           | record created.          |
                           |                          |
User clicks back button.   |                          |
                           |                          |
Merchant's order           |                          |
summary page.              |                          |
                           |                          |
- - - - - - - - - - - - - -|- - - - - - - - - - - - - | - - - - - - - - - - - -
                           |                          |
Click Pay button again.    |                          | Either create a new
                           |                          | transaction ID or
                           |                          | warn user that a previous
                           |                          | transaction is still in
                           |                          | progress. (You can call
                           |                          | Requery API to get current
                           |                          | payment status.)
                           |                          |
Back to normal flow if     |                          |
concurrent payment is      |                          |
allowed.                   |                          |
                           |                          |
- - - - - - - - - - - - - -|- - - - - - - - - - - - - | - - - - - - - - - - - -
                           |                          |
                           |                          | ... wait for timeout ...
                           |                          |
                           |                          | Re-query KonnectedPay
                           |                          | for payment status.
                           |                          | Update transaction
                           |                          | status.
```

**Note:** merchant's payment summary page should check for any in-progress
transaction if double purchases should be avoided. This check could be based on
user account / email address / etc at the merchant's discretion.

### Same Window - Incomplete Transaction (Closed Window)

```
Browser Window             | KonnectedPay Server      | Merchant's Server
---------------------------|--------------------------|-------------------------
Merchant's order           |                          |
summary page.              |                          |
                           |                          |
Click Pay button. Notify   |                          |
merchant server to create  |                          |
a transaction ID.          |                          |
                           |                          |
Receive transaction ID.    |                          | Generate merchant
                           |                          | transaction ID.
                           |                          |
.requestPayment()          |                          |
                           |                          |
KonnectedPay landing page. | KonnectedPay transaction |
                           | record created.          |
                           |                          |
User closes the browser    |                          |
window.                    |                          |
                           |                          |
                           |                          | ... wait for timeout ...
                           |                          |
                           |                          | Re-query KonnectedPay
                           |                          | for payment status.
                           |                          | Update transaction
                           |                          | status.
```

**Note:** merchant's payment summary page should check for any in-progress
transaction if double purchases should be avoided. This check could be based on
user account / email address / etc at the merchant's discretion.


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

Results object has this format:

```
{
    "amount": "1.00",
    "status": "S",
    "code": "0",
    "desc": "No error",
    "tranId": "PY130516085834-233100"
}
```


### getTokens

Get a list of remembered payment methods

```javascript
KonnectedPay.getTokens(clientSecret, userId, function (successful, tokens) {
    if(successful) {
        // Successfully retrieved tokens.
        // `tokens` parameter is an array of tokens.
    } else {
        // Failed to retrieve tokens.
        // `tokens` parameter is the error message.
    }
})
```


### deleteToken

Delete a previously saved token (as returned by the `.getTokens()`
function).

```javascript
KonnectedPay.deleteToken(clientSecret, userId, token, function (successful, errorMsg) {
    if(successful) {
        // Successfully deleted token.
    } else {
        // Failed to delete token.
        // `errorMsg` parameter is the error message (string).
    }
})
```
