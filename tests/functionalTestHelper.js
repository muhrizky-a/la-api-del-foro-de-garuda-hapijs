module.exports = {
    _addUser: async ({
        server,
        username = 'dicoding',
        password = 'secret',
        fullname = 'Dicoding Indonesia',
    }) => {
        await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username,
                password,
                fullname,
            },
        });
    }, _login: async ({
        server,
        username = 'dicoding',
        password = 'secret',
    }) => server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
            username,
            password,
        },
    }),
}