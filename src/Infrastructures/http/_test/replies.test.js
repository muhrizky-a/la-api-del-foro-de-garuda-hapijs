const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const { _addUser, _login } = require('../../../../tests/functionalTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/:threadId/comments/:commentId/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
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

  const _addReply = async ({
    server,
    threadId,
    commentId,
    requestPayload,
    accessToken,
  }) => server.inject({
    method: 'POST',
    url: `/threads/${threadId}/comments/${commentId}/replies`,
    payload: requestPayload,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const _deleteReply = async ({
    server,
    threadId,
    commentId,
    replyId,
    accessToken,
  }) => server.inject({
    method: 'DELETE',
    url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  describe('when POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread and comment
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when authentication is empty', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread and comment
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('access token tidak valid');
    });

    it('should response 401 when include tampered authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
      const tamperedAccessToken = 'tampered_access_token';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread and comment
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
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
      const requestPayload = {}; // mock payload
      const nonexistentThreadId = 'thread-xxxxx';
      const nonexistentCommentId = 'comment-xxxxx';

      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _addReply({
        server,
        threadId: nonexistentThreadId,
        commentId: nonexistentCommentId,
        requestPayload,
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
      const requestPayload = {}; // mock payload
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
      const response = await _addReply({
        server,
        threadId,
        commentId: nonexistentCommentId,
        requestPayload,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread and comment
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message)
        .toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread and comment
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should response 200 if delete comment succesfully', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
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
      /// add new reply
      const addReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });
      const replyId = JSON.parse(addReplyResponse.payload).data.addedReply.id;

      // Action
      const response = await _deleteReply({
        server,
        threadId,
        commentId,
        replyId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when authentication is empty', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
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
      /// add new reply
      const addReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });
      const replyId = JSON.parse(addReplyResponse.payload).data.addedReply.id;

      // Action
      const response = await _deleteReply({
        server,
        threadId,
        commentId,
        replyId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('access token tidak valid');
    });

    it('should response 401 when include tampered authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
      };
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
      /// add new reply
      const addReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken,
      });
      const replyId = JSON.parse(addReplyResponse.payload).data.addedReply.id;

      // Action
      const response = await _deleteReply({
        server,
        threadId,
        commentId,
        replyId,
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
      const nonexistentReplyId = 'reply-xxxxx';

      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await _deleteReply({
        server,
        threadId: nonexistentThreadId,
        commentId: nonexistentCommentId,
        replyId: nonexistentReplyId,
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
      const nonexistentReplyId = 'reply-xxxxx';

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
      const response = await _deleteReply({
        server,
        threadId,
        commentId: nonexistentCommentId,
        replyId: nonexistentReplyId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when reply not exists', async () => {
      // Arrange
      const nonexistentReplyId = 'reply-xxxxx';

      const server = await createServer(container);
      /// add user
      await _addUser({ server });
      /// login user
      const loginResponse = await _login({ server });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);
      /// add new thread
      const addThreadResponse = await _addThread({ server, accessToken });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      // Action
      const response = await _deleteReply({
        server,
        threadId,
        commentId,
        replyId: nonexistentReplyId,
        accessToken,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });

    it('should response 403 if user john try to delete comment made by dicoding', async () => {
      // Arrange
      const requestPayload = {
        content: 'Una Respuesta',
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
        accessToken: accessTokenDicoding,
      });
      const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;
      /// add new comment
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;
      /// add new reply
      const addReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        requestPayload,
        accessToken: accessTokenDicoding,
      });
      const replyId = JSON.parse(addReplyResponse.payload).data.addedReply.id;

      // Action
      const response = await _deleteReply({
        server,
        threadId,
        commentId,
        replyId,
        accessToken: accessTokenJohn,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses balasan ini');
    });
  });
});
