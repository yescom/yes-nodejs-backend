const config = require('../config/config');

var fs = require('fs');
var express = require('express');
var router = express.Router();
const got = require('got');

const { Issuer } = require('openid-client');
const { generators } = require('openid-client');
const { custom } = require('openid-client');


/**
 * Return the Account Chooser URL to the frontend
 * URL includes client_id and may be diffent based on environment
 */
router.get('/acurl', (req, res) => {
    // console.log('GET /acurl');
    let acUrl = new URL(config.yes.ac_uri);
    acUrl.searchParams.set('client_id', config.yes.client_id);
    return res.send({
        acUrl: acUrl
    });
});

/**
 * yes® account chooser callback
 *   get banks issuer_url
 *   discover OpenID connect op metadata
 *   create authorization request and redirect to banks authorization endpoint
 */
router.get('/accb', (req, res) => {

    // error handling
    if ('error' in req.query) {
        return res.send(req.query);
    }

    //Check Issuer Call
    let ciUrl = new URL(config.yes.ci_uri);
    ciUrl.searchParams.set('iss', req.query.issuer_url);
    got(ciUrl).then(ci_res => {
        if (ci_res.statusCode !== 204) {
            return console.log("Issuer URL not valid; status code " + ci_res.statusCode);
        }
        
        // get op metadata
        Issuer.discover(req.query.issuer_url) // => Promise
            .then( yesIssuer => {
                var client = new yesIssuer.Client({
                    client_id: config.yes.client_id,
                    redirect_uris: config.yes.redirect_uris,
                    response_types: ['code'],
                    token_endpoint_auth_method: "self_signed_tls_client_auth"
                });
                
                
                // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
                // it should be httpOnly (not readable by javascript) and encrypted.
                const code_verifier = generators.codeVerifier();
                const code_challenge = generators.codeChallenge(code_verifier);

                // set session data
                let sess = {
                    code_verifier: code_verifier,
                    issuer: yesIssuer
                }
                req.session.yes = sess;
                
                // prepare request
                const authzUrl = client.authorizationUrl({
                    scope: config.yes.scope,
                    claims: config.yes.claims,
                    code_challenge,
                    code_challenge_method: 'S256',
                    acr_values: config.yes.acr_values,
                });

                // redirect to bank IDP
                res.writeHead(302, {'Location': authzUrl});
                res.end();

            }).catch(error => {
                console.log(error);
                return res.send(error);
            });

    });
    
});


/**
 * yes® OpenID connect callback
 *   get authorization code from code query parameter
 *   use authorization code with code grant on banks token endpoint
 *   get verified userdata from id_token
 */
router.get('/oidccb', (req, res) => {

    if (req.query.iss !== req.session.yes.issuer.issuer) {
        return res.send("Error: Wrong value in iss parameter.");
    }

    // error handling
    if ('error' in req.query) {
        if (req.query.error === 'account_selection_requested') {
            let acUrl = new URL(config.yes.ac_uri);
            acUrl.searchParams.set('client_id', config.yes.client_id);
            acUrl.searchParams.set('prompt', 'select_account');
            return res.redirect(acUrl);
        }
        return res.send(req.query);
    }

    Issuer.discover(req.session.yes.issuer.issuer) // => Promise
        .then(yesIssuer => {
            var client = new yesIssuer.Client({
                client_id: config.yes.client_id,
                redirect_uris: config.yes.redirect_uris,
                response_types: ['code'],
                token_endpoint_auth_method: "self_signed_tls_client_auth"
            });

            client[custom.http_options] = (options) => {
                // see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
                // key, cert, ca, rejectUnauthorized
                try {
                    var cert = fs.readFileSync(__dirname + '/../config/' + config.yes.tls_cert, 'utf8');
                    var key = fs.readFileSync(__dirname + '/../config/' + config.yes.tls_key, 'utf8');
                } catch (e) {
                    console.log('Error:', e.stack);
                }
                options.cert = cert; // <string> | <string[]> | <Buffer> | <Buffer[]>
                options.key = key; // <string> | <string[]> | <Buffer> | <Buffer[]> | <Object[]>
                return options;
            }

            const params = client.callbackParams(req);
            client.callback(config.yes.redirect_uris, params, {code_verifier: req.session.yes.code_verifier}) // => Promise
                .then( (tokenSet) => {
                    // console.log('received and validated tokens %j', tokenSet);
                    // console.log('validated ID Token claims %j', tokenSet.claims());

                    // add user data to session
                    // set session data
                    req.session.claims = tokenSet.claims();
                    // console.log(tokenSet.id_token.toString());
                    req.session.id_token = tokenSet.id_token.toString();

                    return res.redirect(config.yes.nextUrl);
                });
        }).catch(error => {
            console.log(error);
            return res.send(error);
        });
});


/**
 * Return the session status to the frontend
 */
router.get('/session/claims', (req, res) => {
    // console.log('GET /session/claims');
    if ('claims' in req.session) {
        return res.send(req.session.claims);
    }
    return res.send({});
});

/**
 * logout - destroy session
 */
router.get('/logout', (req, res) => {
    // console.log('GET /logout');
    req.session.destroy();
    return res.send('');
});

module.exports = router;
