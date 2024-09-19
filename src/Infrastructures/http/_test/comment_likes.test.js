const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const { _addUser, _login } = require('../../../../tests/functionalTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/:threadId/comments/:commentId/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const _addThread = async ({
    server,
    accessToken,
  }) => server.inject({
    method: 'POST',
    url: '/threads',
    payload: {
      title: 'Un Hilo',
      body: 'Un Contenido',
    },
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

  const _likeComment = async ({
    server,
    threadId,
    commentId,
    accessToken,
  }) => server.inject({
    method: 'PUT',
    url: `/threads/${threadId}/comments/${commentId}/likes`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  describe('when PUT /threads/:threadId/comments/:commentId/likes', () => {
    it('should response 200 if like comment succesfully', async () => {
      // Arrange
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _likeComment({
        server,
        threadId,
        commentId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 if john like comment made by dicoding', async () => {
      // Arrange
      const server = await createServer(container);
      /// add user
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
        accessToken: accessTokenDicoding,
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment (dicoding)
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _likeComment({
        server,
        threadId,
        commentId,
        accessToken: accessTokenJohn,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 if unlike comment succesfully', async () => {
      // Arrange
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      await _likeComment({
        server,
        threadId,
        commentId,
        accessToken,
      });
      const response = await _likeComment({
        server,
        threadId,
        commentId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 if john unlike comment made by dicoding', async () => {
      // Arrange
      const server = await createServer(container);
      /// add user
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
        accessToken: accessTokenDicoding,
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment (dicoding)
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      await _likeComment({
        server,
        threadId,
        commentId,
        accessToken: accessTokenJohn,
      });
      const response = await _likeComment({
        server,
        threadId,
        commentId,
        accessToken: accessTokenJohn,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when authentication is empty', async () => {
      // Arrange
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _likeComment({
        server,
        threadId,
        commentId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('access token tidak valid');
    });

    it('should response 401 when include tampered authentication', async () => {
      // Arrange
      const tamperedAccessToken = 'tampered_access_token';
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _likeComment({
        server,
        threadId,
        commentId,
        accessToken: `${accessToken}-${tamperedAccessToken}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('access token tidak valid');
    });

    it('should response 404 when thread not exists', async () => {
      // Arrange
      const nonexistentThreadId = 'thread-xxxxx';
      const nonexistentCommentId = 'comment-xxxxx';
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _likeComment({
        server,
        threadId: nonexistentThreadId,
        commentId: nonexistentCommentId,
        accessToken,
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
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

      // Action
      const response = await _likeComment({
        server,
        threadId,
        commentId: nonexistentCommentId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });
});
