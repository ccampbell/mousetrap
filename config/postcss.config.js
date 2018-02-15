module.exports = () => ({
    plugins: [
        require('postcss-easy-import')(),
        require('postcss-cssnext')({
            features: {
                autoprefixer: {
                    browsers: [
                        "> 1%",
                        "last 2 versions"
                    ],
                    cascade: false
                }
            }
        })
    ]
});
