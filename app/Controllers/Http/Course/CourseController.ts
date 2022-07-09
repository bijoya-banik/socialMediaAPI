import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CourseService from './CourseService';
import CourseValidator from './CourseValidator';
export default class CourseController {
  private CourseService : CourseService
  private CourseValidator : CourseValidator
  constructor () {
    this.CourseService =  new CourseService()
    this.CourseValidator =  new CourseValidator()
  }
  public async getCourseByType(ctx : HttpContextContract) {
    return this.CourseService.getCourseByType(ctx)
  }
  public async getMyCourseByType(ctx : HttpContextContract) {
    return this.CourseService.getMyCourseByType(ctx)
  }
  public async getAllCourseType(ctx : HttpContextContract) {
    return this.CourseService.getAllCourseType(ctx)
  }
  public async getAllCourseTypeCount(ctx : HttpContextContract) {
    return this.CourseService.getAllCourseTypeCount(ctx)
  }
  public async getCourseDetailsById(ctx : HttpContextContract) {
    return this.CourseService.getCourseDetailsById(ctx)
  }
  public async getCourseContentsById(ctx : HttpContextContract) {
    return this.CourseService.getCourseContentsById(ctx)
  }
  public async getCourseDetailsByAppId(ctx : HttpContextContract) {
    return this.CourseService.getCourseDetailsByAppId(ctx)
  }
  public async coursePaymentWeb(ctx : HttpContextContract) {
    return this.CourseService.coursePaymentWeb(ctx)
  }
  public async coursePaymentApp(ctx : HttpContextContract) {
    return this.CourseService.coursePaymentApp(ctx)
  }
  public async subscription(ctx : HttpContextContract) {
    try {
       await this.CourseValidator.validateEmail(ctx)
      return this.CourseService.subscription(ctx)
    } catch (error) {
      return ctx.response.status(422).send(error.messages)
    }
  }

}
