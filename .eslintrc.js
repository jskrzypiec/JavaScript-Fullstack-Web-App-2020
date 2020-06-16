module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/essential",
        "@vue/standard"
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "prefer-const": 0,
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        quotes: [
            "error",
            "double"
        ],
        semi: [
            "error",
            "always"
        ],
        indent: [
            "error",
            4
        ],
        "brace-style": [
            "error",
            "1tbs"
        ]
    }
};