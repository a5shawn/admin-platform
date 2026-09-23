import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from './../src/app.module'
import { UserResponseDto } from './../src/modules/user/dto/user-response.dto'
import { UserStatus } from './../src/modules/user/entities/user.entity'

/** 每个用例都用独立的应用实例，等价于「刚启动的进程」 */
async function createApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  await app.init()
  return app
}

describe('UserController (e2e)', () => {
  // setup-env.ts 里把 USER_SEED_SIZE 固定为 2
  const SEED_SIZE = 2
  let app: INestApplication<App>

  beforeEach(async () => {
    app = await createApp()
  })

  afterEach(async () => {
    await app.close()
  })

  const server = () => app.getHttpServer()

  describe('GET /users（列表）', () => {
    it('返回种子用户，且不含 passwordHash', async () => {
      const response = await request(server()).get('/users').expect(200)
      const users = response.body as UserResponseDto[]

      expect(users).toHaveLength(SEED_SIZE)
      expect(users.map((user) => user.username)).toEqual(['admin', 'operator'])
      expect(users[0]).not.toHaveProperty('passwordHash')
    })

    it('keyword 过滤生效', async () => {
      const response = await request(server())
        .get('/users')
        .query({ keyword: 'oper' })
        .expect(200)
      const users = response.body as UserResponseDto[]

      expect(users.map((user) => user.username)).toEqual(['operator'])
    })

    it('种子条数由 .env 的 USER_SEED_SIZE 决定（证明 useFactory 读到了配置）', async () => {
      expect(process.env.USER_SEED_SIZE).toBe(String(SEED_SIZE))

      const response = await request(server()).get('/users').expect(200)
      expect(response.body as UserResponseDto[]).toHaveLength(SEED_SIZE)
    })
  })

  describe('GET /users/:id（详情）', () => {
    it('返回指定用户', async () => {
      const response = await request(server()).get('/users/1').expect(200)
      const user = response.body as UserResponseDto

      expect(user).toMatchObject({
        id: 1,
        username: 'admin',
        status: UserStatus.ACTIVE,
      })
    })

    it('不存在时返回 404', async () => {
      await request(server()).get('/users/9999').expect(404)
    })

    it('id 不是数字时返回 400（ParseIntPipe）', async () => {
      await request(server()).get('/users/abc').expect(400)
    })
  })

  describe('POST /users（创建）', () => {
    it('创建成功返回 201 与脱敏后的用户', async () => {
      const response = await request(server())
        .post('/users')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          nickname: '测试号',
          password: '123456',
        })
        .expect(201)
      const created = response.body as UserResponseDto

      expect(created).toMatchObject({
        username: 'tester',
        email: 'tester@example.com',
        nickname: '测试号',
        status: UserStatus.ACTIVE,
      })
      expect(created).not.toHaveProperty('passwordHash')
    })

    it('用户名重复返回 409', async () => {
      await request(server())
        .post('/users')
        .send({
          username: 'admin',
          email: 'another@example.com',
          nickname: '撞名',
          password: '123456',
        })
        .expect(409)
    })
  })

  describe('PATCH /users/:id（更新）', () => {
    it('只改昵称，邮箱保持原值', async () => {
      const response = await request(server())
        .patch('/users/1')
        .send({ nickname: '改过的昵称' })
        .expect(200)
      const updated = response.body as UserResponseDto

      expect(updated.nickname).toBe('改过的昵称')
      expect(updated.email).toBe('admin@example.com')
    })

    it('用户不存在返回 404', async () => {
      await request(server())
        .patch('/users/9999')
        .send({ nickname: 'x' })
        .expect(404)
    })
  })

  describe('PATCH /users/:id/status（启用 / 禁用）', () => {
    it('可禁用再启用', async () => {
      const disabled = await request(server())
        .patch('/users/1/status')
        .send({ status: UserStatus.DISABLED })
        .expect(200)
      expect((disabled.body as UserResponseDto).status).toBe(
        UserStatus.DISABLED,
      )

      const enabled = await request(server())
        .patch('/users/1/status')
        .send({ status: UserStatus.ACTIVE })
        .expect(200)
      expect((enabled.body as UserResponseDto).status).toBe(UserStatus.ACTIVE)
    })
  })

  describe('DELETE /users/:id（删除）', () => {
    it('删除成功返回 { success: true }，列表随之减少', async () => {
      const response = await request(server()).delete('/users/2').expect(200)
      expect(response.body).toEqual({ success: true })

      const list = await request(server()).get('/users').expect(200)
      expect(list.body as UserResponseDto[]).toHaveLength(SEED_SIZE - 1)
    })

    it('重复删除返回 404', async () => {
      await request(server()).delete('/users/2').expect(200)
      await request(server()).delete('/users/2').expect(404)
    })
  })

  describe('内存版特性：重启即丢数据（M2 验收项）', () => {
    it('新建的用户在应用重启后不复存在，只剩种子数据', async () => {
      const first = await createApp()
      await request(first.getHttpServer())
        .post('/users')
        .send({
          username: 'volatile',
          email: 'volatile@example.com',
          nickname: '易失',
          password: '123456',
        })
        .expect(201)

      const beforeRestart = await request(first.getHttpServer())
        .get('/users')
        .expect(200)
      expect(beforeRestart.body as UserResponseDto[]).toHaveLength(
        SEED_SIZE + 1,
      )
      await first.close()

      const second = await createApp()
      const afterRestart = await request(second.getHttpServer())
        .get('/users')
        .expect(200)
      const users = afterRestart.body as UserResponseDto[]

      expect(users).toHaveLength(SEED_SIZE)
      expect(users.map((user) => user.username)).not.toContain('volatile')
      await second.close()
    })
  })
})
