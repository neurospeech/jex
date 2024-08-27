export default [
    {
        id: "com.android.app",
        name: "App Name",

        url: "https://com.android.app/",

        publish: true,
    
        targetFramework: "net8.0-android34.0",
    
        androidSdkRoot: readEnv("ANDROID_SDK_ROOT"),
        javaHome: readEnv("JAVA_HOME_17_X64", readEnv("JAVA_HOME")),
    
        androidKeyStore: resolve("./cert/android.keystore"),
        androidSigningKeyAlias: readEnv("SIGNING_KEY_ALIAS"),

        androidKeyStorePassword: readEnv("KEYSTORE_PASSWORD"),
        serviceAccountJsonRaw: readEnv("PLAYSTORE_SERVICE_ACCOUNT_JSON_TEXT", ""),
        serviceAccountJson: readEnv("PLAYSTORE_SERVICE_ACCOUNT_JSON_FILE", ""),
    
        /**
         * could be timestamp or patch.
         * timestamp will use current DATE and TIME in Seconds.
         * patch will parse number from package.json's version
         */
        buildNumber: "patch"

    }
];