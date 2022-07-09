import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AdminCourseService from './AdminCourseService';
// import VideoCallValidator from './VideoCallValidator';
export default class AdminCourseController {
  private adminCourseService : AdminCourseService
  // private videoCallValidator : VideoCallValidator
  constructor () {
    this.adminCourseService =  new AdminCourseService()
    // this.videoCallValidator =  new VideoCallValidator()
  }
  public async getAllCarevanCourse(ctx : HttpContextContract) {
    return this.adminCourseService.getAllCarevanCourse(ctx)
  }
  public async getCarevanCourse(ctx : HttpContextContract) {
    return this.adminCourseService.getCarevanCourse(ctx)
  }
  public async getCourseDetailsById(ctx : HttpContextContract) {
    return this.adminCourseService.getCourseDetailsById(ctx)
  }
  public async editCarevan(ctx : HttpContextContract) {
    return this.adminCourseService.editCarevan(ctx)
  }
  public async sortCarevan(ctx : HttpContextContract) {
    return this.adminCourseService.sortCarevan(ctx)
  }
  public async editTraining(ctx : HttpContextContract) {
    return this.adminCourseService.editTraining(ctx)
  }
  public async createarevanCourse(ctx : HttpContextContract) {
    return this.adminCourseService.createarevanCourse(ctx)
  }
  public async deleteCarevan(ctx : HttpContextContract) {
    return this.adminCourseService.deleteCarevan(ctx)
  }
  public async uploadImageToVulterObject(ctx : HttpContextContract) {
    return this.adminCourseService.uploadImageToVulterObject(ctx)
  }
  public async courseSubscribers(ctx : HttpContextContract) {
    return this.adminCourseService.courseSubscribers(ctx)
  }
  public async countAllActiveUsers() {
    return this.adminCourseService.countAllActiveUsers()
  }
  public async yearlySubscribers(ctx : HttpContextContract) {
    return this.adminCourseService.yearlySubscribers(ctx)
  }

  public async createNarCourse(ctx : HttpContextContract) {
    return this.adminCourseService.createNarCourse(ctx)
  }
  public async getAllNarCourse(ctx : HttpContextContract) {
    return this.adminCourseService.getAllNarCourse(ctx)
  }
  public async getSingleNarCourse(ctx : HttpContextContract) {
    return this.adminCourseService.getSingleNarCourse(ctx)
  }
  public async editNarCourse(ctx : HttpContextContract) {
    return this.adminCourseService.editNarCourse(ctx)
  }
  public async deleteNarCourse(ctx : HttpContextContract) {
    return this.adminCourseService.deleteNarCourse(ctx)
  }
  public async createPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.createPreLicensing(ctx)
  }
  public async getAllLimitPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.getAllLimitPreLicensing(ctx)
  }
  public async getAllPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.getAllPreLicensing(ctx)
  }
  public async getSinglePreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.getSinglePreLicensing(ctx)
  }
  public async editPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.editPreLicensing(ctx)
  }
  public async deletePreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.deletePreLicensing(ctx)
  }
  public async sortPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.sortPreLicensing(ctx)
  }



  public async reorderCourse(ctx : HttpContextContract) {
    return this.adminCourseService.reorderCourse(ctx)
  }
  public async reorderPreLicensing(ctx : HttpContextContract) {
    return this.adminCourseService.reorderPreLicensing(ctx)
  }

}
