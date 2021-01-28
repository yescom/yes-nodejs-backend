module.exports = {
    serverPort: process.env.PORT || 3000,
    yes: {
        client_id: process.env.YES_CLIENT_ID || 'sandbox.yes.com:e85ff3bc-96f8-4ae7-b6b1-894d8dde9ebe',
        redirect_uris: [process.env.YES_OIDC_REDIRECT_URI || 'http://localhost:3000/yes/oidccb'],
        ac_uri: process.env.YES_AC_URL || 'https://accounts.sandbox.yes.com',
        ci_uri: process.env.YES_CI_URL || 'https://accounts.sandbox.yes.com/idp/',
        tls_cert: 'cert.pem',
        tls_key: 'key.pem',
        nextUrl: process.env.YES_NEXT_URL || 'http://localhost:3000/videocall/patient',
        scope: 'openid',
        claims: {
            "id_token": {
                "https://www.yes.com/claims/verified_person_data": {
                    "claims": {
                        "given_name": null,
                        "family_name": null,
                        "birthdate": null,
                        "https://www.yes.com/claims/place_of_birth": null,
                        "address": null
                    }
                },
                "https://www.yes.com/claims/salutation": null,
                "email": null,
                "email_verified": null,
                "https://www.yes.com/claims/title": null,
                "https://www.yes.com/claims/nationality": null
            }
        },
        acr_values: "https://www.yes.com/acrs/online_banking_sca"
    }
}
