module.exports = {
    networks: {
        development: {
            protocol: 'http',
            host: 'localhost',
            port: 9545,
            gas: 5000000,
            gasPrice: 5e9,
            networkId: '*',
        },
    },
};
