# Introduction 
Proof of Concept OpenID Connect client for getting verified person data by using [yes®](https://www.yes.com) 

# Note

This is a proof-of-concept implementation lacking important features, in particular:

* error handling,
* logging,
* security checks,
* and potentially others.

Please consult the yes® developer guide to ensure that all security checks are in place.

# Getting Started

## Run

```
npm install && npm esm index.js
open http://localhost:3000/
```

## Use

* Click yes® link
* Search for "testidp1"
* Username for the login is "test001"

Use https://accounts.sandbox.yes.com/cookie to delete the cookie for the bank selection (error handling for choose another bank button is not implemented yet) and see yes® Account Chooser again.

## Configuration

See [config/config.js](config/config.js).

Additionally, following configurations can be set using environment variables:

* `PORT`: The network port, the service shoult bind to
* `YES_CLIENT_ID`: The yes® `client_id`
* `YES_OIDC_REDIRECT_URI`: The `redirect_uri` used in OIDC code flow.  
Must also be configured for the used client_id at yes®.
* `YES_NEXT_URL`: The URL to redirect after successful person verification

Example:

```bash
export PORT=4000
export YES_CLIENT_ID=sandbox.yes.com:5e819613-ee50-46a9-888b-3b38c89153e6
export YES_OIDC_REDIRECT_URI=https://adhocdoc.azurewebsites.net/yes/oidccb
export YES_NEXT_URL=https://adhocdoc.azurewebsites.net/

npm start
```

# Endpoints

* `/yes/acurl` 
Returns the yes® Account Chooser URL for the yes® button
* `/yes/accb`  
the callback from the yes® Account Chooser
Parameter: `issuer_url`
* `/yes/oidccb`  
the callback from the yes® IDP
Parameter: `code`
* `/yes/session/claims`  
Returns the claims available in the current session
* `/yes/logout`  
Destroy session

# Notes

* key.pem usually should kept secret and not commited to the repository. E.g. use secrets in a K8s environment to mount it into a Docker container. 
