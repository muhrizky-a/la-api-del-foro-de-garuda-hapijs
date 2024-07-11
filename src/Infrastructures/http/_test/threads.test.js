const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
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

  const _addUser = async (server) => {
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
  };

  const _login = async (server) => server.inject({
    method: 'POST',
    url: '/authentications',
    payload: {
      username: 'dicoding',
      password: 'secret',
    },
  });

  const _addThread = async ({ server, requestPayload, accessToken }) => server.inject({
    method: 'POST',
    url: '/threads',
    payload: requestPayload,
    headers: {
      authorization: `Bearer ${accessToken}`
    }
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
      //// add user
      await _addUser(server);
      //// login user
      const loginResponse = await _login(server);
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
      //// add user
      await _addUser(server);
      //// login user
      const loginResponse = await _login(server);
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
      //// add user
      await _addUser(server);
      //// login user
      const loginResponse = await _login(server);
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
});
