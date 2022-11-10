import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()

  if (!data) return req.user

  return req.user[data]
})
