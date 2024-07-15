const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const { _addUser, _login } = require('../../../../tests/functionalTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const _addThread = async ({ server, requestPayload, accessToken }) => server.inject({
    method: 'POST',
    url: '/threads',
    payload: requestPayload,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const _addComment = async ({
    server,
    threadId,
    accessToken,
  }) => server.inject({
    method: 'POST',
    url: `/threads/${threadId}/comments`,
    payload: {
      content: 'Un Comentario',
    },
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Un Hilo',
        body: 'Un Contenido',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _addThread({ server, requestPayload, accessToken });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Un Hilo',
      };
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _addThread({ server, requestPayload, accessToken });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'Un Hilo',
        body: 123,
      };
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _addThread({ server, requestPayload, accessToken });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/:id', () => {
    it('should response 200 and return thread with two comments', async () => {
      // Arrange
      const addThreadRequestPayload = {
        title: 'Un Hilo',
        body: 'Un Contenido',
      };
      const server = await createServer(container);
      /// add user dicoding
      await _addUser({ server });
      /// add user john
      await _addUser({
        server,
        username: 'john',
        fullname: 'John Rambo',
      });
      /// login user dicoding
      const loginResponseDicoding = await _login({ server });
      const {
        data: { accessToken: accessTokenDicoding },
      } = JSON.parse(loginResponseDicoding.payload);
      /// login user john
      const loginResponseJohn = await _login({
        server,
        username: 'john',
      });
      const { data: { accessToken: accessTokenJohn } } = JSON.parse(loginResponseJohn.payload);
      /// add new thread (dicoding)
      const addThreadResponse = await _addThread({
        server,
        requestPayload: addThreadRequestPayload,
        accessToken: accessTokenDicoding,
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

      /// add new (two) comments
      await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      await _addComment({
        server,
        threadId,
        accessToken: accessTokenJohn,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
    });

    it('should response 200 and return thread with two comments, including deleted comment', async () => {
      // Arrange
      const addThreadRequestPayload = {
        title: 'Un Hilo',
        body: 'Un Contenido',
      };
      const server = await createServer(container);
      /// add user dicoding
      await _addUser({ server });
      /// add user john
      await _addUser({
        server,
        username: 'john',
        fullname: 'John Rambo',
      });
      /// login user dicoding
      const loginResponseDicoding = await _login({ server });
      const {
        data: { accessToken: accessTokenDicoding },
      } = JSON.parse(loginResponseDicoding.payload);
      /// login user john
      const loginResponseJohn = await _login({
        server,
        username: 'john',
      });
      const { data: { accessToken: accessTokenJohn } } = JSON.parse(loginResponseJohn.payload);
      /// add new thread (dicoding)
      const addThreadResponse = await _addThread({
        server,
        requestPayload: addThreadRequestPayload,
        accessToken: accessTokenDicoding,
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

      /// add new (two) comments
      await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const addSecondCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenJohn,
      });
      const secondCommentId = JSON.parse(addSecondCommentResponse.payload).data.addedComment.id;
      /// delete john comment (john)
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${secondCommentId}`,
        headers: {
          authorization: `Bearer ${accessTokenJohn}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const deletedComment = [...responseJson.data.thread.comments].pop();

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      /// check the deleted comment
      expect(deletedComment).toStrictEqual({
        id: secondCommentId,
        username: 'john',
        date: deletedComment.date,
        content: '**komentar telah dihapus**',
      });
    });

    it('should response 404 when thread not exists', async () => {
      // Arrange
      const nonexistentThreadId = 'thread-xxxxx';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${nonexistentThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
