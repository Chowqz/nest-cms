import { HttpException, HttpStatus } from '@nestjs/common'

export interface BusinessError {
  code: number
  msg: string
}

export class BusinessException extends HttpException {
  readonly bizCode: number

  constructor(error: BusinessError | string) {
    if (typeof error === 'string') {
      super(
        HttpException.createBody(error, 'Business Error', HttpStatus.OK),
        HttpStatus.OK,
      )
      this.bizCode = -1
      return
    }

    super(
      HttpException.createBody(error.msg, 'Business Error', HttpStatus.OK),
      HttpStatus.OK,
    )
    this.bizCode = error.code
  }
}
