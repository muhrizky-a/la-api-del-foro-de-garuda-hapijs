const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const { _addUser, _login } = require('../../../../tests/functionalTestHelper');
const container = require('../../container');
const createServer = require('../createServer');


describe('/threads/:id/comments endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await ThreadCommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });



    const _addThread = async ({
        server,
        accessToken
    }) => server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
            title: 'Un Hilo',
            body: 'Un Contenido',
        },
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    });

    const _addComment = async ({
        server,
        threadId,
        requestPayload,
        accessToken
    }) => server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    });

    const _deleteComment = async ({
        server,
        threadId,
        commentId,
        accessToken
    }) => server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    });


    describe('when POST /threads/:id/comments', () => {
        it('should response 201 and persisted comment', async () => {
            // Arrange
            const requestPayload = {
                content: 'Un Comentario',
            };
            // eslint-disable-next-line no-undef
            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);
            //// add new thread
            const addThreadResponse = await _addThread({ server, accessToken });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

            // Action
            const response = await _addComment({
                server,
                threadId,
                requestPayload,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment).toBeDefined();
        });

        it('should response 404 when thread not exists', async () => {
            // Arrange
            const requestPayload = {}; // mock payload
            const nonexistentThreadId = 'thread-xxxxx';

            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);

            // Action
            const response = await _addComment({
                server,
                threadId: nonexistentThreadId,
                requestPayload,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan');
        });

        it('should response 400 when request payload not contain needed property', async () => {
            // Arrange
            const requestPayload = {};

            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);
            //// add new thread
            const addThreadResponse = await _addThread({ server, accessToken });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

            // Action
            const response = await _addComment({
                server,
                threadId,
                requestPayload,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message)
                .toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
        });

        it('should response 400 when request payload not meet data type specification', async () => {
            // Arrange
            const requestPayload = {
                content: 123,
            };
            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);
            //// add new thread
            const addThreadResponse = await _addThread({ server, accessToken });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

            // Action
            const response = await _addComment({
                server,
                threadId,
                requestPayload,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
        });
    });

    describe('when DELETE /threads/:threadId/comments/:commentId', () => {
        it('should response 200 if delete comment succesfully', async () => {
            // Arrange
            const requestPayload = {
                content: 'Un Comentario',
            };
            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);
            //// add new thread
            const addThreadResponse = await _addThread({ server, accessToken });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
            /// add new comment
            const addCommentResponse = await _addComment({
                server,
                threadId,
                requestPayload,
                accessToken
            });
            const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

            // Action
            const response = await _deleteComment({
                server,
                threadId,
                commentId,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });

        it('should response 404 when thread not exists', async () => {
            // Arrange
            const nonexistentThreadId = 'thread-xxxxx';
            const nonexistentCommentId = 'comment-xxxxx';
            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);

            // Action
            const response = await _deleteComment({
                server,
                threadId: nonexistentThreadId,
                commentId: nonexistentCommentId,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan');
        });

        it('should response 404 when comment not exists', async () => {
            // Arrange
            const nonexistentCommentId = 'comment-xxxxx';
            const server = await createServer(container);
            //// add user
            await _addUser({ server });
            //// login user
            const loginResponse = await _login({ server });
            const { data: { accessToken } } = JSON.parse(loginResponse.payload);
            //// add new thread
            const addThreadResponse = await _addThread({ server, accessToken });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

            // Action
            const response = await _deleteComment({
                server,
                threadId,
                commentId: nonexistentCommentId,
                accessToken
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('comment tidak ditemukan');
        });

        it('should response 403 if user john try to delete comment made by dicoding', async () => {
            // Arrange
            const requestPayload = {
                content: 'Un Comentario',
            };
            const server = await createServer(container);
            //// add default user (username: dicoding)
            await _addUser({ server });
            //// add john user
            await _addUser({
                server,
                username: 'john',
                fullname: 'John Rambo'
            });
            //// login user dicoding
            const loginResponseDicoding = await _login({ server });
            const { data: { accessToken: accessTokenDicoding } } = JSON.parse(loginResponseDicoding.payload);
            //// login user john
            const loginResponseJohn = await _login({
                server,
                username: 'john'
            });
            const { data: { accessToken: accessTokenJohn } } = JSON.parse(loginResponseJohn.payload);
            //// add new thread (dicoding)
            const addThreadResponse = await _addThread({
                server,
                accessToken: accessTokenDicoding
            });
            const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
            /// add new comment
            const addCommentResponse = await _addComment({
                server,
                threadId,
                requestPayload,
                accessToken: accessTokenDicoding
            });
            const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

            // Action
            const response = await _deleteComment({
                server,
                threadId,
                commentId,
                accessToken: accessTokenJohn
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('anda tidak berhak mengakses comment ini');
        });
    });
});
