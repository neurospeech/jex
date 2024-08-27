export default [
    {
        id: "com.android.app",
        name: "App Name",

        url: "https://com.android.app/",

        publish: true,
    
        certPath: "./cert/ios-distribution.p12",
        certPass: readEnv("APPLE_DISTRIBUTION_CERT_PASS"),
        provisioningProfileFile: readEnv("MOBILE_PROVISIONING_PROFILE", "./cert/ios-app.mobileprovision"),
    
        appStoreConnect: {
            apiKeyId: readEnv("APP_STORE_CONNECT_KEY_ID"),
            issuerId: readEnv("APP_STORE_CONNECT_ISSUER_ID"),
            privateKey: readEnv("APP_STORE_CONNECT_PRIVATE_KEY")
        },
        
        /**
         * could be timestamp or patch.
         * timestamp will use current DATE and TIME in Seconds.
         * patch will parse number from package.json's version
         */
        buildNumber: "patch"

    }
];