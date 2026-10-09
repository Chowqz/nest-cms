import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 200 })
  description: string

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date
}
