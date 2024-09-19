const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const { _addUser, _login } = require('../../../../tests/functionalTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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

  const _addReply = async ({
    server,
    threadId,
    commentId,
    accessToken,
  }) => server.inject({
    method: 'POST',
    url: `/threads/${threadId}/comments/${commentId}/replies`,
    payload: {
      content: 'Una Respuesta',
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

    it('should response 401 when authentication is empty', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await _addThread({ server });

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

      // Action
      const response = await _addThread({ server, accessToken: tamperedAccessToken });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('access token tidak valid');
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
      const addFirstCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const firstCommentId = JSON.parse(addFirstCommentResponse.payload).data.addedComment.id;

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
      const [firstComment, deletedComment] = responseJson.data.thread.comments;

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      /// check the comments
      expect(firstComment).toStrictEqual({
        id: firstCommentId,
        username: 'dicoding',
        date: firstComment.date,
        content: 'Un Comentario',
        replies: [],
        likeCount: 0,
      });
      expect(deletedComment).toStrictEqual({
        id: secondCommentId,
        username: 'john',
        date: deletedComment.date,
        content: '**komentar telah dihapus**',
        replies: [],
        likeCount: 0,
      });
    });

    it('should response 200 and return thread with a comments, a reply and a deleted reply', async () => {
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

      /// add reply (dicoding)
      const addCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

      /// add (two) new replies
      const addFirstReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        accessToken: accessTokenDicoding,
      });
      const firstReplyId = JSON.parse(addFirstReplyResponse.payload).data.addedReply.id;
      const addSecondReplyResponse = await _addReply({
        server,
        threadId,
        commentId,
        accessToken: accessTokenJohn,
      });
      const secondReplyId = JSON.parse(addSecondReplyResponse.payload).data.addedReply.id;

      /// delete john reply (john)
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${secondReplyId}`,
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
      /// get the sole comment
      const comment = [...responseJson.data.thread.comments].pop();
      const { replies } = comment;
      const [firstReply, deletedReply] = replies;

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();

      /// check the comments
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(comment).toStrictEqual({
        id: comment.id,
        username: 'dicoding',
        date: comment.date,
        content: 'Un Comentario',
        replies: [
          {
            id: firstReplyId,
            username: 'dicoding',
            date: firstReply.date,
            content: 'Una Respuesta',
          },
          {
            id: secondReplyId,
            username: 'john',
            date: deletedReply.date,
            content: '**balasan telah dihapus**',
          },
        ],
        likeCount: 0,
      });

      /// check the replies
      expect(replies).toHaveLength(2);
      expect(firstReply).toStrictEqual({
        id: firstReplyId,
        username: 'dicoding',
        date: firstReply.date,
        content: 'Una Respuesta',
      });
      expect(deletedReply).toStrictEqual({
        id: secondReplyId,
        username: 'john',
        date: deletedReply.date,
        content: '**balasan telah dihapus**',
      });
    });

    it(`should response 200 and return thread with 3 comments,
      with each 2 likes, 1 like, and 1 like from deleted comment`,
    async () => {
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
      const addFirstCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenDicoding,
      });
      const firstCommentId = JSON.parse(addFirstCommentResponse.payload).data.addedComment.id;

      const addSecondCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenJohn,
      });
      const secondCommentId = JSON.parse(addSecondCommentResponse.payload).data.addedComment.id;

      const addThirdCommentResponse = await _addComment({
        server,
        threadId,
        accessToken: accessTokenJohn,
      });
      const thirdComentId = JSON.parse(addThirdCommentResponse.payload).data.addedComment.id;

      /// like dicoding comment (dicoding, john)
      await _likeComment({
        server,
        threadId,
        commentId: firstCommentId,
        accessToken: accessTokenDicoding,
      });
      await _likeComment({
        server,
        threadId,
        commentId: firstCommentId,
        accessToken: accessTokenJohn,
      });

      /// like john comment (dicoding, john)
      await _likeComment({
        server,
        threadId,
        commentId: secondCommentId,
        accessToken: accessTokenDicoding,
      });
      await _likeComment({
        server,
        threadId,
        commentId: secondCommentId,
        accessToken: accessTokenJohn,
      });
      /// unlike john comment (dicoding)
      await _likeComment({
        server,
        threadId,
        commentId: secondCommentId,
        accessToken: accessTokenDicoding,
      });

      /// like, unlike, like again second john comment (dicoding)
      const likeTimes = 3;
      const likesPromises = []; // Array to hold the promises
      for (let i = 1; i <= likeTimes; i += 1) {
        likesPromises.push(
          _likeComment({
            server,
            threadId,
            commentId: thirdComentId,
            accessToken: accessTokenDicoding,
          }),
        );
      }
      await Promise.all(likesPromises);

      // delete second john comment (john)
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${thirdComentId}`,
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
      const [firstComment, secondComment, deletedComment] = responseJson.data.thread.comments;

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);

      /// check the comments
      expect(firstComment).toStrictEqual({
        id: firstCommentId,
        username: 'dicoding',
        date: firstComment.date,
        content: 'Un Comentario',
        replies: [],
        likeCount: 2,
      });
      expect(secondComment).toStrictEqual({
        id: secondCommentId,
        username: 'john',
        date: secondComment.date,
        content: 'Un Comentario',
        replies: [],
        likeCount: 1,
      });
      expect(deletedComment).toStrictEqual({
        id: thirdComentId,
        username: 'john',
        date: deletedComment.date,
        content: '**komentar telah dihapus**',
        replies: [],
        likeCount: 1,
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
