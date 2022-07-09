import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column  } from '@ioc:Adonis/Lucid/Orm'

import User from './User';
import Course from './Course';

export default class CourseSubscriber extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public course_id: number

  @column()
  public user_id: number

  @column()
  public coupon: string

  @column()
  public type: string

  @column()
  public isActive: number

  @column()
  public expired_at: Date

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Course, {
    foreignKey: 'course_id',
  })
  public course: BelongsTo<typeof Course>
}
