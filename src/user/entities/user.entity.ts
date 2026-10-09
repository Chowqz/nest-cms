import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { RoleType } from '@/enum/user.enum'

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number

  @Column({ name: 'user_name', type: 'varchar', length: 50 })
  userName: string

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ name: 'role_id', type: 'int' })
  roleId: RoleType

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date
}
